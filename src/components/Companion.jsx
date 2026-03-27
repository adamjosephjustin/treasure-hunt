import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Companion.css';

export default function Companion({ mood = 'idle' }) {
  // mood: 'idle' | 'success' | 'fail'
  const animationMap = {
    idle: {
      y: [0, -8, 0],
      rotate: [0, 0, 0],
      scale: [1, 1, 1],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    success: {
      y: [0, -20, 0, -14, 0],
      rotate: [0, -10, 10, -5, 0],
      scale: [1, 1.3, 0.9, 1.15, 1],
      transition: { duration: 0.7, ease: 'easeOut' },
    },
    fail: {
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="companion"
        animate={animationMap[mood] || animationMap.idle}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9, rotate: 15 }}
        title="Click me!"
        id="companion"
      >
        <span className="companion__body">🦊</span>
        <motion.span
          className="companion__glow"
          animate={{
            opacity: mood === 'success' ? [0.5, 1, 0.5] : [0.3, 0.7, 0.3],
            scale: mood === 'success' ? [1, 1.6, 1] : [1, 1.3, 1],
          }}
          transition={{ duration: mood === 'success' ? 0.8 : 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
