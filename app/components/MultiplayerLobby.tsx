import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiplayerStore } from "@/app/store/multiplayerStore";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import { toast } from "sonner";
import { getRandomTMDBMovie } from "@/app/lib/tmdb";
import { getRandomMockMovie } from "@/app/lib/mockData";
import LobbyChat from "./LobbyChat";
import {
  safeSupabaseOperation,
  subscribeToLobby,
  updatePlayerActivity,
  kickInactivePlayers,
} from "@/app/lib/supabaseHelpers";
import MultiplayerGame from "./MultiplayerGame";
import MultiplayerResults from "./MultiplayerResults";
import { FaTimes } from "react-icons/fa";

// Placeholder components until we implement them properly
const MultiplayerGamePlaceholder = () => <MultiplayerGame />;
const MultiplayerResultsPlaceholder = () => <MultiplayerResults />;

export default function MultiplayerLobby() {
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const {
    lobbyId,
    isHost,
    players,
    gameStatus,
    difficulty,
    totalRounds,
    setLobbyId,
    setIsHost,
    addPlayer,
    setPlayerReady,
    setCurrentMovie,
    startCountdown,
    startGame,
    resetGame,
    exitLobby,
    setDifficulty,
    setTotalRounds,
    removePlayer,
  } = useMultiplayerStore();

  const { supabase } = useSupabase();

  // Set up lobby subscription and activity tracking
  useEffect(() => {
    if (!lobbyId || !activePlayerId) return;

    // Subscribe to lobby updates
    const subscription = subscribeToLobby(supabase, lobbyId, (newPlayers) => {
      // Update the local players list if needed
      if (newPlayers) {
        // This is a simplification - you might need more complex logic
        // to merge the players from Supabase with your local state
        newPlayers.forEach((player) => {
          const existingPlayer = players.find((p) => p.id === player.player_id);
          if (!existingPlayer) {
            addPlayer({
              id: player.player_id,
              name: player.name,
              isReady: player.is_ready,
              displayTitle: player.display_title || "",
              incorrectLetters: player.incorrect_letters || [],
              guessedLetters: player.guessed_letters || [],
              strikes: player.strikes || 0,
              gameStatus: player.game_status || "idle",
              completionTime: player.completion_time,
              rank: player.rank,
            });
          } else if (existingPlayer.isReady !== player.is_ready) {
            setPlayerReady(player.player_id, player.is_ready);
          }
        });

        // Handle removed players
        players.forEach((player) => {
          const stillExists = newPlayers.some((p) => p.player_id === player.id);
          if (!stillExists && player.id !== activePlayerId) {
            removePlayer(player.id);
            toast.info(`${player.name} has left the lobby`);
          }
        });
      }
    });

    // Setup activity tracking interval
    const activityInterval = setInterval(() => {
      updatePlayerActivity(supabase, activePlayerId, lobbyId);
    }, 30000); // Update every 30 seconds

    // If host, setup inactive player checking
    let inactiveCheckInterval: NodeJS.Timeout | null = null;
    if (isHost) {
      inactiveCheckInterval = setInterval(async () => {
        const kickedPlayers = await kickInactivePlayers(supabase, lobbyId, 2); // 2 minutes
        if (kickedPlayers.length > 0) {
          kickedPlayers.forEach((player) => {
            removePlayer(player.player_id);
            toast.info(`${player.name} was removed due to inactivity`);
          });
        }
      }, 60000); // Check every minute
    }

    // Initial activity update
    updatePlayerActivity(supabase, activePlayerId, lobbyId);

    return () => {
      subscription?.unsubscribe();
      clearInterval(activityInterval);
      if (inactiveCheckInterval) {
        clearInterval(inactiveCheckInterval);
      }
    };
  }, [lobbyId, activePlayerId, isHost, players, supabase]);

  // Handle player ready status change
  const toggleReady = async (playerId: string) => {
    // Only allow toggling ready status for the active player (self)
    if (playerId !== activePlayerId) {
      toast.error("You can only set your own ready status");
      return;
    }

    // Find the player to toggle
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    try {
      // Update ready status in Supabase realtime using the helper
      if (supabase) {
        const { error } = await safeSupabaseOperation(supabase, async (db) => {
          return db
            .from("lobby_players")
            .update({ is_ready: !player.isReady })
            .eq("player_id", playerId);
        });

        if (error) {
          console.error("Error updating ready status:", error);
          toast.error("Failed to update ready status");
          // Continue updating local state even if Supabase fails
        }
      }

      // Always update local state
      setPlayerReady(playerId, !player.isReady);

      // Show success only when no error
      toast.success(
        `Status updated: ${!player.isReady ? "Ready" : "Not Ready"}`
      );
    } catch (err) {
      console.error("Error toggling ready state:", err);
      toast.error("Failed to update ready status");

      // Still update local state for better user experience
      setPlayerReady(playerId, !player.isReady);
    }
  };

  // Kick player (host only)
  const kickPlayer = async (playerId: string) => {
    if (!isHost || !supabase || !lobbyId) return;

    try {
      // Don't allow kicking yourself
      if (playerId === activePlayerId) {
        toast.error("You cannot kick yourself");
        return;
      }

      const playerToKick = players.find((p) => p.id === playerId);
      if (!playerToKick) return;

      // Remove from Supabase
      await safeSupabaseOperation(supabase, async (db) => {
        return db
          .from("lobby_players")
          .delete()
          .eq("player_id", playerId)
          .eq("lobby_code", lobbyId);
      });

      // Remove from local state
      removePlayer(playerId);

      toast.success(`Kicked ${playerToKick.name} from the lobby`);
    } catch (err) {
      console.error("Error kicking player:", err);
      toast.error("Failed to kick player");
    }
  };

  // Create a new lobby
  const createLobby = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      // Generate a random 6-character code
      const lobbyCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // For debugging/development - create the lobby in local state only if Supabase fails
      let localOnly = false;

      if (supabase) {
        // Create lobby in Supabase using the helper
        const { error } = await safeSupabaseOperation(supabase, async (db) => {
          return db.from("lobbies").insert({
            code: lobbyCode,
            created_at: new Date().toISOString(),
            status: "waiting",
            difficulty: difficulty,
          });
        });

        if (error) {
          console.error("Supabase error creating lobby:", error);
          localOnly = true;
          // Continue with local-only mode, don't return
        }

        // Add the current player to the lobby
        if (!localOnly) {
          const playerId =
            "guest-" + Math.random().toString(36).substring(2, 10);

          const { error: playerError } = await safeSupabaseOperation(
            supabase,
            async (db) => {
              return db.from("lobby_players").insert({
                player_id: playerId,
                lobby_code: lobbyCode,
                name: playerName,
                is_ready: false,
                created_at: new Date().toISOString(),
                last_active: new Date().toISOString(),
              });
            }
          );

          if (playerError) {
            console.error("Supabase error adding player:", playerError);
            localOnly = true;
          } else {
            // Set the active player ID for activity tracking
            setActivePlayerId(playerId);
          }
        }
      } else {
        localOnly = true;
      }

      // Always update local state even if Supabase failed
      const playerId =
        activePlayerId ||
        "guest-" + Math.random().toString(36).substring(2, 10);

      if (!activePlayerId) {
        setActivePlayerId(playerId);
      }

      setLobbyId(lobbyCode);
      setIsHost(true);
      addPlayer({
        id: playerId,
        name: playerName,
        isReady: false,
        displayTitle: "",
        incorrectLetters: [],
        guessedLetters: [],
        strikes: 0,
        gameStatus: "idle",
        completionTime: null,
        rank: null,
      });

      if (localOnly) {
        toast.info("Created lobby in offline mode", {
          description:
            "Multiplayer functionality will be limited without an internet connection",
        });
      } else {
        toast.success(`Lobby created! Code: ${lobbyCode}`);
      }
    } catch (err) {
      console.error("Error creating lobby:", err);
      toast.error("Failed to create lobby. Using local mode instead.");

      // Create a local-only lobby as fallback
      const lobbyCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const playerId = "guest-" + Math.random().toString(36).substring(2, 10);

      setActivePlayerId(playerId);
      setLobbyId(lobbyCode);
      setIsHost(true);
      addPlayer({
        id: playerId,
        name: playerName,
        isReady: false,
        displayTitle: "",
        incorrectLetters: [],
        guessedLetters: [],
        strikes: 0,
        gameStatus: "idle",
        completionTime: null,
        rank: null,
      });
    }
  };

  // Join an existing lobby
  const joinLobby = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!joinCode.trim()) {
      toast.error("Please enter a lobby code");
      return;
    }

    try {
      // For debugging/development - join the lobby in local state only if Supabase fails
      let localOnly = false;
      let lobbyExists = false;

      if (supabase) {
        // Check if lobby exists using helper
        const { data: lobby, error } = await safeSupabaseOperation(
          supabase,
          async (db) => {
            return db
              .from("lobbies")
              .select()
              .eq("code", joinCode.toUpperCase())
              .single();
          }
        );

        if (error || !lobby) {
          console.error("Supabase error checking lobby:", error);
          localOnly = true;
        } else {
          lobbyExists = true;
        }

        // Add player to the lobby if it exists in Supabase
        if (lobbyExists) {
          const playerId =
            "guest-" + Math.random().toString(36).substring(2, 10);

          const { error: playerError } = await safeSupabaseOperation(
            supabase,
            async (db) => {
              return db.from("lobby_players").insert({
                player_id: playerId,
                lobby_code: joinCode.toUpperCase(),
                name: playerName,
                is_ready: false,
                created_at: new Date().toISOString(),
                last_active: new Date().toISOString(),
              });
            }
          );

          if (playerError) {
            console.error("Supabase error adding player:", playerError);
            localOnly = true;
          } else {
            // Set the active player ID for activity tracking
            setActivePlayerId(playerId);
          }
        }
      } else {
        localOnly = true;
      }

      // In local mode, just assume the lobby exists (we can't verify)
      if (localOnly && !lobbyExists) {
        toast.info(`Joining lobby ${joinCode.toUpperCase()} in offline mode`, {
          description:
            "Cannot verify if this lobby exists, but we'll try anyway",
        });
      }

      // Always update local state
      const playerId =
        activePlayerId ||
        "guest-" + Math.random().toString(36).substring(2, 10);

      if (!activePlayerId) {
        setActivePlayerId(playerId);
      }

      setLobbyId(joinCode.toUpperCase());
      setIsHost(false);
      addPlayer({
        id: playerId,
        name: playerName,
        isReady: false,
        displayTitle: "",
        incorrectLetters: [],
        guessedLetters: [],
        strikes: 0,
        gameStatus: "idle",
        completionTime: null,
        rank: null,
      });

      if (localOnly) {
        toast.info("Joined in offline mode", {
          description:
            "Limited multiplayer functionality without an internet connection",
        });
      } else {
        toast.success(`Joined lobby ${joinCode.toUpperCase()}`);
      }
    } catch (err) {
      console.error("Error joining lobby:", err);
      toast.error("Failed to join lobby");
    }
  };

  // Start the game (host only)
  const handleStartGame = async () => {
    // Check if all players are ready
    const allReady = players.every((player) => player.isReady);
    if (!allReady) {
      toast.error("All players must be ready to start");
      return;
    }

    try {
      // Start countdown for all players
      startCountdown();

      // Update lobby status in Supabase
      await safeSupabaseOperation(supabase, async (db) => {
        return db
          .from("lobbies")
          .update({ status: "countdown" })
          .eq("code", lobbyId);
      });

      // Fetch random movies for all rounds in advance
      const movies = [];
      for (let i = 0; i < totalRounds; i++) {
        let movie = await getRandomTMDBMovie(difficulty);
        if (!movie) {
          movie = getRandomMockMovie("All", "Hollywood", difficulty);
        }
        movies.push(movie);
      }

      // Set first movie as current movie
      setCurrentMovie(movies[0]);

      // Store all movies for rounds
      useMultiplayerStore.setState({ roundMovies: movies });

      // Start the actual game after 3 seconds
      setTimeout(() => {
        startGame();
      }, 3000);
    } catch (err) {
      console.error("Error starting game:", err);
      toast.error("Failed to start game");
    }
  };

  // If in countdown or playing, show game
  if (gameStatus === "countdown" || gameStatus === "playing") {
    return (
      <>
        <MultiplayerGamePlaceholder />
        {activePlayerId && (
          <LobbyChat
            lobbyCode={lobbyId as string}
            playerId={activePlayerId}
            playerName={
              players.find((p) => p.id === activePlayerId)?.name || playerName
            }
          />
        )}
      </>
    );
  }

  // If game ended, show results
  if (gameStatus === "ended") {
    return <MultiplayerResultsPlaceholder />;
  }

  // Default: show lobby
  return (
    <div className="game-container">
      {/* Show lobby or create/join screen */}
      {!lobbyId ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">
            Multiplayer Mode
          </h1>

          {/* Player name input */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Create or Join options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-secondary bg-opacity-30 p-4 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-3">Create Lobby</h2>
              <p className="text-sm text-gray-300 mb-4">
                Start a new game and invite friends with a lobby code.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createLobby}
                className="btn-primary w-full bg-green-600 hover:bg-green-500"
                disabled={!playerName.trim()}
              >
                Create Lobby
              </motion.button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-secondary bg-opacity-30 p-4 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-3">Join Lobby</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter lobby code"
                  maxLength={6}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={joinLobby}
                  className="btn-primary w-full bg-green-600 hover:bg-green-500"
                  disabled={!playerName.trim() || !joinCode.trim()}
                >
                  Join Lobby
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* Active lobby */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              Lobby: <span className="text-green-500">{lobbyId}</span>
            </h1>
            <div className="flex items-center">
              <span className="text-sm bg-secondary px-3 py-1 rounded-full mr-2">
                {players.length} players
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exitLobby}
                className="btn-secondary text-sm"
              >
                Exit Lobby
              </motion.button>
            </div>
          </div>

          {/* Difficulty selection (host only) */}
          {isHost && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Game Settings</h2>

              {/* Difficulty selection */}
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {["easy", "medium", "hard"].map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDifficulty(level as any)}
                      className={`genre-btn ${
                        difficulty === level ? "bg-green-600" : "bg-secondary"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Number of rounds selection */}
              <div>
                <h3 className="text-md font-medium mb-2">Number of Rounds</h3>
                <div className="flex flex-wrap gap-2">
                  {[3, 5, 7].map((numRounds) => (
                    <motion.button
                      key={numRounds}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTotalRounds(numRounds)}
                      className={`genre-btn ${
                        totalRounds === numRounds
                          ? "bg-green-600"
                          : "bg-secondary"
                      }`}
                    >
                      {numRounds}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Player list */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Players</h2>
            <div className="space-y-2">
              <AnimatePresence>
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="flex items-center justify-between bg-secondary bg-opacity-40 p-3 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          player.isReady ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                      <span className="font-medium">{player.name}</span>
                      {player.id === players[0]?.id && isHost && (
                        <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded-full">
                          Host
                        </span>
                      )}
                    </div>

                    <div className="flex items-center">
                      {/* Only show ready button for the active player */}
                      {player.id === activePlayerId ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleReady(player.id)}
                          className={`text-sm px-3 py-1 rounded mr-2 ${
                            player.isReady
                              ? "bg-green-900 text-green-300"
                              : "bg-yellow-900 text-yellow-300"
                          }`}
                        >
                          {player.isReady ? "Ready" : "Not Ready"}
                        </motion.button>
                      ) : (
                        <span
                          className={`text-sm px-3 py-1 rounded mr-2 ${
                            player.isReady
                              ? "bg-green-900 text-green-300"
                              : "bg-yellow-900 text-yellow-300"
                          }`}
                        >
                          {player.isReady ? "Ready" : "Not Ready"}
                        </span>
                      )}

                      {/* Kick button - only visible to host and not for their own player */}
                      {isHost && player.id !== activePlayerId && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => kickPlayer(player.id)}
                          className="text-red-500 hover:text-red-400 p-1 ml-1"
                          title="Kick player"
                        >
                          <FaTimes />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Game controls */}
          <div className="flex justify-center">
            {isHost ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                disabled={!players.every((p) => p.isReady)}
                className={`btn-primary px-6 py-3 bg-green-600 hover:bg-green-500 ${
                  !players.every((p) => p.isReady)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Start Game
              </motion.button>
            ) : (
              <p className="text-center text-gray-300">
                Waiting for host to start the game...
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Chat component (only when in a lobby) */}
      {lobbyId && activePlayerId && (
        <LobbyChat
          lobbyCode={lobbyId as string}
          playerId={activePlayerId}
          playerName={
            players.find((p) => p.id === activePlayerId)?.name || playerName
          }
        />
      )}
    </div>
  );
}
