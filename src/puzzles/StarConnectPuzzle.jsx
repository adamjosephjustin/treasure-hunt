import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';

const CONSTELLATIONS = [
  { name: 'The Fox', points: [{x: 20, y: 80}, {x: 50, y: 20}, {x: 80, y: 80}], diff: 1 },
  { name: 'The Diamond', points: [{x: 50, y: 10}, {x: 90, y: 50}, {x: 50, y: 90}, {x: 10, y: 50}], diff: 2 },
  { name: 'The Crown', points: [{x: 10, y: 30}, {x: 30, y: 80}, {x: 50, y: 40}, {x: 70, y: 80}, {x: 90, y: 30}], diff: 3 }
];

export default function StarConnectPuzzle({ onComplete, difficulty = 1 }) {
  const available = CONSTELLATIONS.filter(c => c.diff <= Math.max(1, Math.min(3, difficulty)));
  const [constellation] = useState(() => available[Math.floor(Math.random() * available.length)]);
  
  const [connected, setConnected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0);

  const handleStarClick = (idx) => {
    if (feedback === 'correct' || connected.includes(idx)) return;
    
    const nextExpected = connected.length;
    
    if (idx === nextExpected) {
      audioManager.playSFX('click');
      const nextConnected = [...connected, idx];
      setConnected(nextConnected);

      if (nextConnected.length === constellation.points.length) {
        audioManager.playSFX('correct');
        setFeedback('correct');
        const stars = Math.max(1, 3 - Math.floor(fails / 2));
        setTimeout(() => onComplete?.(stars), 2000);
      }
    } else {
      audioManager.playSFX('wrong');
      setFeedback('wrong');
      setFails(f => f + 1);
      setTimeout(() => {
        setFeedback(null);
        setConnected([]);
      }, 900);
    }
  };

  return (
    <motion.div 
      className={`puzzle puzzle--starconnect ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">✨ Starfall Peak</h2>
      <p className="puzzle__instruction">Connect the stars in numerical order to reveal {constellation.name}!</p>

      <div className="starconnect__canvas">
        {/* Draw lines between connected stars */}
        <svg className="starconnect__lines">
          {connected.length > 1 && connected.map((val, i) => {
            if (i === 0) return null;
            const p1 = constellation.points[connected[i - 1]];
            const p2 = constellation.points[val];
            return (
              <motion.line
                key={`line-${i}`}
                x1={`${p1.x}%`} y1={`${p1.y}%`}
                x2={`${p2.x}%`} y2={`${p2.y}%`}
                stroke="rgba(251, 191, 36, 0.6)"
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            );
          })}
        </svg>

        {constellation.points.map((p, i) => (
          <motion.button
            key={i}
            className={`starconnect__point ${connected.includes(i) ? 'starconnect__point--active' : ''}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onClick={() => handleStarClick(i)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={feedback === 'wrong' && i === connected.length ? { x: [-5, 5, -5, 5, 0] } : {}}
          >
            {i + 1}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            ✨ A Constellation is born!
            <Sparkles count={25} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
