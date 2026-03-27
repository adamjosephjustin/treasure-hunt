import { motion } from 'framer-motion';
import '../styles/Scene.css';

export default function Scene({ text, onNext, isLast }) {
  return (
    <div className="scene" id="scene">
      {/* forest background layers with subtle movement */}
      <div className="scene__bg">
        <motion.div 
          className="scene__trees scene__trees--back" 
          animate={{ x: [-5, 5, -5] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="scene__trees scene__trees--mid" 
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="scene__trees scene__trees--front" 
          animate={{ x: [-15, 15, -15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="scene__mist" 
          animate={{ opacity: [0.3, 0.6, 0.3], x: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="scene__content">
        <motion.div 
          className="scene__text-box" 
          key={text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <p className="scene__text">{text}</p>
        </motion.div>

        <motion.button
          className="scene__btn"
          onClick={onNext}
          id="scene-next-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          layout
        >
          {isLast ? '🧩 Start Puzzle' : '→ Next'}
        </motion.button>
      </div>
    </div>
  );
}
