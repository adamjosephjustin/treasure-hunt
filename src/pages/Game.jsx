import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { useProgress } from '../components/ProgressContext';
import Leaderboard from '../components/Leaderboard';
import '../styles/Game.css';
import '../styles/Leaderboard.css';

const levels = [
  { id: 1, icon: '🌿', title: 'Forest Entrance', desc: 'Where the journey begins' },
  { id: 2, icon: '💎', title: 'Crystal River', desc: 'Dark waters hold secrets' },
  { id: 3, icon: '🌳', title: 'Ancient Tree', desc: 'The heart of Lumina Forest' },
  { id: 4, icon: '🕳️', title: 'Whispering Caves', desc: 'Echoes of ancient runes' },
  { id: 5, icon: '🌈', title: 'Rainbow Falls', desc: 'Colors of magic flow' },
  { id: 6, icon: '✨', title: 'Starfall Peak', desc: 'Touch the night sky' },
  { id: 7, icon: '⚖️', title: 'The Silent Ruins', desc: 'Balance the ancient scales' },
  { id: 8, icon: '🪞', title: 'Forgotten Library', desc: 'Reflect the truth' },
  { id: 9, icon: '🔮', title: 'Core of Lumina', desc: 'Crack the master seal' },
  { id: 10, icon: '💧', title: 'Weeping Statues', desc: 'Measure the sacred waters' },
  { id: 11, icon: '🚪', title: 'The Locked Gate', desc: 'Align the magic square' },
  { id: 12, icon: '🌪️', title: 'Whispering Wind', desc: 'Decode the ancient cipher' },
  { id: 13, icon: '💡', title: 'The Shadow Grid', desc: 'Turn on all the crystals' },
  { id: 14, icon: '🧩', title: 'Shattered Fresco', desc: 'Slide pieces to unite' },
  { id: 15, icon: '🌐', title: 'The Final Seal', desc: 'Draw the continuous path' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Game() {
  const { isLevelCompleted } = useProgress();

  return (
    <AnimatedPage className="game">
      <div className="game__header">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <Link to="/" className="game__back-link" id="back-home-link">
            ← Back to Home
          </Link>
        </motion.div>
        <motion.h1 
          className="game__title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Choose Your Path
        </motion.h1>
        <motion.p 
          className="game__subtitle"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Select a level to begin
        </motion.p>
      </div>

      <motion.div 
        className="game__grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {levels.map((level) => (
          <motion.div key={level.id} variants={itemVariants}>
            <Link
              to={`/level/${level.id}`}
              className={`game__card ${isLevelCompleted(level.id) ? 'game__card--completed' : ''}`}
              id={`level-card-${level.id}`}
            >
              <motion.div 
                className="game__card-inner"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="game__card-icon">{level.icon}</span>
                <span className="game__card-title">{level.title}</span>
                <span className="game__card-desc">{level.desc}</span>
                {isLevelCompleted(level.id) && (
                  <motion.span 
                    className="game__card-badge"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    ✅
                  </motion.span>
                )}
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Chess Section Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ textAlign: 'center', margin: '2rem 0' }}
      >
        <Link to="/chess" style={{ textDecoration: 'none' }}>
          <motion.div
            style={{
              background: 'linear-gradient(135deg, #1e293b, #334155)',
              border: '2px solid #fbbf24',
              borderRadius: '16px',
              padding: '1.5rem 2rem',
              maxWidth: '400px',
              margin: '0 auto',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.03, borderColor: '#f59e0b' }}
            whileTap={{ scale: 0.97 }}
          >
            <div style={{ fontSize: '2.5rem' }}>♟</div>
            <h3 style={{ color: '#fbbf24', margin: '0.5rem 0 0.25rem' }}>Chess Grandmaster Trials</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>20 tactical puzzles — beginner to master!</p>
          </motion.div>
        </Link>
      </motion.div>

      <Leaderboard />
    </AnimatedPage>
  );
}
