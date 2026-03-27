import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/PuzzleUX.css';

export default function SlidingPuzzle({ onComplete, difficulty = 1 }) {
  // 3x3 Sliding Puzzle (1-8 and null)
  const [grid, setGrid] = useState([1, 2, 3, 4, null, 5, 7, 8, 6]); // Specifically constructed solvable state
  const [feedback, setFeedback] = useState(null);
  const [moves, setMoves] = useState(0);

  const handleTileClick = (idx) => {
    if (feedback === 'correct') return;
    
    const tileVal = grid[idx];
    if (tileVal === null) return; // clicking empty block does nothing

    // Find the empty block
    const emptyIdx = grid.indexOf(null);
    
    const x1 = idx % 3; const y1 = Math.floor(idx / 3);
    const x2 = emptyIdx % 3; const y2 = Math.floor(emptyIdx / 3);

    const isAdjacent = Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;

    if (isAdjacent) {
      audioManager.playSFX('click');
      const newGrid = [...grid];
      newGrid[emptyIdx] = tileVal;
      newGrid[idx] = null;
      setGrid(newGrid);
      setMoves(m => m + 1);

      // Check win
      if (newGrid.join(',') === "1,2,3,4,5,6,7,8,") {
        audioManager.playSFX('correct');
        setFeedback('correct');
        setTimeout(() => onComplete?.(3), 2500);
      }
    }
  };

  return (
    <motion.div className={`puzzle puzzle--sliding ${feedback ? `puzzle--${feedback}` : ''}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <h2 className="puzzle__title">🧩 The Shattered Fresco</h2>
      <div className="puzzle__instruction-box">
        <p><strong>Goal:</strong> Slide the rune fragments into numerical order (1 to 8).</p>
        <p>Click a piece next to the empty space to slide it.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '250px', margin: '2rem auto', background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
        {grid.map((num, idx) => (
          <motion.div 
            key={idx}
            style={{
              aspectRatio: '1/1', background: num ? '#3b82f6' : 'transparent',
              border: num ? '2px solid #60a5fa' : 'none', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 'bold', color: 'white',
              cursor: num ? 'pointer' : 'default',
              boxShadow: num ? 'inset 0 0 10px rgba(0,0,0,0.3)' : 'none'
            }}
            onClick={() => handleTileClick(idx)}
            whileHover={num ? { scale: 0.95 } : {}}
            whileTap={num ? { scale: 0.9 } : {}}
            layout // framer motion auto-animates the position swaps
          >
            {num}
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: 'center', color: '#94a3b8' }}>Moves: {moves}</div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ The Fresco is United!
            <Sparkles count={30} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
