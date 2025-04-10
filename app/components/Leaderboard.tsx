"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FaTrophy, FaMedal, FaAward } from "react-icons/fa";
import { useGameStore } from "@/app/store/gameStore";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import { getLocalProgress } from "@/app/lib/localProgress";

type PlayerData = {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  wins: number;
  losses: number;
  streak: number;
  highestStreak: number;
  totalGames: number;
  winPercentage: number;
};

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localPlayerAdded, setLocalPlayerAdded] = useState(false);
  const toggleLeaderboard = useGameStore((state) => state.toggleLeaderboard);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);

      // Always get local player data
      const localProgress = getLocalProgress();

      // Create player data from local progress
      const localPlayerData: PlayerData = {
        id: "local-player",
        username: "You",
        avatar_url: null,
        level: localProgress.level,
        wins: localProgress.wins,
        losses: localProgress.losses,
        streak: localProgress.streak,
        highestStreak: localProgress.highestStreak,
        totalGames: localProgress.totalGames,
        winPercentage:
          localProgress.totalGames > 0
            ? Math.round((localProgress.wins / localProgress.totalGames) * 100)
            : 0,
      };

      // Mock data for the leaderboard
      const mockData: PlayerData[] = [
        {
          id: "1",
          username: "MovieMaster",
          avatar_url: null,
          level: 8,
          wins: 39,
          losses: 6,
          streak: 8,
          highestStreak: 12,
          totalGames: 45,
          winPercentage: 87,
        },
        {
          id: "2",
          username: "FilmFanatic",
          avatar_url: null,
          level: 6,
          wins: 28,
          losses: 9,
          streak: 5,
          highestStreak: 10,
          totalGames: 37,
          winPercentage: 76,
        },
        {
          id: "3",
          username: "CinemaWizard",
          avatar_url: null,
          level: 5,
          wins: 23,
          losses: 9,
          streak: 3,
          highestStreak: 7,
          totalGames: 32,
          winPercentage: 72,
        },
      ];

      // Add local player to the leaderboard if they've played at least one game
      let combinedData = [...mockData];
      if (localProgress.totalGames > 0) {
        combinedData.push(localPlayerData);
        setLocalPlayerAdded(true);
      } else {
        setLocalPlayerAdded(false);
      }

      // Try to fetch from Supabase if available
      let supabaseData: PlayerData[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("wins", { ascending: false })
            .limit(10);

          if (!error && data && data.length > 0) {
            // Convert Supabase data to our format
            supabaseData = data.map((player) => ({
              id: player.id,
              username: player.username || "Anonymous",
              avatar_url: player.avatar_url,
              level: player.level || 1,
              wins: player.games_won || 0,
              losses: player.games_lost || 0,
              streak: player.current_streak || 0,
              highestStreak: player.max_streak || 0,
              totalGames: player.games_played || 0,
              winPercentage:
                player.games_played > 0
                  ? Math.round((player.games_won / player.games_played) * 100)
                  : 0,
            }));

            // Replace mock data with Supabase data but keep local player
            if (localPlayerAdded) {
              combinedData = [...supabaseData, localPlayerData];
            } else {
              combinedData = supabaseData;
            }
          }
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
        }
      }

      // Sort combined data by wins
      combinedData.sort((a, b) => b.wins - a.wins);

      setLeaderboardData(combinedData);
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [supabase]);

  const getTrophyIcon = (position: number) => {
    switch (position) {
      case 0:
        return <FaTrophy className="text-yellow-400" size={20} />;
      case 1:
        return <FaMedal className="text-gray-400" size={20} />;
      case 2:
        return <FaAward className="text-amber-800" size={20} />;
      default:
        return (
          <span className="text-gray-500 font-semibold">{position + 1}</span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-secondary rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FaTrophy className="text-yellow-400 mr-2" /> Leaderboard
          </h2>
          <button
            onClick={toggleLeaderboard}
            className="text-gray-400 hover:text-white"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No leaderboard data available yet.
                </p>
                <p className="text-gray-400">
                  Be the first to play and rank up!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 px-4 text-left">Rank</th>
                      <th className="py-2 px-4 text-left">Player</th>
                      <th className="py-2 px-4 text-center">Level</th>
                      <th className="py-2 px-4 text-center">Wins</th>
                      <th className="py-2 px-4 text-center">Win %</th>
                      <th className="py-2 px-4 text-center">Max Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((player, index) => (
                      <tr
                        key={player.id}
                        className={`border-b border-gray-700 ${
                          player.id === "local-player"
                            ? "bg-accent bg-opacity-20"
                            : index < 3
                            ? "bg-gray-800 bg-opacity-50"
                            : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center w-8">
                            {getTrophyIcon(index)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {player.avatar_url ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                <img
                                  src={player.avatar_url}
                                  alt={player.username}
                                  width={32}
                                  height={32}
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mr-2">
                                {player.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span
                              className={`font-medium ${
                                player.id === "local-player"
                                  ? "text-accent"
                                  : ""
                              }`}
                            >
                              {player.username}
                              {player.id === "local-player" && " (You)"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-primary px-2 py-1 rounded">
                            Lvl {player.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{player.wins}</td>
                        <td className="py-3 px-4 text-center">
                          {player.winPercentage}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          {player.highestStreak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-center">
          <button onClick={toggleLeaderboard} className="btn-primary">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
