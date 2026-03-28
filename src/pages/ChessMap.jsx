import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import chessPuzzles from '../chess/chessPuzzles';
import AnimatedPage from '../components/AnimatedPage';
import '../styles/Chess.css';

const difficultyLabel = (d) => {
  const labels = { 1: 'Beginner', 2: 'Easy', 3: 'Medium', 4: 'Hard', 5: 'Expert', 6: 'Master', 7: 'Grandmaster', 8: 'Mate in 2', 9: 'Mate in 3', 10: 'Mate in 4+' };
  return labels[d] || 'Unknown';
};

const difficultyStars = (d) => '⭐'.repeat(d);

const tierIcons = {
  1: '♟️',
  2: '♞',
  3: '♜',
  4: '♛',
  5: '♚',
  6: '🏆',
  7: '👑',
  8: '⚔️',
  9: '🔥',
  10: '💀'
};

export default function ChessMap() {
  const navigate = useNavigate();

  // Simple unlock: all puzzles available (can add progress tracking later)
  return (
    <AnimatedPage className="chess-map">
      <button className="chess-map__back" onClick={() => navigate('/game')}>
        ← Lumina Forest
      </button>

      <div className="chess-map__header">
        <h1>♟ Chess Grandmaster Trials</h1>
        <p>75 tactical puzzles — from beginner to grandmaster. Find the best move!</p>
      </div>

      <div className="chess-map__grid">
        {chessPuzzles.map((puzzle) => (
          <motion.div
            key={puzzle.id}
            className="chess-map__card"
            onClick={() => navigate(`/chess/${puzzle.id}`)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="chess-map__card-icon">{tierIcons[puzzle.difficulty]}</div>
            <div className="chess-map__card-title">
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
        ))}
      </div>
    </AnimatedPage>
  );
}
