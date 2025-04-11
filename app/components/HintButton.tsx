"use client";

import { useState, useEffect } from "react";
import { FaLightbulb } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useGameStore } from "@/app/store/gameStore";
import { getLocalProgress, useHint } from "@/app/lib/localProgress";

interface HintButtonProps {
  onUseHint: (letter: string) => void;
}

export default function HintButton({ onUseHint }: HintButtonProps) {
  const [availableHints, setAvailableHints] = useState(1);
  const { currentMovie, displayTitle, incorrectLetters } = useGameStore();

  // Load available hints from localStorage
  useEffect(() => {
    const loadHints = () => {
      const progress = getLocalProgress();
      setAvailableHints(progress.hintsAvailable);
    };

    loadHints();

    // Set up an event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "reel-fling-hints" || e.key === "reel-fling-progress") {
        loadHints();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const findHintLetter = (): string | null => {
    if (!currentMovie?.title) return null;

    // Get the list of consonants that haven't been guessed yet
    const unguessedConsonants = Array.from("BCDFGHJKLMNPQRSTVWXYZ").filter(
      (letter) =>
        !incorrectLetters.includes(letter) &&
        !displayTitle.includes(letter) &&
        currentMovie.title.toUpperCase().includes(letter)
    );

    if (unguessedConsonants.length === 0) return null;

    // Find the most common consonant in the movie title
    const letterCounts = unguessedConsonants.reduce((acc, letter) => {
      const count = (
        currentMovie.title.toUpperCase().match(new RegExp(letter, "g")) || []
      ).length;
      return { ...acc, [letter]: count };
    }, {} as Record<string, number>);

    // Get the letter that appears most frequently
    const sortedLetters = Object.entries(letterCounts).sort(
      (a, b) => b[1] - a[1]
    );
    return sortedLetters[0]?.[0] || null;
  };

  const handleHint = () => {
    if (availableHints <= 0) {
      toast.error("No hints available! You get 1 hint per game.");
      return;
    }

    const hintLetter = findHintLetter();
    if (!hintLetter) {
      toast.info("No helpful hints available");
      return;
    }

    // Use the hint
    const hintUsed = useHint();
    if (!hintUsed) {
      toast.error("Failed to use hint");
      return;
    }

    // Set available hints to 0 - only one hint per game
    setAvailableHints(0);
    onUseHint(hintLetter);

    toast.success(`Hint used: The letter "${hintLetter}" is in the title`, {
      description: "No hints remaining",
    });
  };

  return (
    <div className="flex justify-center my-4">
      <motion.button
        onClick={handleHint}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={availableHints <= 0}
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
          availableHints <= 0
            ? "bg-gray-600 cursor-not-allowed opacity-70"
            : "bg-yellow-600 hover:bg-yellow-500"
        }`}
      >
        <FaLightbulb className="text-yellow-300" />
        <span>Use Hint {availableHints > 0 && "(1 available)"}</span>
      </motion.button>
    </div>
  );
}
