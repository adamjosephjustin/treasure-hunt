import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/PuzzleUX.css';

const GRID_SIZE = 3; // 3x3
const TOTAL_CELLS = 9;

export default function GridPathPuzzle({ onComplete, difficulty = 1 }) {
  const [path, setPath] = useState([0]); // Start at top left (0)
  const [feedback, setFeedback] = useState(null);

  const handleCellClick = (idx) => {
    if (feedback === 'correct') return;
    
    // If clicking the current tail, maybe undo? 
    if (path[path.length - 1] === idx && path.length > 1) {
      audioManager.playSFX('click');
      const newPath = [...path];
      newPath.pop();
      setPath(newPath);
      return;
    }

    // Check if valid move: must be adjacent to the last node and not already visited
    if (path.includes(idx)) {
      if (idx !== path[path.length-1]) {
         audioManager.playSFX('wrong');
         // can't cross own path
      }
      return; 
    }

    const lastIdx = path[path.length - 1];
    const x1 = lastIdx % GRID_SIZE; const y1 = Math.floor(lastIdx / GRID_SIZE);
    const x2 = idx % GRID_SIZE; const y2 = Math.floor(idx / GRID_SIZE);

    const isAdjacent = Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;

    if (isAdjacent) {
      audioManager.playSFX('click');
      const newPath = [...path, idx];
      setPath(newPath);

      // Check win condition
      if (newPath.length === TOTAL_CELLS) {
        audioManager.playSFX('correct');
        setFeedback('correct');
        setTimeout(() => onComplete?.(3), 2500);
      }
    }
  };

  const resetPath = () => {
    audioManager.playSFX('click');
    setPath([0]);
  };

  return (
    <motion.div className={`puzzle puzzle--gridpath ${feedback ? `puzzle--${feedback}` : ''}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <h2 className="puzzle__title">🌐 The Final Seal</h2>
      <div className="puzzle__instruction-box">
        <p><strong>Goal:</strong> Draw a continuous path starting from the glowing block.</p>
        <p>You must step on exactly <strong>every block once</strong>. Click a tile to move.</p>
      </div>

      <div style={{ position: 'relative', width: '250px', height: '250px', margin: '2rem auto' }}>
        {/* Draw path lines using SVG overlay */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          {path.length > 1 && path.map((cellIdx, i) => {
            if (i === 0) return null;
            const prev = path[i - 1];
            // Cell center coordinates (Assuming 3x3 grid = 33.3% per cell)
            const x1 = (prev % GRID_SIZE) * 33.33 + 16.66;
            const y1 = Math.floor(prev / GRID_SIZE) * 33.33 + 16.66;
            const x2 = (cellIdx % GRID_SIZE) * 33.33 + 16.66;
            const y2 = Math.floor(cellIdx / GRID_SIZE) * 33.33 + 16.66;
            
            return (
              <motion.line
                key={`line-${i}`}
                x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                stroke="#a855f7" strokeWidth="8" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              />
            );
          })}
        </svg>

        {/* Grid Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '100%', height: '100%' }}>
          {Array.from({ length: TOTAL_CELLS }).map((_, idx) => (
            <motion.div 
              key={idx}
              style={{
                background: path.includes(idx) ? 'rgba(168, 85, 247, 0.4)' : '#1e293b',
                border: path[path.length - 1] === idx ? '3px solid #fbbf24' : '2px solid #334155',
                borderRadius: '8px', cursor: 'pointer', zIndex: 10, position: 'relative'
              }}
              onClick={() => handleCellClick(idx)}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
            >
               {idx === 0 && <span style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '1.5rem' }}>🔆</span>}
               {path[path.length - 1] === idx && path.length < TOTAL_CELLS && (
                 <motion.div 
                   style={{ width: '100%', height: '100%', border: '2px solid white', borderRadius: '8px' }}
                   animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                 />
               )}
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-glow" onClick={resetPath} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', background: '#475569' }}>
          Reset Path 🔄
        </button>
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ Mastery Reached!
            <Sparkles count={50} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
