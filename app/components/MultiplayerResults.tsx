"use client";

import { motion } from "framer-motion";
import { useMultiplayerStore } from "@/app/store/multiplayerStore";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { safeSupabaseOperation } from "@/app/lib/supabaseHelpers";
import Confetti from "react-confetti";

export default function MultiplayerResults() {
  const {
    lobbyId,
    isHost,
    players,
    currentMovie,
    resetGame,
    exitLobby,
    setShowResults,
  } = useMultiplayerStore();

  const { supabase } = useSupabase();
  const [winnerName, setWinnerName] = useState<string | null>(null);

  // Determine the winner on component mount
  useEffect(() => {
    const winners = players.filter((p) => p.gameStatus === "won");
    if (winners.length > 0) {
      // Sort by completion time
      const sortedWinners = [...winners].sort(
        (a, b) => (a.completionTime || 999) - (b.completionTime || 999)
      );
      setWinnerName(sortedWinners[0].name);
    }
  }, [players]);

  // Return to lobby (host only)
  const handleReturnToLobby = async () => {
    if (!isHost) return;

    try {
      await safeSupabaseOperation(supabase, async (db) => {
        return db
          .from("lobbies")
          .update({ status: "waiting" })
          .eq("code", lobbyId);
      });

      resetGame();
      setShowResults(false);
    } catch (err) {
      console.error("Error returning to lobby:", err);
      toast.error("Failed to return to lobby");
    }
  };

  // Sort players by rank
  const sortedPlayers = [...players].sort((a, b) => {
    // Winners at the top, sorted by rank or completion time
    if (a.gameStatus === "won" && b.gameStatus === "won") {
      return (a.completionTime || 999) - (b.completionTime || 999);
    }
    // Winners above losers
    if (a.gameStatus === "won") return -1;
    if (b.gameStatus === "won") return 1;
    // If both lost, order alphabetically by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="game-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-2">Game Over!</h2>

        {winnerName ? (
          <p className="text-xl text-green-400 mb-4">
            🎉 {winnerName} wins! 🎉
          </p>
        ) : (
          <p className="text-xl text-gray-300 mb-4">
            No one guessed the movie in time.
          </p>
        )}

        {/* Movie reveal */}
        {currentMovie && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 mb-8"
          >
            <h3 className="text-lg font-semibold mb-3">The movie was:</h3>
            <p className="text-2xl font-bold text-green-500 mb-4">
              {currentMovie.title}
              {currentMovie.release_year && ` (${currentMovie.release_year})`}
            </p>

            {currentMovie.poster_path && (
              <div className="flex justify-center">
                <div className="relative w-40 h-60 md:w-48 md:h-72 rounded-lg overflow-hidden border-2 border-accent">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
                    alt={currentMovie.title}
                    fill
                    sizes="(max-width: 768px) 160px, 192px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Results table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="text-xl font-semibold mb-3">Final Results</h3>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Player</th>
                <th className="py-3 px-4 text-right">Status</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`border-t border-gray-700 ${
                    player.id === players[0]?.id
                      ? "bg-gray-700 bg-opacity-50"
                      : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    {player.gameStatus === "won" ? index + 1 : "-"}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {player.name}
                    {isHost && player.id === players[0]?.id && (
                      <span className="ml-2 text-xs bg-gray-600 px-2 py-0.5 rounded-full">
                        Host
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        player.gameStatus === "won"
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }`}
                    >
                      {player.gameStatus === "won" ? "Correct!" : "Failed"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {player.completionTime !== null
                      ? `${player.completionTime}s`
                      : "-"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Control buttons */}
      <div className="flex justify-center gap-4">
        {isHost ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReturnToLobby}
              className="btn-primary bg-green-600 hover:bg-green-500"
            >
              Return to Lobby
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exitLobby}
              className="btn-secondary"
            >
              Exit Game
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exitLobby}
            className="btn-secondary"
          >
            Exit Game
          </motion.button>
        )}
      </div>

      {/* Show confetti for winners */}
      {winnerName && <Confetti recycle={false} numberOfPieces={200} />}
    </div>
  );
}
