import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';

// 4x4 grid representation
// Cell types: 'empty', 'source' (shoots right), 'target', 'mirror' (can be rotated)
const GRID_SIZE = 4;

const SCENARIOS = [
  {
    diff: 1,
    source: { x: 0, y: 1 },
    target: { x: 3, y: 3 },
    mirrors: [
      { id: 'm1', x: 3, y: 1, rotation: 0 }, // needs to reflect down (rotation 90)
    ]
  },
  {
    diff: 2,
    source: { x: 0, y: 0 },
    target: { x: 2, y: 2 },
    mirrors: [
      { id: 'm1', x: 2, y: 0, rotation: 0 }, // reflect down (90)
      { id: 'm2', x: 0, y: 2, rotation: 0 }  // decoy or alternate path
    ]
  },
  {
    diff: 3,
    source: { x: 0, y: 3 },
    target: { x: 3, y: 0 },
    mirrors: [
      { id: 'm1', x: 1, y: 3, rotation: 0 }, // up
      { id: 'm2', x: 1, y: 1, rotation: 0 }, // right
      { id: 'm3', x: 3, y: 1, rotation: 0 }  // up to target
    ]
  }
];

export default function MirrorBeamPuzzle({ onComplete, difficulty = 1 }) {
  const available = SCENARIOS.filter(s => s.diff <= Math.max(1, Math.min(3, difficulty)));
  const [scenario] = useState(() => available[Math.floor(Math.random() * available.length)]);
  
  const [mirrors, setMirrors] = useState(() => scenario.mirrors.map(m => ({...m})));
  const [beamPath, setBeamPath] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0); // Track clicks as fails implicitly if many

  const rotateMirror = (id) => {
    if (feedback === 'correct') return;
    audioManager.playSFX('click');
    setMirrors(prev => prev.map(m => 
      m.id === id ? { ...m, rotation: (m.rotation + 90) % 360 } : m
    ));
    setFails(f => f + 1); // rough metric for stars
  };

  useEffect(() => {
    // Raycasting logic
    let currentX = scenario.source.x;
    let currentY = scenario.source.y;
    let dirX = 1; // 1 = right, -1 = left, 0 = none
    let dirY = 0; // 1 = down, -1 = up, 0 = none
    
    const path = [{ x: currentX, y: currentY }];
    let hitTarget = false;
    let safeLoop = 0;

    while (
      currentX >= 0 && currentX < GRID_SIZE &&
      currentY >= 0 && currentY < GRID_SIZE &&
      safeLoop < 20
    ) {
      safeLoop++;
      currentX += dirX;
      currentY += dirY;
      
      if (currentX < 0 || currentX >= GRID_SIZE || currentY < 0 || currentY >= GRID_SIZE) {
        break; // out of bounds
      }

      const point = { x: currentX, y: currentY };
      path.push(point);

      if (currentX === scenario.target.x && currentY === scenario.target.y) {
        hitTarget = true;
        break;
      }

      const mirror = mirrors.find(m => m.x === currentX && m.y === currentY);
      if (mirror) {
        // Simplified reflection logic based on rotation
        // 0 = / (bottom-left to top-right)
        // 90 = \ (top-left to bottom-right)
        
        // This is a simplified physics abstraction for kids
        if (mirror.rotation === 0 || mirror.rotation === 180) {
          // / mirror
          if (dirX === 1) { dirX = 0; dirY = -1; }      // right -> up
          else if (dirX === -1) { dirX = 0; dirY = 1; } // left -> down
          else if (dirY === 1) { dirX = -1; dirY = 0; } // down -> left
          else if (dirY === -1) { dirX = 1; dirY = 0; } // up -> right
        } else {
          // \ mirror
          if (dirX === 1) { dirX = 0; dirY = 1; }       // right -> down
          else if (dirX === -1) { dirX = 0; dirY = -1; }// left -> up
          else if (dirY === 1) { dirX = 1; dirY = 0; }  // down -> right
          else if (dirY === -1) { dirX = -1; dirY = 0; }// up -> left
        }
      }
    }

    setBeamPath(path);

    if (hitTarget && feedback !== 'correct') {
      audioManager.playSFX('correct');
      setFeedback('correct');
      const stars = Math.max(1, 3 - Math.floor(fails / 5)); // generous fails metric
      setTimeout(() => onComplete?.(stars), 2500);
    }
  }, [mirrors, scenario, fails, feedback, onComplete]);

  return (
    <motion.div 
      className={`puzzle puzzle--mirror ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">🪞 The Forgotten Library</h2>
      <p className="puzzle__instruction">Rotate the mirrors to bend the beam of light to the crystal!</p>

      <div className="mirror__grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {/* Render Beam Segments (Simple overlay lines) */}
        {beamPath.length > 1 && beamPath.map((p, i) => {
          if (i === 0) return null;
          const p1 = beamPath[i - 1];
          const p2 = p;
          const isHorizontal = p1.y === p2.y;
          const length = 100; // 1 cell
          return (
            <motion.div 
              key={`beam-${i}`}
              className="mirror__beam"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              style={{
                left: `${Math.min(p1.x, p2.x) * 25 + (isHorizontal ? 12.5 : 12.5)}%`,
                top: `${Math.min(p1.y, p2.y) * 25 + (isHorizontal ? 12.5 : 12.5)}%`,
                width: isHorizontal ? `${length}%` : '4px',
                height: isHorizontal ? '4px' : `${length}%`,
              }}
            />
          );
        })}

        {/* Render Cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
          const x = idx % GRID_SIZE;
          const y = Math.floor(idx / GRID_SIZE);
          const isSource = x === scenario.source.x && y === scenario.source.y;
          const isTarget = x === scenario.target.x && y === scenario.target.y;
          const mirror = mirrors.find(m => m.x === x && m.y === y);

          return (
            <div key={idx} className="mirror__cell">
              {isSource && <div className="mirror__source">🔆</div>}
              {isTarget && (
                <div className={`mirror__target ${feedback === 'correct' ? 'mirror__target--lit' : ''}`}>
                  💎
                  {feedback === 'correct' && <Sparkles count={5} />}
                </div>
              )}
              {mirror && (
                <motion.div 
                  className="mirror__object"
                  animate={{ rotate: mirror.rotation }}
                  onClick={() => rotateMirror(mirror.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  /
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ opacity: 0 }}>
            ✨ Brilliant Routing!
            <Sparkles count={25} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
