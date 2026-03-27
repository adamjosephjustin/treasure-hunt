import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/PuzzleUX.css';

// Pre-filled positions based on difficulty to make it solvable for kids
const SCENARIOS = [
  { diff: 1, grid: [8, 1, 6, 3, 5, 7, 4, null, 2], missing: [9] },
  { diff: 2, grid: [8, null, 6, 3, 5, 7, 4, 9, null], missing: [1, 2] },
  { diff: 3, grid: [null, 1, null, 3, 5, null, 4, null, 2], missing: [6, 7, 8, 9] }
];

export default function MagicSquarePuzzle({ onComplete, difficulty = 1 }) {
  const available = SCENARIOS.filter(s => s.diff <= Math.max(1, Math.min(3, difficulty)));
  const [scenario] = useState(() => available[Math.floor(Math.random() * available.length)]);
  
  const [grid, setGrid] = useState([...scenario.grid]);
  const [availableNumbers, setAvailableNumbers] = useState([...scenario.missing].sort(() => 0.5 - Math.random()));
  const [selectedNum, setSelectedNum] = useState(null);
  
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0);

  const checkWin = (currentGrid) => {
    // Check if fully filled
    if (currentGrid.includes(null)) return false;

    // Check rows, cols, diags
    const lines = [
      [0,1,2], [3,4,5], [6,7,8], // rows
      [0,3,6], [1,4,7], [2,5,8], // cols
      [0,4,8], [2,4,6]           // diags
    ];

    return lines.every(line => {
      const sum = currentGrid[line[0]] + currentGrid[line[1]] + currentGrid[line[2]];
      return sum === 15;
    });
  };

  const handleCellClick = (idx) => {
    if (feedback === 'correct') return;
    
    // If a number is currently selected, place it
    if (selectedNum !== null && grid[idx] === null) {
      audioManager.playSFX('click');
      const newGrid = [...grid];
      newGrid[idx] = selectedNum;
      setGrid(newGrid);
      setAvailableNumbers(prev => prev.filter(n => n !== selectedNum));
      setSelectedNum(null);
      
      if (checkWin(newGrid)) {
        audioManager.playSFX('correct');
        setFeedback('correct');
        const stars = Math.max(1, 3 - Math.floor(fails / 2));
        setTimeout(() => onComplete?.(stars), 2500);
      } else if (!newGrid.includes(null)) {
        // Filled but incorrect
        audioManager.playSFX('wrong');
        setFeedback('wrong');
        setFails(f => f + 1);
        setTimeout(() => setFeedback(null), 1500);
      }
    } else if (grid[idx] !== null && scenario.grid[idx] === null) {
      // Remove a placed number
      audioManager.playSFX('click');
      const removed = grid[idx];
      const newGrid = [...grid];
      newGrid[idx] = null;
      setGrid(newGrid);
      setAvailableNumbers([...availableNumbers, removed].sort());
    }
  };

  const getLineSumClass = (lines, g) => {
    // Utility for visual feedback on rows/cols but kept simple for kids
    return '';
  };

  return (
    <motion.div 
      className={`puzzle puzzle--magicsquare ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">🚪 The Locked Gate</h2>
      <div className="puzzle__instruction-box">
        <p><strong>Goal:</strong> Every row, column, and diagonal must add up to exactly <strong>15</strong>.</p>
        <p>Select a number below, then click an empty slot to place it.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '250px', margin: '2rem auto' }}>
        {grid.map((num, idx) => (
          <motion.div 
            key={idx}
            style={{
              aspectRatio: '1/1', background: num && scenario.grid[idx] ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.8)',
              border: `2px solid ${scenario.grid[idx] ? '#64748b' : '#3b82f6'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
              fontWeight: 'bold', color: num ? 'white' : 'transparent', borderRadius: '8px',
              cursor: scenario.grid[idx] === null ? 'pointer' : 'default'
            }}
            onClick={() => handleCellClick(idx)}
            whileHover={scenario.grid[idx] === null ? { scale: 1.05 } : {}}
            whileTap={scenario.grid[idx] === null ? { scale: 0.95 } : {}}
          >
            {num}
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {availableNumbers.map(n => (
          <motion.button
            key={n}
            onClick={() => {
              audioManager.playSFX('click');
              setSelectedNum(selectedNum === n ? null : n);
            }}
            style={{
              width: '50px', height: '50px', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold',
              background: selectedNum === n ? '#fbbf24' : '#1e293b', border: '2px solid white',
              color: 'white', cursor: 'pointer'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {n}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ The Gate Opens!
            <Sparkles count={30} />
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.div className="puzzle__feedback puzzle__feedback--wrong" initial={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.4 }}>
            💫 Math check failed, try rearranging!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
