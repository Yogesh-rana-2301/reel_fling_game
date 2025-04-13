import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import { useGameStore } from "@/app/store/gameStore";
import tmdbApi, { getRandomTMDBMovie } from "@/app/lib/tmdb";
import { getRandomMockMovie } from "@/app/lib/mockData";
import { toast } from "sonner";
import { FaCalendarAlt, FaLock, FaCheck } from "react-icons/fa";

// Simple seeded random number generator implementation
function createSeededRandom(seed: number) {
  return function () {
    // Simple algorithm to generate a random number based on a seed
    // Using a linear congruential generator approach
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export default function DailyChallenge() {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [nextChallenge, setNextChallenge] = useState("");
  const [streak, setStreak] = useState(0);

  const { supabase } = useSupabase();
  const { setCurrentMovie, resetGame, initializeGame } = useGameStore();

  // Check if daily challenge is completed
  useEffect(() => {
    const checkDailyStatus = async () => {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Check localStorage first for faster loading
      const dailyStatus = localStorage.getItem(`daily_challenge_${today}`);
      if (dailyStatus === "completed") {
        setCompleted(true);
      }

      // Calculate time until next challenge
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const timeToNextChallenge = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeToNextChallenge / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeToNextChallenge % (1000 * 60 * 60)) / (1000 * 60)
      );

      setNextChallenge(`${hours}h ${minutes}m`);

      // Check streak
      try {
        const storedStreak = localStorage.getItem("daily_challenge_streak");
        if (storedStreak) {
          setStreak(parseInt(storedStreak, 10));
        }

        // If connected to Supabase, check server streak
        if (supabase) {
          const { data } = await supabase
            .from("daily_challenges")
            .select("streak")
            .order("completed_at", { ascending: false })
            .limit(1);

          if (data && data.length > 0) {
            const serverStreak = data[0].streak;

            // Use the higher streak value
            if (serverStreak > streak) {
              setStreak(serverStreak);
              localStorage.setItem(
                "daily_challenge_streak",
                serverStreak.toString()
              );
            }
          }
        }
      } catch (error) {
        console.error("Error checking daily challenge streak:", error);
      }
    };

    checkDailyStatus();
  }, [supabase]);

  // Start daily challenge
  const startDailyChallenge = async () => {
    setIsLoading(true);

    try {
      // Get today's date for seeding the random generator
      const today = new Date().toISOString().split("T")[0];
      const dateSeed = today.replace(/-/g, "");

      // Use the date seed to get a "random" movie that's the same for everyone today
      const seed = parseInt(dateSeed, 10);

      // Create a seeded random number generator
      const seededRandom = createSeededRandom(seed);

      // Store original Math.random
      const originalRandom = Math.random;

      // Replace with seeded version for consistent results
      Math.random = seededRandom;

      // Get the daily challenge movie
      let dailyMovie;

      if (supabase) {
        // Try to get from TMDB first
        dailyMovie = await getRandomTMDBMovie();
      }

      if (!dailyMovie) {
        // Fallback to mock data if TMDB fetch fails
        dailyMovie = getRandomMockMovie();
        toast.info("Using mock movie data for daily challenge");
      }

      // Restore the original random number generator
      Math.random = originalRandom;

      if (dailyMovie) {
        // Set up the game
        resetGame();
        setCurrentMovie(dailyMovie);
        initializeGame();

        toast.success("Daily Challenge started!");
      } else {
        toast.error("Failed to load daily challenge movie");
      }
    } catch (error) {
      console.error("Error starting daily challenge:", error);
      toast.error("Failed to start daily challenge");
    } finally {
      setIsLoading(false);
    }
  };

  // Complete daily challenge
  const completeDailyChallenge = async () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Mark as completed in localStorage
    localStorage.setItem(`daily_challenge_${today}`, "completed");
    setCompleted(true);

    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("daily_challenge_streak", newStreak.toString());

    // If connected to Supabase, update server streak
    if (supabase) {
      try {
        await supabase.from("daily_challenges").insert({
          completed_at: new Date().toISOString(),
          streak: newStreak,
        });
      } catch (error) {
        console.error("Error updating daily challenge streak:", error);
      }
    }

    toast.success("Daily Challenge completed! +1 to your streak");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary bg-opacity-40 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaCalendarAlt className="text-accent mr-2" />
          <h2 className="text-xl font-semibold">Daily Challenge</h2>
        </div>
        <div className="bg-accent bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
          {completed ? (
            <span className="flex items-center">
              <FaCheck className="mr-1" />
              Completed
            </span>
          ) : (
            <span className="flex items-center">
              <FaLock className="mr-1" />
              Bonus XP
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-300">
            New challenge in:{" "}
            <span className="font-medium text-white">{nextChallenge}</span>
          </p>
          <p className="text-sm text-gray-300">
            Current streak:{" "}
            <span className="font-medium text-accent">{streak} days</span>
          </p>
        </div>

        <div className="mt-2">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent"
              style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>1</span>
            <span>7 days</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-4">
        Daily challenges reset at midnight. Complete them to earn bonus XP and
        maintain your streak!
      </p>

      <button
        onClick={startDailyChallenge}
        disabled={isLoading || completed}
        className={`w-full btn-primary ${
          isLoading || completed ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading
          ? "Loading..."
          : completed
          ? "Already Completed Today"
          : "Start Daily Challenge"}
      </button>
    </motion.div>
  );
}
