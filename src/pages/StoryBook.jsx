import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import storyData from '../storybook/storyData';
import '../styles/StoryBook.css';

const pageVariants = {
  enter: (dir) => ({
    rotateY: dir > 0 ? 90 : -90,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    scale: 1
  },
  exit: (dir) => ({
    rotateY: dir > 0 ? -90 : 90,
    opacity: 0,
    scale: 0.95
  })
};

const pageTransition = {
  type: 'tween',
  duration: 0.5,
  ease: 'easeInOut'
};

export default function StoryBook() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0); // 0 = cover
  const [direction, setDirection] = useState(1);
  const totalPages = storyData.chapters.length + 1; // +1 for cover

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage(p => p + 1);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(p => p - 1);
    }
  };

  const goToPage = (pageNum) => {
    setDirection(pageNum > currentPage ? 1 : -1);
    setCurrentPage(pageNum);
  };

  const renderCover = () => (
    <div className="storybook-page storybook-page--cover">
      <img src={storyData.coverImage} alt="The Enchanted Garden" className="storybook-page__cover-img" />
      <div className="storybook-page__cover-overlay">
        <h1 className="storybook-page__cover-title">{storyData.title}</h1>
        <p className="storybook-page__cover-sub">{storyData.subtitle}</p>
        <button className="storybook-page__start-btn" onClick={goNext}>
          ✨ Open the Book ✨
        </button>
      </div>
    </div>
  );

  const renderTOC = (chapter) => (
    <div className="storybook-page storybook-page--toc">
      <div className="storybook-page__paper">
        <h2 className="storybook-page__chapter-title">📖 {chapter.title}</h2>
        <ul className="storybook-toc">
          {chapter.entries.map((entry) => (
            <li key={entry.page} onClick={() => goToPage(entry.page)} className="storybook-toc__item">
              <span className="storybook-toc__icon">{entry.chapter > 0 ? '🌸' : '🌙'}</span>
              <span className="storybook-toc__name">{entry.title}</span>
              <span className="storybook-toc__dots" />
              <span className="storybook-toc__page">p.{entry.page}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderEnding = (chapter) => (
    <div className="storybook-page storybook-page--ending">
      <img src={chapter.image} alt="The End" className="storybook-page__img" />
      <div className="storybook-page__paper storybook-page__paper--ending">
        <h2 className="storybook-page__ending-title">🌙 {chapter.title} 🌙</h2>
        <div className="storybook-page__text">{chapter.text}</div>
      </div>
    </div>
  );

  const renderChapter = (chapter) => (
    <div className="storybook-page storybook-page--chapter">
      <img src={chapter.image} alt={chapter.title} className="storybook-page__img" />
      <div className="storybook-page__paper">
        <h2 className="storybook-page__chapter-title">{chapter.title}</h2>
        <div className="storybook-page__text">{chapter.text}</div>
      </div>
    </div>
  );

  const renderPage = () => {
    if (currentPage === 0) return renderCover();
    const chapter = storyData.chapters[currentPage - 1];
    if (chapter.type === 'toc') return renderTOC(chapter);
    if (chapter.type === 'ending') return renderEnding(chapter);
    return renderChapter(chapter);
  };

  return (
    <div className="storybook">
      <button className="storybook__home-btn" onClick={() => navigate('/game')}>
        🏠 Home
      </button>

      <div className="storybook__book">
        {/* Clickable areas for page turning */}
        <div className="storybook__turn-left" onClick={goPrev} title="Previous page" />
        <div className="storybook__turn-right" onClick={goNext} title="Next page" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="storybook__page-wrapper"
            style={{ perspective: '1200px' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page navigation */}
      <div className="storybook__nav">
        <button
          className="storybook__nav-btn"
          onClick={goPrev}
          disabled={currentPage === 0}
        >
          ← Previous
        </button>
        <span className="storybook__page-num">
          {currentPage === 0 ? 'Cover' : `Page ${currentPage} of ${totalPages - 1}`}
        </span>
        <button
          className="storybook__nav-btn"
          onClick={goNext}
          disabled={currentPage >= totalPages - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
