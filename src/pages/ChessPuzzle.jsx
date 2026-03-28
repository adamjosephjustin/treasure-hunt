import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ChessBoard from '../chess/ChessBoard';
import chessPuzzles from '../chess/chessPuzzles';
import AnimatedPage from '../components/AnimatedPage';
import { audioManager } from '../utils/audio';
import '../styles/Chess.css';
import '../styles/PuzzleUX.css';

export default function ChessPuzzle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const puzzleId = parseInt(id);
  const puzzle = chessPuzzles.find(p => p.id === puzzleId);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);

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

  const playerColor = puzzle.fen.split(' ')[1]; // 'w' or 'b'

  const handleSolved = () => {
    audioManager.playSFX('correct');
    setSolved(true);
  };

  const handleFailed = () => {
    audioManager.playSFX('wrong');
    setAttempts(a => a + 1);
  };

  return (
    <AnimatedPage className="chess-puzzle-page">
      <button className="level__back-floating" onClick={() => {
        audioManager.playSFX('click');
        navigate('/chess');
      }}>
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

      <ChessBoard
        key={attempts} // force re-mount on retry
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
            <button className="btn-glow" onClick={() => {
              audioManager.playSFX('click');
              navigate(`/chess/${puzzleId + 1}`);
            }}>
              Next Puzzle →
            </button>
          ) : (
            <button className="btn-glow" onClick={() => {
              audioManager.playSFX('click');
              navigate('/chess');
            }}>
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
