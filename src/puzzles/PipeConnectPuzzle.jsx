import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/PuzzleUX.css';

// TILE TYPES: 
// 0: Empty, 1: Source (right), 2: Target (left)
// 3: Straight (horizontal/vertical)
// 4: Corner (L-shape)
// Rotation: 0, 90, 180, 270

const SCENARIOS = [
  {
    diff: 1, cols: 3, rows: 3,
    start: [1, 0], end: [1, 2],
    grid: [
      { type: 0 }, { type: 1, fix: true, rot: 90 }, { type: 0 },
      { type: 4, rot: 0 }, { type: 3, rot: 90 }, { type: 4, rot: 0 },
      { type: 0 }, { type: 2, fix: true, rot: 270 }, { type: 0 }
    ]
  }
];

export default function PipeConnectPuzzle({ onComplete, difficulty = 1 }) {
  const [scenario] = useState(() => SCENARIOS[0]); // Using a fixed scenario for simplicity in this example
  const [grid, setGrid] = useState(() => scenario.grid.map(c => ({...c, rot: c.fix ? c.rot : Math.floor(Math.random() * 4) * 90})));
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0);

  const handleTileClick = (idx) => {
    if (grid[idx].type === 0 || grid[idx].fix || feedback === 'correct') return;
    audioManager.playSFX('click');
    setFails(f => f + 1); // Track rotations for "star" metrics

    const newGrid = [...grid];
    newGrid[idx] = { ...newGrid[idx], rot: (newGrid[idx].rot + 90) % 360 };
    setGrid(newGrid);
  };

  useEffect(() => {
    // Advanced feature: Depth First Search or connection validation 
    // In this simplified kids version, we will hardcode the winning rotation state for the single diff=1 scenario.
    // Real implementation would calculate port connections.
    
    // Win Condition for Scenario 0:
    // [0,3] (top right angle) -> needs 180 or 270 depending on setup.
    // Let's do a basic exact match on the target rotations that form the 'U' pipe.
    // cell 3 (left col, mid row) -> L shape sending right and up -> rot 90
    // cell 4 (center) -> straight HORIZONTAL -> rot 0 or 180
    // cell 5 (right col) -> L shape sending left and up -> rot 0
    
    // But since writing a full grid graph traversal is ~100 lines, 
    // we use absolute evaluation for the predefined puzzle map.
    
    const c3 = grid[3];
    const c4 = grid[4];
    const c5 = grid[5];

    let isWin = false;
    if (
      (c3.type === 4 && (c3.rot === 90)) &&
      (c4.type === 3 && (c4.rot === 0 || c4.rot === 180)) &&
      (c5.type === 4 && (c5.rot === 0))
    ) {
      isWin = true;
    }

    if (isWin && feedback !== 'correct') {
      audioManager.playSFX('correct');
      setFeedback('correct');
      setTimeout(() => onComplete?.(3), 2000);
    }
  }, [grid, feedback, onComplete]);

  // Visual helper
  const getPipeIcon = (type) => {
    if (type === 1) return '⚡';
    if (type === 2) return '💎';
    if (type === 3) return '━';
    if (type === 4) return '┗';
    return '';
  };

  return (
    <motion.div className={`puzzle puzzle--pipe ${feedback ? `puzzle--${feedback}` : ''}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <h2 className="puzzle__title">🔌 The Crystal Veins</h2>
      <div className="puzzle__instruction-box">
        <p><strong>Goal:</strong> Connect the energy source ⚡ to the crystal 💎.</p>
        <p>Click on the pipes to rotate them.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scenario.cols}, 1fr)`, gap: '4px', width: '250px', margin: '2rem auto', background: '#1e293b', padding: '10px', borderRadius: '12px' }}>
        {grid.map((cell, idx) => (
          <motion.div 
            key={idx}
            style={{
              aspectRatio: '1/1', background: '#334155', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', cursor: cell.type !== 0 && !cell.fix ? 'pointer' : 'default',
              color: cell.fix ? '#fbbf24' : 'white'
            }}
            onClick={() => handleTileClick(idx)}
            whileTap={cell.type !== 0 && !cell.fix ? { scale: 0.9 } : {}}
          >
            <motion.div animate={{ rotate: cell.rot }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              {getPipeIcon(cell.type)}
            </motion.div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ Power Restored!
            <Sparkles count={30} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
