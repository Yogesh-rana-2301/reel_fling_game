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
  const [availableHints, setAvailableHints] = useState(2);
  const [cooldown, setCooldown] = useState(false);
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
      toast.error("No hints available!");
      return;
    }

    if (cooldown) {
      toast.info("Hint on cooldown");
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

    setAvailableHints((prev) => prev - 1);
    onUseHint(hintLetter);

    // Set cooldown
    setCooldown(true);
    setTimeout(() => setCooldown(false), 10000); // 10 second cooldown

    toast.success(`Hint used: The letter "${hintLetter}" is in the title`, {
      description: `${availableHints - 1} hints remaining`,
    });
  };

  return (
    <div className="flex justify-center my-4">
      <motion.button
        onClick={handleHint}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={availableHints <= 0 || cooldown}
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
          availableHints <= 0 || cooldown
            ? "bg-gray-600 cursor-not-allowed opacity-70"
            : "bg-yellow-600 hover:bg-yellow-500"
        }`}
      >
        <FaLightbulb className="text-yellow-300" />
        <span>Use Hint {availableHints > 0 && `(${availableHints} left)`}</span>
      </motion.button>
    </div>
  );
}
