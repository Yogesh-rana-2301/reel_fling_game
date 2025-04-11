"use client";
import { create } from "zustand";
import { Movie } from "@/app/lib/supabase";

interface Player {
  id: string;
  name: string;
  isReady: boolean;
  displayTitle: string;
  incorrectLetters: string[];
  guessedLetters: string[];
  strikes: number;
  gameStatus: "idle" | "playing" | "won" | "lost";
  completionTime: number | null;
  rank: number | null;
}

interface MultiplayerState {
  // Game settings
  lobbyId: string | null;
  isHost: boolean;
  players: Player[];
  currentMovie: Movie | null;
  countdownTimer: number | null;
  gameTimer: number | null;
  difficulty: "easy" | "medium" | "hard";
  timerConfig: {
    easy: number;
    medium: number;
    hard: number;
  };
  gameStatus: "lobby" | "countdown" | "playing" | "ended";
  showResults: boolean;
  // New round settings
  currentRound: number;
  totalRounds: number;
  roundMovies: Movie[];

  // Actions
  setLobbyId: (lobbyId: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setPlayerReady: (playerId: string, isReady: boolean) => void;
  setCurrentMovie: (movie: Movie | null) => void;
  startCountdown: () => void;
  startGame: () => void;
  guessLetter: (playerId: string, letter: string) => void;
  completeGame: (playerId: string, completionTime: number) => void;
  updateRankings: () => void;
  resetGame: () => void;
  exitLobby: () => void;
  setShowResults: (show: boolean) => void;
  setDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
  setTotalRounds: (rounds: number) => void;
  moveToNextRound: () => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  // Initial state
  lobbyId: null,
  isHost: false,
  players: [],
  currentMovie: null,
  countdownTimer: null,
  gameTimer: null,
  difficulty: "medium",
  timerConfig: {
    easy: 60, // 3 minutes
    medium: 60, // 2 minutes
    hard: 60, // 1 minute
  },
  gameStatus: "lobby",
  showResults: false,
  // New round state
  currentRound: 0,
  totalRounds: 3, // Default to 3 rounds
  roundMovies: [],

  // Actions
  setLobbyId: (lobbyId) => set({ lobbyId }),

  setIsHost: (isHost) => set({ isHost }),

  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players, player],
    })),

  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((player) => player.id !== playerId),
    })),

  setPlayerReady: (playerId, isReady) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, isReady } : player
      ),
    })),

  setCurrentMovie: (movie) => set({ currentMovie: movie }),

  startCountdown: () => {
    // Start 5-second countdown
    let countdown = 5;
    set({ gameStatus: "countdown", countdownTimer: countdown });

    const timer = setInterval(() => {
      countdown -= 1;
      set({ countdownTimer: countdown });

      if (countdown <= 0) {
        clearInterval(timer);
        get().startGame();
      }
    }, 1000);
  },

  startGame: () => {
    const { difficulty, timerConfig } = get();
    const gameTime = timerConfig[difficulty];

    // Initialize all players' game state
    set((state) => ({
      gameStatus: "playing",
      gameTimer: gameTime,
      currentRound: 0,
      players: state.players.map((player) => {
        // First create the display title string with proper typing
        let newDisplayTitle = "";
        if (state.currentMovie?.title) {
          newDisplayTitle = state.currentMovie.title
            .split("")
            .map((letter) => {
              // Show vowels, spaces, and special characters
              if (
                "AEIOU".includes(letter.toUpperCase()) ||
                !letter.match(/[A-Z]/i)
              ) {
                return letter;
              }
              return "_";
            })
            .join("");
        }

        return {
          ...player,
          displayTitle: newDisplayTitle,
          incorrectLetters: [],
          guessedLetters: [],
          strikes: 0,
          gameStatus: "playing",
          completionTime: null,
          rank: null,
        };
      }),
    }));

    // Start game timer
    const timer = setInterval(() => {
      set((state) => {
        const newTimer = (state.gameTimer || 0) - 1;

        if (newTimer <= 0) {
          // Update all players who haven't finished yet to "lost"
          const updatedPlayers = state.players.map((player) => {
            if (player.gameStatus === "playing") {
              return { ...player, gameStatus: "lost" as const };
            }
            return player;
          });

          clearInterval(timer);

          // Check if this was the last round
          if (state.currentRound >= state.totalRounds - 1) {
            return {
              gameTimer: 0,
              gameStatus: "ended",
              players: updatedPlayers,
              showResults: true,
            };
          } else {
            // Move to next round automatically
            get().moveToNextRound();
            return {
              gameTimer: 0,
              players: updatedPlayers,
            };
          }
        }

        // Continue timer
        return { gameTimer: newTimer };
      });
    }, 1000);
  },

  guessLetter: (playerId, letter) => {
    const { currentMovie, players, difficulty } = get();
    if (!currentMovie) return;

    const playerIndex = players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return;

    const player = players[playerIndex];

    // If player has already guessed this letter or has already completed the game, do nothing
    if (
      player.guessedLetters.includes(letter) ||
      player.gameStatus === "won" ||
      player.gameStatus === "lost"
    )
      return;

    const upperLetter = letter.toUpperCase();
    const updatedGuessedLetters = [...player.guessedLetters, upperLetter];

    // Check if letter is in the movie title
    if (currentMovie.title.toUpperCase().includes(upperLetter)) {
      // Update display title with the guessed letter
      const newDisplay = currentMovie.title
        .split("")
        .map((titleLetter, index) => {
          if (titleLetter.toUpperCase() === upperLetter) {
            return titleLetter;
          }
          return player.displayTitle[index];
        })
        .join("");

      // Check if player has won
      const hasWon = !newDisplay.includes("_");

      set((state) => ({
        players: state.players.map((p, index) =>
          index === playerIndex
            ? {
                ...p,
                displayTitle: newDisplay,
                guessedLetters: updatedGuessedLetters,
                gameStatus: hasWon ? "won" : "playing",
                completionTime: hasWon
                  ? state.timerConfig[state.difficulty] - (state.gameTimer || 0)
                  : null,
              }
            : p
        ),
      }));

      // If player won, update rankings
      if (hasWon) {
        get().updateRankings();

        // Check if all players have completed
        const { players: updatedPlayers, currentRound, totalRounds } = get();
        const allCompleted = updatedPlayers.every(
          (p) => p.gameStatus === "won" || p.gameStatus === "lost"
        );

        if (allCompleted) {
          // If all players finished and this is the last round, end the game
          if (currentRound >= totalRounds - 1) {
            set({ gameStatus: "ended", showResults: true });
          } else {
            // Otherwise move to the next round
            get().moveToNextRound();
          }
        }
      }
    } else {
      // Incorrect guess
      const newStrikes = player.strikes + 1;
      const maxStrikes =
        difficulty === "easy" ? 8 : difficulty === "medium" ? 5 : 4;
      const hasLost = newStrikes >= maxStrikes;

      set((state) => ({
        players: state.players.map((p, index) =>
          index === playerIndex
            ? {
                ...p,
                incorrectLetters: [...p.incorrectLetters, upperLetter],
                guessedLetters: updatedGuessedLetters,
                strikes: newStrikes,
                gameStatus: hasLost ? "lost" : "playing",
              }
            : p
        ),
      }));

      // If player lost, check if all players have completed
      if (hasLost) {
        const { players: updatedPlayers, currentRound, totalRounds } = get();
        const allCompleted = updatedPlayers.every(
          (p) => p.gameStatus === "won" || p.gameStatus === "lost"
        );

        if (allCompleted) {
          // If all players finished and this is the last round, end the game
          if (currentRound >= totalRounds - 1) {
            set({ gameStatus: "ended", showResults: true });
          } else {
            // Otherwise move to the next round
            get().moveToNextRound();
          }
        }
      }
    }
  },

  completeGame: (playerId, completionTime) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId
          ? { ...player, completionTime, gameStatus: "won" }
          : player
      ),
    }));

    get().updateRankings();
  },

  updateRankings: () => {
    // Get players who have completed the game
    const { players } = get();
    const completedPlayers = players
      .filter((player) => player.gameStatus === "won")
      .sort(
        (a, b) =>
          (a.completionTime || Infinity) - (b.completionTime || Infinity)
      );

    // Assign ranks
    set((state) => ({
      players: state.players.map((player) => {
        if (player.gameStatus !== "won") return player;

        const rank = completedPlayers.findIndex((p) => p.id === player.id) + 1;
        return { ...player, rank };
      }),
    }));
  },

  resetGame: () => {
    // Reset game but keep players in lobby
    set((state) => ({
      currentMovie: null,
      countdownTimer: null,
      gameTimer: null,
      gameStatus: "lobby",
      showResults: false,
      players: state.players.map((player) => ({
        ...player,
        isReady: false,
        displayTitle: "",
        incorrectLetters: [],
        guessedLetters: [],
        strikes: 0,
        gameStatus: "idle",
        completionTime: null,
        rank: null,
      })),
    }));
  },

  exitLobby: () => {
    // Complete reset back to initial state
    set({
      lobbyId: null,
      isHost: false,
      players: [],
      currentMovie: null,
      countdownTimer: null,
      gameTimer: null,
      gameStatus: "lobby",
      showResults: false,
    });
  },

  setShowResults: (show) => set({ showResults: show }),

  setDifficulty: (difficulty) => set({ difficulty }),

  // Set the total number of rounds
  setTotalRounds: (rounds) => set({ totalRounds: rounds }),

  // Move to the next round
  moveToNextRound: () => {
    const { currentRound, totalRounds, roundMovies } = get();

    // If all rounds completed, end the game
    if (currentRound >= totalRounds - 1) {
      set({ gameStatus: "ended", showResults: true });
      return;
    }

    // Move to next round
    const nextRound = currentRound + 1;
    const nextMovie = roundMovies[nextRound];

    // Initialize next round
    set((state) => ({
      currentRound: nextRound,
      currentMovie: nextMovie,
      gameTimer: state.timerConfig[state.difficulty],
      players: state.players.map((player) => {
        // Create display title for the new movie
        let newDisplayTitle = "";
        if (nextMovie?.title) {
          newDisplayTitle = nextMovie.title
            .split("")
            .map((letter) => {
              // Show vowels, spaces, and special characters
              if (
                "AEIOU".includes(letter.toUpperCase()) ||
                !letter.match(/[A-Z]/i)
              ) {
                return letter;
              }
              return "_";
            })
            .join("");
        }

        return {
          ...player,
          displayTitle: newDisplayTitle,
          incorrectLetters: [],
          guessedLetters: [],
          strikes: 0,
          gameStatus: "playing",
          completionTime: null,
          rank: null,
        };
      }),
    }));

    // Start the timer for the new round
    const { timerConfig, difficulty } = get();
    const gameTime = timerConfig[difficulty];

    // Start game timer
    const timer = setInterval(() => {
      set((state) => {
        const newTimer = (state.gameTimer || 0) - 1;

        if (newTimer <= 0) {
          // Update all players who haven't finished yet to "lost"
          const updatedPlayers = state.players.map((player) => {
            if (player.gameStatus === "playing") {
              return { ...player, gameStatus: "lost" as const };
            }
            return player;
          });

          clearInterval(timer);

          // Check if this was the last round
          if (state.currentRound >= state.totalRounds - 1) {
            return {
              gameTimer: 0,
              gameStatus: "ended",
              players: updatedPlayers,
              showResults: true,
            };
          } else {
            // Move to next round automatically
            get().moveToNextRound();
            return {
              gameTimer: 0,
              players: updatedPlayers,
            };
          }
        }

        // Continue timer
        return { gameTimer: newTimer };
      });
    }, 1000);
  },
}));
