import { motion } from 'framer-motion';

// Deliberately opacity-only (no x/y/scale). Framer Motion animates those
// via an inline `transform`, and per the CSS spec ANY transform on an
// ancestor — even a resting translate(0) — becomes the containing block
// for `position: fixed` descendants. Every fixed-position overlay in the
// Thurup game (bid panel, toast, thurup-select panel, scoreboard, rules
// modal, chat panel) lives inside this wrapper, so a transform here was
// silently breaking their viewport-relative positioning site-wide —
// confirmed live: a fixed bottom:0 probe landed ~97px past the real
// viewport bottom, contained by this wrapper's box instead.
const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
