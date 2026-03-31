import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import storyData from '../storybook/storyData';
import '../styles/StoryBook.css';

/* ── Magical Particle System ── */
function MagicParticles({ trigger, type = 'sparkle' }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    const newParticles = Array.from({ length: type === 'smoke' ? 12 : 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: type === 'smoke' ? 8 + Math.random() * 20 : 3 + Math.random() * 6,
      delay: Math.random() * 0.3,
      duration: 1 + Math.random() * 1.5,
      emoji: type === 'smoke' ? '✦' : ['✨', '⭐', '💫', '🌟', '✦'][Math.floor(Math.random() * 5)]
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(timer);
  }, [trigger, type]);

  return (
    <div className="magic-particles">
      {particles.map(p => (
        <motion.span
          key={p.id}
          className={`magic-particle magic-particle--${type}`}
          initial={{ opacity: 0, x: `${p.x}%`, y: `${p.y}%`, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [`${p.y}%`, `${p.y - 30 - Math.random() * 30}%`],
            x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 20}%`],
            scale: [0, 1.2, 0],
            rotate: [0, 180 + Math.random() * 180]
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          style={{ fontSize: `${p.size}px` }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Page Turn Dust ── */
function PageTurnDust({ active }) {
  if (!active) return null;
  return (
    <div className="page-turn-dust">
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div
          key={i}
          className="dust-mote"
          initial={{
            opacity: 0,
            x: '50%',
            y: `${30 + Math.random() * 40}%`,
            scale: 0
          }}
          animate={{
            opacity: [0, 0.8, 0],
            x: `${(Math.random() - 0.5) * 200}%`,
            y: `${Math.random() * 100}%`,
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.5,
            delay: Math.random() * 0.2,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

const pageVariants = {
  enter: (dir) => ({
    rotateY: dir > 0 ? 45 : -45,
    opacity: 0,
  }),
  center: {
    rotateY: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    rotateY: dir > 0 ? -45 : 45,
    opacity: 0,
  })
};

export default function StoryBook() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [dustKey, setDustKey] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const totalPages = storyData.chapters.length + 1;

  const triggerEffects = useCallback(() => {
    setDustKey(k => k + 1);
    setSparkleKey(k => k + 1);
  }, []);

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage(p => p + 1);
      triggerEffects();
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(p => p - 1);
      triggerEffects();
    }
  };

  const goToPage = (pageNum) => {
    setDirection(pageNum > currentPage ? 1 : -1);
    setCurrentPage(pageNum);
    triggerEffects();
  };

  const chapter = currentPage === 0 ? null : storyData.chapters[currentPage - 1];
  const isCover = currentPage === 0;
  const isTOC = chapter?.type === 'toc';
  const isEnding = chapter?.type === 'ending';

  // Get the current image
  const currentImage = isCover
    ? storyData.coverImage
    : chapter?.image || null;

  // Get the text content
  const currentText = chapter?.text || '';
  const currentTitle = isCover
    ? storyData.title
    : chapter?.title || '';

  return (
    <div className="storybook">
      <button className="storybook__home-btn" onClick={() => navigate('/game')}>
        🏠 Home
      </button>

      {/* Ambient floating sparkles */}
      <div className="storybook__ambient">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.span
            key={i}
            className="ambient-sparkle"
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`
            }}
          >
            ✦
          </motion.span>
        ))}
      </div>

      {/* ── THE OPEN BOOK ── */}
      <div className="openbook">
        {/* Spine / center shadow */}
        <div className="openbook__spine" />

        {/* Page turn dust effect */}
        <PageTurnDust active={dustKey} key={`dust-${dustKey}`} />

        {/* LEFT PAGE — always shows the image */}
        <div className="openbook__left" onClick={goPrev}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`left-${currentPage}`}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.45, ease: 'easeInOut' }}
              className="openbook__page-inner"
              style={{ transformOrigin: 'right center' }}
            >
              {isCover ? (
                <div className="openbook__cover-page">
                  <img src={storyData.coverImage} alt="Cover" className="openbook__full-img" />
                  <div className="openbook__cover-overlay">
                    <h1>{storyData.title}</h1>
                    <p>{storyData.subtitle}</p>
                  </div>
                  <MagicParticles trigger={sparkleKey} type="sparkle" />
                </div>
              ) : isTOC ? (
                <div className="openbook__toc-left">
                  <div className="openbook__toc-decor">
                    <span className="openbook__toc-big-icon">📖</span>
                    <h2>The Enchanted Garden</h2>
                    <p className="openbook__toc-author">A story of friendship & courage</p>
                    <div className="openbook__toc-ornament">✿ ❀ ✿ ❀ ✿</div>
                  </div>
                </div>
              ) : (
                <div className="openbook__img-page">
                  {currentImage && (
                    <img src={currentImage} alt={currentTitle} className="openbook__full-img" />
                  )}
                  <MagicParticles trigger={sparkleKey} type={isEnding ? 'smoke' : 'sparkle'} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT PAGE — always shows the text */}
        <div className="openbook__right" onClick={goNext}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`right-${currentPage}`}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.45, ease: 'easeInOut' }}
              className="openbook__page-inner"
              style={{ transformOrigin: 'left center' }}
            >
              {isCover ? (
                <div className="openbook__cover-right">
                  <h2>Welcome, little reader!</h2>
                  <p>This is a magical story about a brave bunny named Pip who goes on an incredible adventure.</p>
                  <p>Click the right side to turn pages forward. Click the left side to go back.</p>
                  <button className="openbook__start-btn" onClick={(e) => { e.stopPropagation(); goNext(); }}>
                    ✨ Open the Book ✨
                  </button>
                  <div className="openbook__age-badge">Ages 2-4</div>
                </div>
              ) : isTOC ? (
                <div className="openbook__toc-right">
                  <h3 className="openbook__toc-heading">Table of Contents</h3>
                  <ul className="openbook__toc-list">
                    {chapter.entries.map((entry) => (
                      <li key={entry.page} onClick={(e) => { e.stopPropagation(); goToPage(entry.page); }}>
                        <span className="toc-icon">{entry.chapter > 0 ? '🌸' : '🌙'}</span>
                        <span className="toc-name">{entry.title}</span>
                        <span className="toc-dots" />
                        <span className="toc-page">{entry.page}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="openbook__text-page">
                  <h2 className="openbook__chapter-heading">{currentTitle}</h2>
                  <div className="openbook__story-text">{currentText}</div>
                  {isEnding && (
                    <div className="openbook__ending-stars">🌙 ⭐ 🌙 ⭐ 🌙</div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="storybook__nav">
        <button className="storybook__nav-btn" onClick={goPrev} disabled={currentPage === 0}>
          ← Previous
        </button>
        <span className="storybook__page-num">
          {isCover ? 'Cover' : `Page ${currentPage} of ${totalPages - 1}`}
        </span>
        <button className="storybook__nav-btn" onClick={goNext} disabled={currentPage >= totalPages - 1}>
          Next →
        </button>
      </div>
    </div>
  );
}
