import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import chessPuzzles from '../chess/chessPuzzles';
import AnimatedPage from '../components/AnimatedPage';
import { audioManager } from '../utils/audio';
import '../styles/Chess.css';

const difficultyLabel = (d) => {
  const labels = { 1: 'Beginner', 2: 'Easy', 3: 'Medium', 4: 'Hard', 5: 'Expert', 6: 'Master', 7: 'Grandmaster', 8: 'Mate in 2', 9: 'Mate in 3', 10: 'Mate in 4+', 11: 'Legendary', 12: 'Impossible' };
  return labels[d] || 'Unknown';
};

const difficultyStars = (d) => '⭐'.repeat(Math.min(d, 7));

const tierIcons = {
  1: '♟️', 2: '♞', 3: '♜', 4: '♛', 5: '♚',
  6: '🏆', 7: '👑', 8: '⚔️', 9: '🔥', 10: '💀',
  11: '🔮', 12: '🌌'
};

function getCompletedPuzzles() {
  try {
    return JSON.parse(localStorage.getItem('chess_completed') || '[]');
  } catch { return []; }
}

export default function ChessMap() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState([]);

  // Load completed puzzles & pause music
  useEffect(() => {
    setCompleted(getCompletedPuzzles());
    if (audioManager.music) audioManager.music.pause();
    return () => {
      if (!audioManager.muted && audioManager.music) {
        audioManager.music.play().catch(() => {});
      }
    };
  }, []);

  const completedCount = completed.length;

  return (
    <AnimatedPage className="chess-map">
      <button className="chess-map__back" onClick={() => navigate('/game')}>
        ← Lumina Forest
      </button>

      <div className="chess-map__header">
        <h1>♟ Chess Grandmaster Trials</h1>
        <p>100 tactical puzzles — from beginner to impossible. Find the best move!</p>
        <p style={{ color: '#22c55e', marginTop: '0.5rem', fontWeight: 600 }}>
          ✅ {completedCount} / 100 completed
        </p>
      </div>

      <div className="chess-map__grid">
        {chessPuzzles.map((puzzle) => {
          const isDone = completed.includes(puzzle.id);
          return (
            <motion.div
              key={puzzle.id}
              className={`chess-map__card ${isDone ? 'chess-map__card--completed' : ''}`}
              onClick={() => navigate(`/chess/${puzzle.id}`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="chess-map__card-icon">{tierIcons[puzzle.difficulty]}</div>
              <div className="chess-map__card-title">
                {isDone && <span className="chess-map__card-check">✅ </span>}
                #{puzzle.id} — {puzzle.title}
              </div>
              <div className="chess-map__card-theme">{puzzle.theme}</div>
              <div className="chess-map__card-diff">
                <span className="difficulty-stars">{difficultyStars(puzzle.difficulty)}</span>
                <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                  {difficultyLabel(puzzle.difficulty)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AnimatedPage>
  );
}
