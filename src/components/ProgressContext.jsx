import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { saveProgress, loadProgress } from '../utils/firebase';
import { audioManager } from '../utils/audio';

const ProgressContext = createContext();

export function ProgressProvider({ children }) {
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [currentLevel, setCurrentLevel] = useState(null);
  const [rewards, setRewards] = useState({ stars: 0, crystals: 0 });
  const [difficulty, setDifficulty] = useState(1); // 1 (Easy), 2 (Normal), 3 (Hard)
  const [isMuted, setIsMuted] = useState(true);
  
  const [userId, setUserId] = useState(() => {
    let id = localStorage.getItem('lumina_player_id');
    if (!id) {
      id = 'explorer_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('lumina_player_id', id);
    }
    return id;
  });

  // Sync mute state with audio manager
  useEffect(() => {
    audioManager.setMuted(isMuted);
  }, [isMuted]);

  // Load progress on mount
  useEffect(() => {
    async function initProgress() {
      const data = await loadProgress(userId);
      if (data) {
        if (data.levels) setCompletedLevels(new Set(data.levels));
        if (data.rewards) setRewards(data.rewards);
        if (data.difficulty) setDifficulty(data.difficulty);
        if (typeof data.isMuted === 'boolean') setIsMuted(data.isMuted);
      }
    }
    initProgress();
  }, [userId]);

  const toggleMute = () => setIsMuted(prev => !prev);

  const completeLevel = useCallback(async (levelId, starCount = 3, timeTaken = 0) => {
    setCompletedLevels((prev) => {
      const next = new Set(prev);
      next.add(levelId);
      
      // Update rewards
      setRewards(prevRewards => {
        const newRewards = {
          stars: prevRewards.stars + starCount,
          crystals: prevRewards.crystals + 1
        };

        // Adaptive Difficulty Logic
        // If stars === 3 (quick/no fails) -> Increase difficulty
        // If stars < 2 (many fails) -> Decrease difficulty
        setDifficulty(prevDiff => {
          if (starCount === 3 && prevDiff < 3) return prevDiff + 1;
          if (starCount < 2 && prevDiff > 1) return prevDiff - 1;
          return prevDiff;
        });

        // Auto-save
        saveProgress(userId, {
          levels: Array.from(next),
          completedCount: next.size,
          rewards: newRewards,
          difficulty: difficulty,
          isMuted: isMuted
        });

        return newRewards;
      });
      
      return next;
    });
  }, [userId, difficulty, isMuted]);

  const isLevelCompleted = (levelId) => completedLevels.has(Number(levelId));

  const value = {
    completedLevels,
    currentLevel,
    setCurrentLevel,
    rewards,
    difficulty,
    isMuted,
    toggleMute,
    completeLevel,
    isLevelCompleted,
    totalLevels: 15,
    progressPercent: (completedLevels.size / 15) * 100,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
