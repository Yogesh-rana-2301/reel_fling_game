import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalProgress } from "@/app/lib/localProgress";

export default function LevelProgress() {
  const [level, setLevel] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  // Load level data
  useEffect(() => {
    const loadLevelData = () => {
      const progress = getLocalProgress();
      setLevel(progress.level);

      // Calculate progress percentage to next level
      const currentXp = progress.xp;
      const currentLevel = progress.level;
      const xpForCurrentLevel = 10 * Math.pow(currentLevel - 1, 2);
      const xpForNextLevel = 10 * Math.pow(currentLevel, 2);
      const xpRequired = xpForNextLevel - xpForCurrentLevel;
      const xpProgress = currentXp - xpForCurrentLevel;
      const percent = (xpProgress / xpRequired) * 100;

      setProgressPercent(Math.min(100, Math.max(0, percent)));
    };

    loadLevelData();

    // Set up an interval to refresh the data periodically
    const interval = setInterval(loadLevelData, 5000);

    return () => clearInterval(interval);
  }, []);

  // Check for level up
  useEffect(() => {
    const checkLevelUp = () => {
      // Get the level from localStorage to check for changes
      const storedLevel = localStorage.getItem("lastKnownLevel");
      const currentLevelStr = level.toString();

      if (
        storedLevel &&
        storedLevel !== currentLevelStr &&
        Number(storedLevel) < level
      ) {
        // Level up detected
        setNewLevel(level);
        setShowLevelUp(true);

        // Hide the level up notification after 5 seconds
        setTimeout(() => setShowLevelUp(false), 5000);
      }

      // Store the current level for future comparison
      localStorage.setItem("lastKnownLevel", currentLevelStr);
    };

    checkLevelUp();
  }, [level]);

  return (
    <div className="mt-4">
      {/* Level Progress Bar */}
      <div className="flex items-center mb-1">
        <span className="text-sm font-semibold mr-2">Level {level}</span>
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-accent"
          />
        </div>
        <span className="text-sm ml-2">{Math.round(progressPercent)}%</span>
      </div>

      {/* XP description */}
      <p className="text-xs text-gray-400">
        Win games to earn XP and level up. Each level gives you a hint.
      </p>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed bottom-4 right-4 bg-accent text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center">
              <div className="mr-3">
                <div className="w-10 h-10 rounded-full bg-white text-accent flex items-center justify-center text-xl font-bold">
                  {newLevel}
                </div>
              </div>
              <div>
                <h3 className="font-bold">Level Up!</h3>
                <p className="text-sm">You've reached level {newLevel}!</p>
                <p className="text-xs">+1 Hint awarded</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
