import { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Scene from '../components/Scene';
import AnimatedPage from '../components/AnimatedPage';
import Companion from '../components/Companion';
import RewardBurst from '../components/RewardBurst';
import { useProgress } from '../components/ProgressContext';
import { audioManager } from '../utils/audio';
import '../styles/Level.css';
import '../styles/LevelExtras.css';
import '../styles/PuzzleExtras.css';
import '../styles/PuzzleUX.css';

// Lazy load puzzles for performance
const NumberBridgePuzzle = lazy(() => import('../puzzles/NumberBridgePuzzle'));
const ShapeMatchPuzzle = lazy(() => import('../puzzles/ShapeMatchPuzzle'));
const MemoryLightPuzzle = lazy(() => import('../puzzles/MemoryLightPuzzle'));
const PatternPuzzle = lazy(() => import('../puzzles/PatternPuzzle'));
const ColorMixPuzzle = lazy(() => import('../puzzles/ColorMixPuzzle'));
const StarConnectPuzzle = lazy(() => import('../puzzles/StarConnectPuzzle'));
const BalancePuzzle = lazy(() => import('../puzzles/BalancePuzzle'));
const MirrorBeamPuzzle = lazy(() => import('../puzzles/MirrorBeamPuzzle'));
const MastermindPuzzle = lazy(() => import('../puzzles/MastermindPuzzle'));
const WaterJugPuzzle = lazy(() => import('../puzzles/WaterJugPuzzle'));
const MagicSquarePuzzle = lazy(() => import('../puzzles/MagicSquarePuzzle'));
const CipherPuzzle = lazy(() => import('../puzzles/CipherPuzzle'));
const LightsOutPuzzle = lazy(() => import('../puzzles/LightsOutPuzzle'));
const SlidingPuzzle = lazy(() => import('../puzzles/SlidingPuzzle'));
const GridPathPuzzle = lazy(() => import('../puzzles/GridPathPuzzle'));

const storyData = {
  1: {
    title: 'Level 1: Forest Entrance',
    scenes: [
      'The edge of Lumina Forest is dim. The magical fireflies have lost their glow...',
      'To help them, you must bridge the gap between the ancient numbers.'
    ]
  },
  2: {
    title: 'Level 2: Crystal River',
    scenes: [
      'The Crystal River used to shimmer with pure light, but now it is frozen in shadow.',
      'Place the sacred crystals back into their slots to restore the flow!'
    ]
  },
  3: {
    title: 'Level 3: Ancient Tree',
    scenes: [
      'At the heart of the forest stands the Ancient Tree. Its leaves are grey and silent.',
      'Speak the language of the lights to awaken the forest'
    ]
  },
  4: {
    title: 'Level 4: Whispering Caves',
    scenes: [
      'A deep cavern echoes with forgotten magic. Strange runes line the walls.',
      'You must discover the pattern to open the passage.'
    ]
  },
  5: {
    title: 'Level 5: Rainbow Falls',
    scenes: [
      'The majestic Rainbow Falls have lost their vibrant hues.',
      'Mix the primary drops of light to restore their true colors!'
    ]
  },
  6: {
    title: 'Level 6: Starfall Peak',
    scenes: [
      'At the highest peak, the stars refuse to shine.',
      'Connect the fallen stars in numerical sequence to guide them back to the sky.'
    ]
  },
  7: {
    title: 'Level 7: The Silent Ruins',
    scenes: [
      'The entrance to the inner sanctum is locked by corrupted scales.',
      'Place the ancient glowing weights to find perfect equilibrium.'
    ]
  },
  8: {
    title: 'Level 8: Forgotten Library',
    scenes: [
      'Inside the ruins, a massive crystal powers the domain, but the light beam is misaligned.',
      'Rotate the mirrors and direct the beam to the crystal.'
    ]
  },
  9: {
    title: 'Level 9: Core of Lumina',
    scenes: [
      'You have reached the deeper core. Ensure the sequence is pure.',
      'Deduce the secret code layout to unleash the light!'
    ]
  },
  10: {
    title: 'Level 10: Weeping Statues',
    scenes: [
      'The path descends to an ancient monument where two statues weep magical water.',
      'The scales demand an exact measurement to proceed.'
    ]
  },
  11: {
    title: 'Level 11: The Locked Gate',
    scenes: [
      'A massive stone gate blocks the way. Nine slots await numbered stones.',
      'The ancients valued perfect balance in all directions.'
    ]
  },
  12: {
    title: 'Level 12: Whispering Wind',
    scenes: [
      'The wind howls a strange, scrambled language through the valley.',
      'Listen closely to decode the true name of the password.'
    ]
  },
  13: {
    title: 'Level 13: The Shadow Grid',
    scenes: [
      'Deep underground, an old grid of shadow crystals guards the path.',
      'You must feed light to all the crystals simultaneously to pass.'
    ]
  },
  14: {
    title: 'Level 14: Shattered Fresco',
    scenes: [
      'A mural telling the history of Lumina lies shattered on the ground.',
      'Slide the pieces into their rightful order to learn the truth.'
    ]
  },
  15: {
    title: 'Level 15: The Final Seal',
    scenes: [
      'This is the absolute center of the corruption.',
      'Draw the Great Binding Seal. You must touch every corner exactly once to lock the darkness away forever!'
    ]
  }
};

export default function Level() {
  const { id } = useParams();
  const numId = Number(id);
  const { completeLevel, setCurrentLevel, difficulty } = useProgress();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('scene'); // scene, puzzle, success
  const [sceneIdx, setSceneIdx] = useState(0);
  const [companionMood, setCompanionMood] = useState('floating');
  const [showReward, setShowReward] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  useEffect(() => {
    setCurrentLevel(numId);
    setPhase('scene');
    setSceneIdx(0);
    setCompanionMood('floating');
    setShowReward(false);
  }, [id, numId, setCurrentLevel]);

  const levelStory = storyData[numId] || storyData[1];

  const handleNextScene = () => {
    if (sceneIdx < levelStory.scenes.length - 1) {
      setSceneIdx(sceneIdx + 1);
      audioManager.playSFX('click');
    } else {
      setPhase('puzzle');
      setCompanionMood('idle');
      audioManager.playSFX('click');
    }
  };

  const handlePuzzleComplete = useCallback((stars) => {
    setEarnedStars(stars);
    setCompanionMood('success');
    setPhase('success');
    setShowReward(true);
    audioManager.playMusic(); 
    audioManager.playSFX('success');
    completeLevel(numId, stars);
  }, [numId, completeLevel]);

  const renderPuzzle = () => {
    const props = { onComplete: handlePuzzleComplete, difficulty };
    return (
      <Suspense fallback={<div className="puzzle-loading">✨ Awakening Magic...</div>}>
        {numId === 1 && <NumberBridgePuzzle {...props} />}
        {numId === 2 && <ShapeMatchPuzzle {...props} />}
        {numId === 3 && <MemoryLightPuzzle {...props} />}
        {numId === 4 && <PatternPuzzle {...props} />}
        {numId === 5 && <ColorMixPuzzle {...props} />}
        {numId === 6 && <StarConnectPuzzle {...props} />}
        {numId === 7 && <BalancePuzzle {...props} />}
        {numId === 8 && <MirrorBeamPuzzle {...props} />}
        {numId === 9 && <MastermindPuzzle {...props} />}
        {numId === 10 && <WaterJugPuzzle {...props} />}
        {numId === 11 && <MagicSquarePuzzle {...props} />}
        {numId === 12 && <CipherPuzzle {...props} />}
        {numId === 13 && <LightsOutPuzzle {...props} />}
        {numId === 14 && <SlidingPuzzle {...props} />}
        {numId === 15 && <GridPathPuzzle {...props} />}
      </Suspense>
    );
  };

  return (
    <AnimatedPage className="level-page">
      <div className="level-container">
        <button className="level__back-floating" onClick={() => {
          audioManager.playSFX('click');
          navigate('/game');
        }}>
          🏠 Map
        </button>
        <Companion mood={companionMood} />
        
        {showReward && <RewardBurst />}

        <AnimatePresence mode="wait">
          {phase === 'scene' && (
            <motion.div
              key="scene"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Scene
                text={levelStory.scenes[sceneIdx]}
                onNext={handleNextScene}
                isLast={sceneIdx === levelStory.scenes.length - 1}
              />
            </motion.div>
          )}

          {phase === 'puzzle' && (
            <motion.div
              key="puzzle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="puzzle-container">
                {renderPuzzle()}
              </div>
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="success-overlay"
            >
              <div className="success-content">
                <h2>✨ Light Restored!</h2>
                <p>You earned {earnedStars} stars for your quick thinking.</p>
                <div className="success-stars">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.span 
                      key={`star-${i}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`success-star ${i < earnedStars ? 'success-star--active' : ''}`}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>
                <div className="success-actions">
                  {numId < 15 ? (
                    <button 
                      className="btn-glow"
                      onClick={() => {
                        audioManager.playSFX('click');
                        navigate(`/level/${numId + 1}`);
                      }}
                    >
                      Next Level →
                    </button>
                  ) : (
                    <>
                      <button className="btn-glow" onClick={() => {
                        audioManager.playSFX('click');
                        navigate('/chess');
                      }}>
                        ♟ Chess Puzzles →
                      </button>
                      <button className="chess-puzzle-page__nav-btn" style={{ marginTop: '0.5rem' }} onClick={() => {
                        audioManager.playSFX('click');
                        navigate('/game');
                      }}>
                        Back to Map 🏠
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}
