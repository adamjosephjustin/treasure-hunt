import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/PuzzleUX.css';

const GRID_SIZE = 3;

export default function LightsOutPuzzle({ onComplete, difficulty = 1 }) {
  // Start with a board that's guaranteed solvable. 
  // We can do this by starting with a solved board (all true) and simulating clicks backwards.
  const [grid, setGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false)); // Start all off
  const [feedback, setFeedback] = useState(null);
  const [moves, setMoves] = useState(0);

  // Initialize a solvable random board on mount
  useEffect(() => {
    let newGrid = Array(9).fill(true); // Solved state
    const simulateClicks = difficulty === 1 ? 3 : 6; // easier = fewer clicks from solved
    
    // Simulate backward clicks to scramble
    for (let i = 0; i < simulateClicks; i++) {
        const randIdx = Math.floor(Math.random() * 9);
        newGrid = toggleCells(newGrid, randIdx);
    }
    
    // Safety check: if by chance we simulated back to solved, flip middle one
    if (newGrid.every(v => v)) {
        newGrid = toggleCells(newGrid, 4);
    }
    
    setGrid(newGrid);
  }, [difficulty]);

  const toggleCells = (currentGrid, idx) => {
    const newGrid = [...currentGrid];
    const row = Math.floor(idx / GRID_SIZE);
    const col = idx % GRID_SIZE;

    // Toggle target
    newGrid[idx] = !newGrid[idx];
    
    // Toggle neighbors
    if (row > 0) newGrid[idx - GRID_SIZE] = !newGrid[idx - GRID_SIZE]; // Top
    if (row < GRID_SIZE - 1) newGrid[idx + GRID_SIZE] = !newGrid[idx + GRID_SIZE]; // Bottom
    if (col > 0) newGrid[idx - 1] = !newGrid[idx - 1]; // Left
    if (col < GRID_SIZE - 1) newGrid[idx + 1] = !newGrid[idx + 1]; // Right

    return newGrid;
  };

  const handleCellClick = (idx) => {
    if (feedback === 'correct') return;
    audioManager.playSFX('click');
    
    const newGrid = toggleCells(grid, idx);
    setGrid(newGrid);
    setMoves(m => m + 1);

    // Check Win (all lights are on)
    if (newGrid.every(isOn => isOn === true)) {
      audioManager.playSFX('correct');
      setFeedback('correct');
      // Stars based on moves
      const optimal = difficulty === 1 ? 5 : 8;
      const stars = moves <= optimal ? 3 : (moves <= optimal * 2 ? 2 : 1);
      setTimeout(() => onComplete?.(stars), 2500);
    }
  };

  return (
    <motion.div className={`puzzle puzzle--lightsout ${feedback ? `puzzle--${feedback}` : ''}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <h2 className="puzzle__title">💡 The Shadow Grid</h2>
      <div className="puzzle__instruction-box">
        <p><strong>Goal:</strong> Turn ALL the crystals <strong>ON</strong> (Yellow) to unlock the seal.</p>
        <p>Clicking a crystal will toggle it ON or OFF, but it will also toggle its neighbors (Up, Down, Left, Right)!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: '10px', width: '250px', margin: '2rem auto', background: '#0f172a', padding: '15px', borderRadius: '12px' }}>
        {grid.map((isOn, idx) => (
          <motion.div 
            key={idx}
            style={{
              aspectRatio: '1/1', 
              background: isOn ? '#fbbf24' : '#1e293b', 
              boxShadow: isOn ? '0 0 20px rgba(251, 191, 36, 0.8)' : 'inset 0 0 10px rgba(0,0,0,0.5)',
              border: isOn ? '2px solid #fff' : '2px solid #334155',
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem'
            }}
            onClick={() => handleCellClick(idx)}
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.85 }}
            animate={{ backgroundColor: isOn ? '#fbbf24' : '#1e293b' }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isOn && '✨'}
          </motion.div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>Moves: {moves}</div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ Shadows Banished!
            <Sparkles count={40} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
