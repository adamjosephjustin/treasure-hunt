import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';

const WEIGHTS = [
  { id: 'w1', label: '1', value: 1, color: '#a855f7' },
  { id: 'w2', label: '2', value: 2, color: '#3b82f6' },
  { id: 'w3', label: '3', value: 3, color: '#22c55e' },
  { id: 'w4', label: '4', value: 4, color: '#f59e0b' },
  { id: 'w5', label: '5', value: 5, color: '#ef4444' }
];

const SCENARIOS = [
  { leftVal: 3, rightVal: 1, diff: 1 },    // needs 2 on right
  { leftVal: 5, rightVal: 2, diff: 1 },    // needs 3 on right
  { leftVal: 7, rightVal: 4, diff: 2 },    // needs 3 on right
  { leftVal: 6, rightVal: 1, diff: 2 },    // needs 5 on right
  { leftVal: 9, rightVal: 4, diff: 3 },    // needs 5 on right
  { leftVal: 8, rightVal: 2, diff: 3 }     // needs 6 on right (e.g. 4+2)
];

export default function BalancePuzzle({ onComplete, difficulty = 1 }) {
  const available = SCENARIOS.filter(s => s.diff <= Math.max(1, Math.min(3, difficulty)));
  const [scenario] = useState(() => available[Math.floor(Math.random() * available.length)]);
  
  const [leftStones] = useState([{ id: 'base-l', value: scenario.leftVal, color: '#64748b', label: '?' }]);
  const [rightStones, setRightStones] = useState([{ id: 'base-r', value: scenario.rightVal, color: '#64748b', label: scenario.rightVal }]);
  const [availableWeights, setAvailableWeights] = useState(() => [...WEIGHTS]);
  
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0);
  const dragRef = useRef(null);

  const leftTotal = leftStones.reduce((sum, s) => sum + s.value, 0);
  const rightTotal = rightStones.reduce((sum, s) => sum + s.value, 0);
  
  // Calculate tilt angle (-15 to 15 degrees max)
  const difference = leftTotal - rightTotal;
  const tilt = Math.max(-15, Math.min(15, difference * 3));

  const checkBalance = (newRight) => {
    const newTotal = newRight.reduce((sum, s) => sum + s.value, 0);
    if (newTotal === leftTotal) {
      audioManager.playSFX('correct');
      setFeedback('correct');
      const stars = Math.max(1, 3 - Math.floor(fails / 2));
      setTimeout(() => onComplete?.(stars), 2500);
    } else if (newTotal > leftTotal) {
      audioManager.playSFX('wrong');
      setFails(f => f + 1);
    } else {
      audioManager.playSFX('click');
    }
  };

  const handleDrop = () => {
    if (!dragRef.current || feedback === 'correct') return;
    
    const weight = availableWeights.find(w => w.id === dragRef.current);
    if (weight) {
      const newRight = [...rightStones, weight];
      setRightStones(newRight);
      setAvailableWeights(availableWeights.filter(w => w.id !== weight.id));
      checkBalance(newRight);
    }
    dragRef.current = null;
  };

  return (
    <motion.div 
      className={`puzzle puzzle--balance ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">⚖️ The Silent Ruins</h2>
      <p className="puzzle__instruction">Balance the scales of ancient magic.</p>

      <div className="balance__container">
        <motion.div 
          className="balance__beam"
          animate={{ rotate: -tilt }}
          transition={{ type: "spring", stiffness: 60, damping: 10 }}
        >
          <div className="balance__pan balance__pan--left">
            {leftStones.map(s => (
              <div key={s.id} className="balance__stone" style={{ backgroundColor: s.color, width: 40 + s.value * 5, height: 40 + s.value * 5 }}>
                {s.label}
              </div>
            ))}
          </div>
          <div 
            className="balance__pan balance__pan--right"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleDrop(); }}
          >
            {rightStones.map(s => (
              <div key={s.id} className="balance__stone" style={{ backgroundColor: s.color, width: 40 + s.value * 5, height: 40 + s.value * 5 }}>
                {s.label}
              </div>
            ))}
            {feedback !== 'correct' && <div className="balance__dropzone">Drop here</div>}
          </div>
          <div className="balance__fulcrum" />
        </motion.div>
      </div>

      <div className="balance__weights">
        {availableWeights.map((w) => (
          <motion.div
            key={w.id}
            className="balance__draggable"
            style={{ backgroundColor: w.color }}
            draggable={feedback !== 'correct'}
            onDragStart={() => dragRef.current = w.id}
            onTouchStart={() => dragRef.current = w.id} // Simple touch polyfill concept
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 1.2 }}
          >
            {w.label}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ Perfect Equilibrium!
            <Sparkles count={30} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
