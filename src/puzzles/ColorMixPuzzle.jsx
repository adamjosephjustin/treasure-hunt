import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';

const COLORS = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  purple: '#a855f7', // red + blue
  green: '#22c55e',  // blue + yellow
  orange: '#f97316'  // red + yellow
};

const RECIPES = [
  { target: 'purple', name: 'Purple Magic', req: ['red', 'blue'], diff: 1 },
  { target: 'green', name: 'Forest Green', req: ['blue', 'yellow'], diff: 1 },
  { target: 'orange', name: 'Sunset Orange', req: ['red', 'yellow'], diff: 1 },
  { target: 'purple', name: 'Deep Purple', req: ['red', 'blue', 'blue'], diff: 2 }, // 3 drops for diff 2
  { target: 'green', name: 'Bright Green', req: ['yellow', 'yellow', 'blue'], diff: 2 },
  { target: 'orange', name: 'Fiery Orange', req: ['red', 'red', 'yellow'], diff: 3 },
  { target: 'purple', name: 'Perfect Balance', req: ['red', 'red', 'blue', 'blue'], diff: 3 }
];

export default function ColorMixPuzzle({ onComplete, difficulty = 1 }) {
  const available = RECIPES.filter(r => r.diff <= Math.max(1, Math.min(3, difficulty)));
  const [recipe] = useState(() => available[Math.floor(Math.random() * available.length)]);
  
  const [basin, setBasin] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0);

  const addDrop = (color) => {
    if (feedback === 'correct') return;
    audioManager.playSFX('click');
    
    setBasin(prev => {
      const next = [...prev, color];
      
      // Check if we hit the limit
      if (next.length === recipe.req.length) {
        // Sort to ignore order of drops
        const sortedNext = [...next].sort();
        const sortedReq = [...recipe.req].sort();
        const isMatch = sortedNext.every((val, i) => val === sortedReq[i]);

        if (isMatch) {
          audioManager.playSFX('correct');
          setFeedback('correct');
          const stars = Math.max(1, 3 - Math.floor(fails / 2));
          setTimeout(() => onComplete?.(stars), 2000);
        } else {
          audioManager.playSFX('wrong');
          setFeedback('wrong');
          setFails(f => f + 1);
          setTimeout(() => {
            setFeedback(null);
            setBasin([]);
          }, 1000);
        }
      }
      return next;
    });
  };

  const currentMixColor = basin.length > 0 ? basin[basin.length - 1] : 'transparent'; // Placeholder mix visualization

  return (
    <motion.div 
      className={`puzzle puzzle--colormix ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">🎨 Rainbow Falls</h2>
      <p className="puzzle__instruction">
        Mix the drops to create <strong>{recipe.name}</strong>! 
        <br/>
        Needs {recipe.req.length} drop{recipe.req.length > 1 ? 's' : ''}.
      </p>

      <div className="colormix__target" style={{ backgroundColor: COLORS[recipe.target] }}>
        <Sparkles count={5} />
      </div>

      <div className="colormix__basin" style={{ borderColor: COLORS[currentMixColor] }}>
        {basin.map((b, i) => (
          <motion.div 
            key={i} 
            className="colormix__drop-in"
            style={{ backgroundColor: COLORS[b] }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          />
        ))}
      </div>

      <div className="colormix__sources">
        {['red', 'blue', 'yellow'].map(color => (
          <motion.button
            key={color}
            className="colormix__dropper"
            style={{ backgroundColor: COLORS[color] }}
            onClick={() => addDrop(color)}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            disabled={basin.length >= recipe.req.length}
          />
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ Beautiful mixture!
            <Sparkles count={30} />
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.div className="puzzle__feedback puzzle__feedback--wrong" initial={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.4 }}>
            💫 Not quite the right color, try again!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
