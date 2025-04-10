"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLocalProgress } from "@/app/lib/localProgress";
import { FaHistory, FaCheck, FaTimes, FaClock } from "react-icons/fa";

interface PlayedMovie {
  id: number;
  title: string;
  result: "win" | "loss";
  date: string;
}

export default function PlayHistory() {
  const [playedMovies, setPlayedMovies] = useState<PlayedMovie[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadHistory = () => {
      const progress = getLocalProgress();
      setPlayedMovies(progress.playedMovies.slice().reverse());
    };

    loadHistory();

    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "reel-fling-progress") {
        loadHistory();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Format date to be more user-friendly
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary bg-opacity-50 rounded-lg p-4 shadow-xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FaHistory className="text-blue-400 mr-2" /> Play History
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-accent hover:underline"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      </div>

      {playedMovies.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No games played yet</p>
      ) : (
        <div className="space-y-2">
          {playedMovies.slice(0, isExpanded ? 10 : 5).map((movie, index) => (
            <motion.div
              key={`${movie.id}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between bg-gray-800 bg-opacity-40 p-3 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    movie.result === "win" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {movie.result === "win" ? <FaCheck /> : <FaTimes />}
                </div>
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">
                    {movie.title}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center">
                    <FaClock className="mr-1" size={10} />
                    {formatDate(movie.date)}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  movie.result === "win"
                    ? "bg-green-900 text-green-300"
                    : "bg-red-900 text-red-300"
                }`}
              >
                {movie.result === "win" ? "WIN" : "LOSS"}
              </span>
            </motion.div>
          ))}

          {/* Show a count of additional games if not expanded */}
          {!isExpanded && playedMovies.length > 5 && (
            <p className="text-center text-sm text-gray-400 mt-2">
              +{playedMovies.length - 5} more games
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
