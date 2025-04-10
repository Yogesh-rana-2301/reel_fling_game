"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLocalProgress } from "@/app/lib/localProgress";
import { FaTrophy, FaFire, FaStar, FaFilm } from "react-icons/fa";

export default function StatsCard() {
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    streak: 0,
    highestStreak: 0,
    level: 1,
    winRate: 0,
  });

  useEffect(() => {
    const loadStats = () => {
      const progress = getLocalProgress();

      // Calculate win rate
      const winRate =
        progress.totalGames > 0
          ? Math.round((progress.wins / progress.totalGames) * 100)
          : 0;

      setStats({
        totalGames: progress.totalGames,
        wins: progress.wins,
        losses: progress.losses,
        streak: progress.streak,
        highestStreak: progress.highestStreak,
        level: progress.level,
        winRate,
      });
    };

    loadStats();

    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "reel-fling-progress") {
        loadStats();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary bg-opacity-50 rounded-lg p-4 shadow-xl"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaTrophy className="text-yellow-400 mr-2" /> Your Stats
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-box">
          <div className="flex items-center mb-1">
            <FaFilm className="text-accent mr-2" />
            <span className="text-gray-300">Games</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalGames}</p>
        </div>

        <div className="stat-box">
          <div className="flex items-center mb-1">
            <span className="text-green-500 mr-2">W</span>
            <span className="text-gray-300">Wins</span>
          </div>
          <p className="text-2xl font-bold">{stats.wins}</p>
        </div>

        <div className="stat-box">
          <div className="flex items-center mb-1">
            <span className="text-red-500 mr-2">L</span>
            <span className="text-gray-300">Losses</span>
          </div>
          <p className="text-2xl font-bold">{stats.losses}</p>
        </div>

        <div className="stat-box">
          <div className="flex items-center mb-1">
            <span className="text-blue-400 mr-2">%</span>
            <span className="text-gray-300">Win Rate</span>
          </div>
          <p className="text-2xl font-bold">{stats.winRate}%</p>
        </div>

        <div className="stat-box">
          <div className="flex items-center mb-1">
            <FaFire className="text-orange-500 mr-2" />
            <span className="text-gray-300">Current Streak</span>
          </div>
          <p className="text-2xl font-bold">{stats.streak}</p>
        </div>

        <div className="stat-box">
          <div className="flex items-center mb-1">
            <FaFire className="text-yellow-500 mr-2" />
            <span className="text-gray-300">Best Streak</span>
          </div>
          <p className="text-2xl font-bold">{stats.highestStreak}</p>
        </div>

        <div className="stat-box col-span-2">
          <div className="flex items-center mb-1">
            <FaStar className="text-purple-400 mr-2" />
            <span className="text-gray-300">Current Level</span>
          </div>
          <p className="text-2xl font-bold">{stats.level}</p>
          <p className="text-xs text-gray-400">
            Earn XP to level up and get hints
          </p>
        </div>
      </div>
    </motion.div>
  );
}
