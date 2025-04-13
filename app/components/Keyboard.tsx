"use client";

import { motion } from "framer-motion";

interface KeyboardProps {
  guessedLetters: string[];
  incorrectLetters: string[];
  onGuess: (letter: string) => void;
}

export default function Keyboard({
  guessedLetters,
  incorrectLetters,
  onGuess,
}: KeyboardProps) {
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
}
