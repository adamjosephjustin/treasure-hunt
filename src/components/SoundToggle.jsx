import { useProgress } from './ProgressContext';
import { motion } from 'framer-motion';
import '../styles/SoundToggle.css';

export default function SoundToggle() {
  const { isMuted, toggleMute } = useProgress();

  return (
    <motion.button
      className={`sound-toggle ${isMuted ? 'sound-toggle--muted' : ''}`}
      onClick={toggleMute}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      id="sound-toggle"
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      <span className="sound-toggle__icon">{isMuted ? '🔇' : '🔊'}</span>
    </motion.button>
  );
}
