import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import '../styles/Home.css';

export default function Home() {
  return (
    <AnimatedPage className="home">
      <div className="home__fireflies">
        {[...Array(8)].map((_, i) => (
          <motion.span 
            key={i} 
            className="home__firefly" 
            animate={{
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="home__content">
        <motion.div 
          className="home__icon"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <motion.h1 
          className="home__title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          The Lost Light of Lumina Forest
        </motion.h1>
        <motion.p 
          className="home__subtitle"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Help restore the magical glow — solve puzzles, unlock paths, and bring
          light back to the forest!
        </motion.p>
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.4 }}
        >
          <Link to="/game" className="home__start-btn" id="start-btn">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ display: 'inline-block' }}
            >
              🌟 Start Adventure
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
