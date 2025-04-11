"use client";

// Types for local progress tracking
export interface LocalGameProgress {
  totalGames: number;
  wins: number;
  losses: number;
  streak: number;
  highestStreak: number;
  level: number;
  xp: number;
  hintsAvailable: number;
  playedMovies: {
    id: number;
    title: string;
    result: "win" | "loss";
    date: string;
  }[];
  dailyChallenge: {
    lastCompleted: string | null;
    streak: number;
    nextAvailable: string | null;
  };
}

// Default progress
const DEFAULT_PROGRESS: LocalGameProgress = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  streak: 0,
  highestStreak: 0,
  level: 1,
  xp: 0,
  hintsAvailable: 1,
  playedMovies: [],
  dailyChallenge: {
    lastCompleted: null,
    streak: 0,
    nextAvailable: null,
  },
};

// Get local progress
export const getLocalProgress = (): LocalGameProgress => {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;

  const savedProgress = localStorage.getItem("reel-fling-progress");
  if (!savedProgress) {
    localStorage.setItem(
      "reel-fling-progress",
      JSON.stringify(DEFAULT_PROGRESS)
    );
    return DEFAULT_PROGRESS;
  }

  try {
    return JSON.parse(savedProgress);
  } catch (error) {
    console.error("Error parsing saved progress:", error);
    return DEFAULT_PROGRESS;
  }
};

// Save local progress
export const saveLocalProgress = (progress: LocalGameProgress): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("reel-fling-progress", JSON.stringify(progress));
};

// Calculate XP based on game result and difficulty
const calculateXP = (
  result: "win" | "loss",
  difficulty: string,
  incorrectLetters: string[]
): number => {
  // Base XP
  let xp = result === "win" ? 10 : 2;

  // Difficulty multiplier
  if (difficulty === "medium") xp *= 1.5;
  if (difficulty === "hard") xp *= 2;

  // Bonus for fewer incorrect guesses when winning
  if (result === "win" && incorrectLetters.length <= 3) {
    xp += 5;
  }

  return Math.floor(xp);
};

// Calculate level based on XP
const calculateLevel = (xp: number): number => {
  // Level progression formula: level = 1 + floor(sqrt(xp/10))
  // This makes each level progressively harder to reach
  return 1 + Math.floor(Math.sqrt(xp / 10));
};

// Update progress after a game
export const updateLocalProgressAfterGame = (
  result: "win" | "loss",
  movieId: number,
  movieTitle: string,
  guessedLetters: string[],
  incorrectLetters: string[],
  difficulty: string
): void => {
  const progress = getLocalProgress();

  // Update basic stats
  progress.totalGames += 1;
  if (result === "win") {
    progress.wins += 1;
    progress.streak += 1;

    // Update highest streak if current streak is higher
    if (progress.streak > progress.highestStreak) {
      progress.highestStreak = progress.streak;
    }
  } else {
    progress.losses += 1;
    progress.streak = 0;
  }

  // Calculate and add XP
  const earnedXP = calculateXP(result, difficulty, incorrectLetters);
  progress.xp += earnedXP;

  // Calculate new level
  const newLevel = calculateLevel(progress.xp);

  // If level increased, always reset to 1 hint available
  if (newLevel > progress.level) {
    progress.hintsAvailable = 1;

    // Update hints in local storage separately
    localStorage.setItem(
      "reel-fling-hints",
      progress.hintsAvailable.toString()
    );
  }

  // Update level
  progress.level = newLevel;

  // Add movie to played movies
  progress.playedMovies.push({
    id: movieId,
    title: movieTitle,
    result: result,
    date: new Date().toISOString(),
  });

  // Keep only last 50 played movies to avoid large localStorage
  if (progress.playedMovies.length > 50) {
    progress.playedMovies = progress.playedMovies.slice(-50);
  }

  // Save updated progress
  saveLocalProgress(progress);
};

// Check if a hint can be used
export const useHint = (): boolean => {
  const progress = getLocalProgress();

  if (progress.hintsAvailable <= 0) {
    return false;
  }

  // Decrease available hints
  progress.hintsAvailable -= 1;
  saveLocalProgress(progress);

  // Update hints in local storage separately
  localStorage.setItem("reel-fling-hints", progress.hintsAvailable.toString());

  return true;
};
