import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../utils/firebase';
import '../styles/Leaderboard.css';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      const data = await getLeaderboard();
      setScores(data);
      setLoading(false);
    }
    fetchScores();
  }, []);

  if (loading) return null;
  if (scores.length === 0) return null;

  return (
    <motion.div 
      className="leaderboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="leaderboard__title">🏆 Forest Elders</h3>
      <div className="leaderboard__list">
        {scores.map((score, idx) => (
          <div key={score.id} className="leaderboard__item">
            <span className="leaderboard__rank">#{idx + 1}</span>
            <span className="leaderboard__name">Explorer_{score.id.slice(-4)}</span>
            <span className="leaderboard__score">{score.completedCount}/3</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
