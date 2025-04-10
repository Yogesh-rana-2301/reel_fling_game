"use client";
import { create } from "zustand";
import { Movie } from "@/app/lib/supabase";

interface GameState {
  // Game settings
  genre: string;
  industry: string;
  difficulty: "easy" | "medium" | "hard";

  // Game state
  currentMovie: Movie | null;
  displayTitle: string;
  incorrectLetters: string[];
  guessedLetters: string[];
  wordGuesser: string;
  strikes: number;
  maxStrikes: number;
  availableHints: number;
  gameStatus: "idle" | "playing" | "won" | "lost";

  // UI state
  isLoading: boolean;
  showRules: boolean;
  showLeaderboard: boolean;
  showMoviePoster: boolean;

  // Actions
  setGenre: (genre: string) => void;
  setIndustry: (industry: string) => void;
  setDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
  setCurrentMovie: (movie: Movie | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  initializeGame: () => void;
  guessLetter: (letter: string) => void;
  resetGame: () => void;
  toggleRules: () => void;
  toggleLeaderboard: () => void;
  showPoster: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial game settings
  genre: "All",
  industry: "Hollywood",
  difficulty: "medium",

  // Initial game state
  currentMovie: null,
  displayTitle: "",
  incorrectLetters: [],
  guessedLetters: [],
  wordGuesser: "",
  strikes: 0,
  maxStrikes: 8,
  availableHints: 2,
  gameStatus: "idle",

  // Initial UI state
  isLoading: false,
  showRules: false,
  showLeaderboard: false,
  showMoviePoster: false,

  // Actions
  setGenre: (genre: string) => set({ genre }),

  setIndustry: (industry: string) => set({ industry }),

  setDifficulty: (difficulty: "easy" | "medium" | "hard") => {
    let maxStrikes = 8;
    let availableHints = 2;

    if (difficulty === "medium") {
      maxStrikes = 5;
      availableHints = 2;
    } else if (difficulty === "hard") {
      maxStrikes = 4;
      availableHints = 1;
    }

    set({
      difficulty,
      maxStrikes,
      availableHints,
    });

    localStorage.setItem("reel-fling-hints", availableHints.toString());
  },

  setCurrentMovie: (movie: Movie | null) => set({ currentMovie: movie }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  initializeGame: () => {
    const { currentMovie, difficulty } = get();

    if (!currentMovie) return;

    const displayTitle = currentMovie.title
      .split("")
      .map((letter) => {
        if ("AEIOU".includes(letter.toUpperCase()) || !letter.match(/[A-Z]/i)) {
          return letter;
        }
        return "_";
      })
      .join("");

    let maxStrikes = 8;
    let availableHints = 2;

    if (difficulty === "medium") {
      maxStrikes = 5;
      availableHints = 2;
    } else if (difficulty === "hard") {
      maxStrikes = 4;
      availableHints = 1;
    }

    localStorage.setItem("reel-fling-hints", availableHints.toString());

    set({
      displayTitle,
      incorrectLetters: [],
      guessedLetters: [],
      wordGuesser: "",
      strikes: 0,
      maxStrikes,
      availableHints,
      gameStatus: "playing",
      showMoviePoster: false,
    });
  },

  guessLetter: (letter: string) => {
    const {
      currentMovie,
      displayTitle,
      guessedLetters,
      incorrectLetters,
      strikes,
      maxStrikes,
    } = get();

    if (!currentMovie || guessedLetters.includes(letter)) return;

    const upperLetter = letter.toUpperCase();
    const updatedGuessedLetters = [...guessedLetters, upperLetter];

    if (currentMovie.title.toUpperCase().includes(upperLetter)) {
      const newDisplay = currentMovie.title
        .split("")
        .map((titleLetter, index) => {
          if (titleLetter.toUpperCase() === upperLetter) {
            return titleLetter;
          }
          return displayTitle[index];
        })
        .join("");

      const hasWon = !newDisplay.includes("_");

      set({
        displayTitle: newDisplay,
        guessedLetters: updatedGuessedLetters,
        gameStatus: hasWon ? "won" : "playing",
      });
    } else {
      const newStrikes = strikes + 1;
      const hasLost = newStrikes >= maxStrikes;

      set({
        incorrectLetters: [...incorrectLetters, upperLetter],
        guessedLetters: updatedGuessedLetters,
        strikes: newStrikes,
        gameStatus: hasLost ? "lost" : "playing",
      });
    }
  },

  resetGame: () =>
    set({
      displayTitle: "",
      incorrectLetters: [],
      guessedLetters: [],
      strikes: 0,
      gameStatus: "idle",
      showMoviePoster: false,
    }),

  toggleRules: () => set((state) => ({ showRules: !state.showRules })),

  toggleLeaderboard: () =>
    set((state) => ({ showLeaderboard: !state.showLeaderboard })),

  showPoster: () => set({ showMoviePoster: true }),
}));
