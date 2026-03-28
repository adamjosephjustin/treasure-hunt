import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChessBoard from '../chess/ChessBoard';
import chessPuzzles from '../chess/chessPuzzles';
import AnimatedPage from '../components/AnimatedPage';
import { audioManager } from '../utils/audio';
import '../styles/Chess.css';
import '../styles/PuzzleUX.css';

function getCompletedPuzzles() {
  try {
    return JSON.parse(localStorage.getItem('chess_completed') || '[]');
  } catch { return []; }
}

function markPuzzleCompleted(id) {
  const completed = getCompletedPuzzles();
  if (!completed.includes(id)) {
    completed.push(id);
    localStorage.setItem('chess_completed', JSON.stringify(completed));
  }
}

export default function ChessPuzzle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const puzzleId = parseInt(id);
  const puzzle = chessPuzzles.find(p => p.id === puzzleId);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Reset state when puzzle id changes (fixes "Next Puzzle" not working)
  useEffect(() => {
    setSolved(false);
    setAttempts(0);
  }, [id]);

  // Pause background music on chess pages
  useEffect(() => {
    if (audioManager.music) audioManager.music.pause();
    return () => {
      if (!audioManager.muted && audioManager.music) {
        audioManager.music.play().catch(() => {});
      }
    };
  }, []);

  if (!puzzle) {
    return (
      <AnimatedPage className="chess-puzzle-page">
        <h2>Puzzle not found!</h2>
        <button className="chess-puzzle-page__nav-btn" onClick={() => navigate('/chess')}>
          Back to Chess Map
        </button>
      </AnimatedPage>
    );
  }

  const playerColor = puzzle.fen.split(' ')[1];

  const handleSolved = () => {
    setSolved(true);
    markPuzzleCompleted(puzzleId);
  };

  const handleFailed = () => {
    setAttempts(a => a + 1);
  };

  return (
    <AnimatedPage className="chess-puzzle-page">
      <button className="level__back-floating" onClick={() => navigate('/chess')}>
        🏠 Map
      </button>

      <div className="chess-puzzle-page__header">
        <h2 className="chess-puzzle-page__title">
          #{puzzle.id} — {puzzle.title}
        </h2>
        <p className="chess-puzzle-page__desc">{puzzle.description}</p>
        <span className="chess-puzzle-page__theme">{puzzle.theme}</span>
      </div>

      <div className="puzzle__instruction-box" style={{ maxWidth: '480px', textAlign: 'center' }}>
        <p><strong>{playerColor === 'w' ? 'White' : 'Black'} to move.</strong> Find the best move!</p>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Click a piece, then click the target square.</p>
      </div>

      {/* key={id + attempts} forces full re-mount when puzzle changes OR retry */}
      <ChessBoard
        key={id + '-' + attempts}
        fen={puzzle.fen}
        solution={puzzle.solution}
        playerColor={playerColor}
        onSolved={handleSolved}
        onFailed={handleFailed}
      />

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="chess-puzzle-page__actions"
        >
          {puzzleId < 100 ? (
            <button className="btn-glow" onClick={() => navigate(`/chess/${puzzleId + 1}`)}>
              Next Puzzle →
            </button>
          ) : (
            <button className="btn-glow" onClick={() => navigate('/chess')}>
              🏆 All Puzzles Complete!
            </button>
          )}

          <button className="chess-puzzle-page__nav-btn" onClick={() => navigate('/chess')}>
            Back to Map
          </button>
        </motion.div>
      )}

      {!solved && attempts > 0 && (
        <p style={{ color: '#94a3b8', marginTop: '1rem' }}>
          Attempts: {attempts} — The board resets after a wrong move. Try again!
        </p>
      )}
    </AnimatedPage>
  );
}
