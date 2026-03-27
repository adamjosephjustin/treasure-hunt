import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/PuzzleUX.css';

export default function WaterJugPuzzle({ onComplete, difficulty = 1 }) {
  // Classic 3 and 5 drop puzzle to get 4
  const [jugA, setJugA] = useState(0); // Max 3
  const [jugB, setJugB] = useState(0); // Max 5
  const [feedback, setFeedback] = useState(null);
  const [moves, setMoves] = useState(0);

  const checkVictory = (newB) => {
    if (newB === 4) {
      audioManager.playSFX('correct');
      setFeedback('correct');
      // Calculate stars based on moves (optimal is around 6-7 moves)
      let stars = 1;
      if (moves <= 8) stars = 3;
      else if (moves <= 15) stars = 2;
      setTimeout(() => onComplete?.(stars), 2500);
    } else {
      audioManager.playSFX('click');
    }
  };

  const fillA = () => { if (jugA !== 3 && !feedback) { setJugA(3); setMoves(m => m + 1); checkVictory(jugB); } };
  const fillB = () => { if (jugB !== 5 && !feedback) { setJugB(5); setMoves(m => m + 1); checkVictory(5); } };
  const emptyA = () => { if (jugA !== 0 && !feedback) { setJugA(0); setMoves(m => m + 1); checkVictory(jugB); } };
  const emptyB = () => { if (jugB !== 0 && !feedback) { setJugB(0); setMoves(m => m + 1); checkVictory(0); } };

  const pourAToB = () => {
    if (jugA === 0 || jugB === 5 || feedback) return;
    const spaceInB = 5 - jugB;
    const amountToPour = Math.min(jugA, spaceInB);
    setJugA(jugA - amountToPour);
    const newB = jugB + amountToPour;
    setJugB(newB);
    setMoves(m => m + 1);
    checkVictory(newB);
  };

  const pourBToA = () => {
    if (jugB === 0 || jugA === 3 || feedback) return;
    const spaceInA = 3 - jugA;
    const amountToPour = Math.min(jugB, spaceInA);
    setJugA(jugA + amountToPour);
    const newB = jugB - amountToPour;
    setJugB(newB);
    setMoves(m => m + 1);
    checkVictory(newB);
  };

  return (
    <motion.div 
      className={`puzzle puzzle--waterjug ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">💧 The Weeping Statues</h2>
      <div className="puzzle__instruction-box">
        <p><strong>Goal:</strong> Measure exactly <strong>4 drops</strong> in the large vial.</p>
        <p>Use the buttons to Fill, Empty, or Pour between the vials.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0', alignItems: 'flex-end' }}>
        {/* Jug A - Capacity 3 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px', height: '120px', border: '3px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 10px 10px',
            position: 'relative', overflow: 'hidden', margin: '0 auto 10px auto', background: 'rgba(255,255,255,0.1)'
          }}>
            <motion.div 
              style={{ position: 'absolute', bottom: 0, width: '100%', background: '#3b82f6', opacity: 0.8 }}
              animate={{ height: `${(jugA / 3) * 100}%` }}
              transition={{ type: 'spring', bounce: 0.5 }}
            />
          </div>
          <p>Small Vial (Max 3)</p>
          <h3>{jugA} drops</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
            <button onClick={fillA} className="btn-glow" style={{ padding: '0.5rem', fontSize: '0.9rem' }}>Fill</button>
            <button onClick={emptyA} style={{ padding: '0.5rem' }}>Empty</button>
            <button onClick={pourAToB} style={{ padding: '0.5rem' }}>Pour ➡️</button>
          </div>
        </div>

        {/* Jug B - Capacity 5 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '200px', border: '3px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 10px 10px',
            position: 'relative', overflow: 'hidden', margin: '0 auto 10px auto', background: 'rgba(255,255,255,0.1)'
          }}>
            <motion.div 
              style={{ position: 'absolute', bottom: 0, width: '100%', background: '#3b82f6', opacity: 0.8 }}
              animate={{ height: `${(jugB / 5) * 100}%` }}
              transition={{ type: 'spring', bounce: 0.5 }}
            />
            {/* Target line for 4 drops */}
            <div style={{ position: 'absolute', bottom: '80%', width: '100%', borderTop: '2px dashed #fbbf24' }} />
          </div>
          <p>Large Vial (Max 5)</p>
          <h3 style={jugB === 4 ? { color: '#fbbf24' } : {}}>{jugB} drops</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
            <button onClick={fillB} className="btn-glow" style={{ padding: '0.5rem', fontSize: '0.9rem' }}>Fill</button>
            <button onClick={emptyB} style={{ padding: '0.5rem' }}>Empty</button>
            <button onClick={pourBToA} style={{ padding: '0.5rem' }}>⬅️ Pour</button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#94a3b8' }}>Moves: {moves}</div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ Perfect Measurement!
            <Sparkles count={30} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
