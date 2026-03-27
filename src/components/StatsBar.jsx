import { useProgress } from './ProgressContext';
import { motion } from 'framer-motion';
import '../styles/StatsBar.css';

export default function StatsBar() {
  const { rewards } = useProgress();

  return (
    <div className="stats-bar" id="stats-bar">
      <motion.div 
        className="stats-bar__item"
        key={`stars-${rewards.stars}`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <span className="stats-bar__icon">⭐</span>
        <span className="stats-bar__value">{rewards.stars}</span>
      </motion.div>
      <motion.div 
        className="stats-bar__item"
        key={`crystals-${rewards.crystals}`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <span className="stats-bar__icon">💎</span>
        <span className="stats-bar__value">{rewards.crystals}</span>
      </motion.div>
    </div>
  );
}
