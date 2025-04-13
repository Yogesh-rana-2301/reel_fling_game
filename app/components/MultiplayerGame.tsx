"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiplayerStore } from "@/app/store/multiplayerStore";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import Image from "next/image";
import { toast } from "sonner";
import { safeSupabaseOperation } from "@/app/lib/supabaseHelpers";
import Confetti from "react-confetti";
import LobbyChat from "./LobbyChat";
import FixedImage from "@/app/components/FixedImage";

// Inline Keyboard component
const Keyboard = ({
  guessedLetters,
  incorrectLetters,
  onGuess,
}: {
  guessedLetters: string[];
  incorrectLetters: string[];
  onGuess: (letter: string) => void;
}) => {
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ";

  return (
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4">
      {consonants.split("").map((letter) => {
        const isGuessed =
          incorrectLetters.includes(letter) || guessedLetters.includes(letter);

        return (
          <motion.button
            key={letter}
            whileHover={!isGuessed ? { scale: 1.1 } : {}}
            whileTap={!isGuessed ? { scale: 0.9 } : {}}
            disabled={isGuessed}
            onClick={() => onGuess(letter)}
            className={`keyboard-btn text-xs w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center ${
              isGuessed
                ? incorrectLetters.includes(letter)
                  ? "bg-red-900 text-red-300 opacity-60 cursor-not-allowed"
                  : "bg-green-900 text-green-300 opacity-60 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {letter}
          </motion.button>
        );
      })}
    </div>
  );
};

export default function MultiplayerGame() {
  const {
    lobbyId,
    isHost,
    players,
    currentMovie,
    gameTimer,
    difficulty,
    gameStatus,
    guessLetter,
    resetGame,
    exitLobby,
    showResults,
    setShowResults,
    currentRound,
    totalRounds,
  } = useMultiplayerStore();

  const { supabase } = useSupabase();
  const [activePlayer, setActivePlayer] = useState(
    players.find((p) => p.id === players[0]?.id)
  );
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showPoster, setShowPoster] = useState(false);

  // Get active player ID (first player in the list is this client)
  useEffect(() => {
    if (players.length > 0) {
      setActivePlayer(players[0]);
    }
  }, [players]);

  // Update player game state in Supabase when it changes
  useEffect(() => {
    if (!lobbyId || !activePlayer || !supabase) return;

    const updatePlayerState = async () => {
      try {
        await safeSupabaseOperation(supabase, async (db) => {
          return db
            .from("lobby_players")
            .update({
              display_title: activePlayer.displayTitle,
              incorrect_letters: activePlayer.incorrectLetters,
              guessed_letters: activePlayer.guessedLetters,
              strikes: activePlayer.strikes,
              game_status: activePlayer.gameStatus,
              completion_time: activePlayer.completionTime,
              rank: activePlayer.rank,
            })
            .eq("player_id", activePlayer.id)
            .eq("lobby_code", lobbyId);
        });
      } catch (err) {
        console.error("Error updating player state:", err);
      }
    };

    updatePlayerState();
  }, [activePlayer, lobbyId, supabase]);

  // Handle letter guess
  const handleGuessLetter = (letter: string) => {
    if (!activePlayer) return;
    guessLetter(activePlayer.id, letter);
  };

  // Timer display formatter
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

  // Game countdown display
  if (gameStatus === "countdown") {
    return (
      <div className="game-container flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Game Starting</h2>
          <div className="text-6xl font-bold text-green-500 mb-8">
            {gameTimer || 5}
          </div>
          <p className="text-gray-300">Get ready!</p>
        </motion.div>
      </div>
    );
  }

  // Game results display
  if (gameStatus === "ended" && showResults) {
    // Sort players by rank
    const sortedPlayers = [...players].sort((a, b) => {
      // Put winners at the top, ordered by rank
      if (a.gameStatus === "won" && b.gameStatus === "won") {
        return (a.rank || 999) - (b.rank || 999);
      }
      // Winners above losers
      if (a.gameStatus === "won") return -1;
      if (b.gameStatus === "won") return 1;
      // If both lost, order doesn't matter
      return 0;
    });

    const hasWinner = players.some((p) => p.gameStatus === "won");

    return (
      <div className="game-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
          {hasWinner ? (
            <p className="text-xl text-gray-300">
              Congratulations to the winners!
            </p>
          ) : (
            <p className="text-xl text-gray-300">
              No one guessed the movie correctly!
            </p>
          )}

          {currentMovie && (
            <div className="mt-6 mb-8">
              <h3 className="text-lg font-semibold mb-3">The movie was:</h3>
              <p className="text-2xl font-bold text-green-500 mb-4">
                {currentMovie.title}
              </p>

              {currentMovie.poster_path && (
                <div className="flex justify-center">
                  <div className="relative w-40 h-60 md:w-48 md:h-72 rounded-lg overflow-hidden border-2 border-accent">
                    <FixedImage
                      src={currentMovie.poster_path || "/images/no-poster.png"}
                      alt={currentMovie.title}
                      width={192}
                      height={288}
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              )}
            </div>
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
                      player.id === activePlayer?.id
                        ? "bg-gray-700 bg-opacity-50"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      {player.rank || (player.gameStatus === "won" ? "?" : "-")}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {player.name}
                      {player.id ===
                        players.find((p) => isHost && p.id === p.id)?.id && (
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
                Back to Lobby
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

        {/* Confetti for winners */}
        {hasWinner && <Confetti recycle={false} numberOfPieces={200} />}
      </div>
    );
  }

  // Active gameplay
  if (activePlayer && currentMovie) {
    const vowels = "AEIOU";
    const consonants = "BCDFGHJKLMNPQRSTVWXYZ";

    return (
      <div className="game-container relative">
        {/* Game header with timer and info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Multiplayer Game</h2>
            <div className="flex items-center text-sm text-gray-400">
              <span className="mr-3">
                Difficulty:{" "}
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
              <span>
                Round: {currentRound + 1}/{totalRounds}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">
              {formatTime(gameTimer)}
            </div>
            <p className="text-xs text-gray-400">Time Remaining</p>
          </div>
        </div>

        {/* Toggle leaderboard/game view on mobile */}
        <div className="md:hidden flex justify-center mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setShowLeaderboard(false)}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                !showLeaderboard
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Game
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                showLeaderboard
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Scores
            </button>
          </div>
        </div>

        {/* Main game content - split into two columns on larger screens */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Game view (hidden on mobile when leaderboard is shown) */}
          <div
            className={`${showLeaderboard ? "hidden md:block" : ""} md:flex-1`}
          >
            {/* Movie description/hint */}
            {currentMovie?.description && (
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-semibold mb-1">Movie Hint:</h3>
                <p className="text-xs text-gray-300 italic">
                  "{currentMovie.description}"
                </p>
              </div>
            )}

            {/* Word display (movie title) */}
            <div className="mb-6">
              <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-4">
                {activePlayer.displayTitle.split("").map((letter, index) => {
                  // Handle spaces in the movie title
                  if (currentMovie.title.charAt(index) === " ") {
                    return (
                      <div
                        key={index}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                      ></div>
                    );
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`letter-box text-sm sm:text-base w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center ${
                        letter !== "_" ? "bg-green-700" : "bg-gray-700"
                      }`}
                    >
                      {letter === "_" ? " " : letter}
                    </motion.div>
                  );
                })}
              </div>

              {/* Strikes visualization */}
              <div className="flex flex-col items-center mt-4">
                <p className="text-sm text-gray-400 mb-1">Remaining Chances:</p>
                <div className="word-guesser text-sm sm:text-base">
                  {difficulty === "easy" && (
                    <>
                      {"FILMQUIZ".split("").map((letter, index) => (
                        <span
                          key={index}
                          className={
                            index < activePlayer.strikes ? "strike-through" : ""
                          }
                        >
                          {letter}
                        </span>
                      ))}
                    </>
                  )}
                  {difficulty === "medium" && (
                    <>
                      <span className="strike-through">F</span>
                      <span className="strike-through">I</span>
                      <span className="strike-through">L</span>
                      {"MQUIZ".split("").map((letter, index) => (
                        <span
                          key={index}
                          className={
                            index < activePlayer.strikes ? "strike-through" : ""
                          }
                        >
                          {letter}
                        </span>
                      ))}
                    </>
                  )}
                  {difficulty === "hard" && (
                    <>
                      <span className="strike-through">F</span>
                      <span className="strike-through">I</span>
                      <span className="strike-through">L</span>
                      <span className="strike-through">M</span>
                      {"QUIZ".split("").map((letter, index) => (
                        <span
                          key={index}
                          className={
                            index < activePlayer.strikes ? "strike-through" : ""
                          }
                        >
                          {letter}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {8 - activePlayer.strikes} chances left
                </p>
              </div>
            </div>

            {/* Incorrect letters display */}
            <div className="mt-4 mb-6">
              <p className="text-sm text-gray-400 mb-1 text-center">
                Incorrect letters:
              </p>
              <div className="flex justify-center flex-wrap max-w-xs mx-auto">
                {activePlayer.incorrectLetters.length > 0 ? (
                  activePlayer.incorrectLetters.map((letter) => (
                    <span key={letter} className="incorrect-letter">
                      {letter}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">None yet</span>
                )}
              </div>
            </div>

            {/* Keyboard */}
            {activePlayer.gameStatus === "playing" && (
              <div>
                <Keyboard
                  guessedLetters={activePlayer.guessedLetters}
                  incorrectLetters={activePlayer.incorrectLetters}
                  onGuess={handleGuessLetter}
                />
              </div>
            )}

            {/* Player game status message */}
            <AnimatePresence>
              {activePlayer.gameStatus !== "playing" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 p-4 rounded-lg text-center"
                >
                  <h3 className="text-xl font-bold mb-2">
                    {activePlayer.gameStatus === "won"
                      ? "🎉 You got it! 🎉"
                      : "Game Over!"}
                  </h3>
                  <p>
                    {activePlayer.gameStatus === "won"
                      ? "Waiting for other players to finish..."
                      : "The game continues for other players..."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Scoreboard (hidden on mobile when game is shown) */}
          <div
            className={`${
              !showLeaderboard ? "hidden md:block" : ""
            } md:w-80 md:flex-shrink-0`}
          >
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Live Scoreboard</h3>

              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => {
                    if (a.gameStatus === "won" && b.gameStatus === "won") {
                      return (
                        (a.completionTime || 999) - (b.completionTime || 999)
                      );
                    }
                    if (a.gameStatus === "won") return -1;
                    if (b.gameStatus === "won") return 1;
                    return 0;
                  })
                  .map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg ${
                        player.id === activePlayer.id
                          ? "bg-gray-700"
                          : "bg-gray-900"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              player.gameStatus === "playing"
                                ? "bg-yellow-500"
                                : player.gameStatus === "won"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="font-medium">{player.name}</span>
                          {player.id ===
                            players.find((p) => isHost && p.id === p.id)
                              ?.id && (
                            <span className="ml-2 text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">
                              Host
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {player.gameStatus === "won" ? (
                            <span className="text-green-400 text-sm">
                              {player.completionTime}s
                            </span>
                          ) : player.gameStatus === "lost" ? (
                            <span className="text-red-400 text-sm">Failed</span>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Playing
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            player.gameStatus === "won"
                              ? "bg-green-500"
                              : player.gameStatus === "lost"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${
                              player.gameStatus === "won"
                                ? "100%"
                                : player.gameStatus === "lost"
                                ? "100%"
                                : `${Math.min(
                                    100,
                                    (player.guessedLetters.length / 26) * 100
                                  )}%`
                            }`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat component */}
        {lobbyId && activePlayer && (
          <div className="mt-6">
            <LobbyChat
              lobbyCode={lobbyId}
              playerId={activePlayer.id}
              playerName={activePlayer.name}
            />
          </div>
        )}
      </div>
    );
  }

  // Fallback if no active player or movie
  return (
    <div className="game-container">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading game...</h2>
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
