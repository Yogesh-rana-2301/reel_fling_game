"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/app/store/gameStore";
import { IoMdClose } from "react-icons/io";

export default function HowToPlay() {
  const toggleRules = useGameStore((state) => state.toggleRules);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-secondary rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">How to Play</h2>
          <button
            onClick={toggleRules}
            className="text-gray-400 hover:text-white"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="text-xl font-semibold mb-2">Game Objective</h3>
            <p>
              Guess the hidden movie title by guessing one letter at a time.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">How It Works</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <span className="font-medium">Movie Title Display:</span> The
                movie title is shown with only the vowels (A, E, I, O, U)
                pre-filled.
                <div className="bg-primary p-2 rounded mt-1 flex flex-wrap">
                  <span className="letter-box text-sm mx-1">I</span>
                  <span className="letter-box text-sm mx-1">_</span>
                  <span className="letter-box text-sm mx-1">_</span>
                  <span className="letter-box text-sm mx-1">E</span>
                  <span className="letter-box text-sm mx-1">_</span>
                  <span className="letter-box text-sm mx-1">_</span>
                  <span className="letter-box text-sm mx-1">I</span>
                  <span className="letter-box text-sm mx-1">O</span>
                  <span className="letter-box text-sm mx-1">_</span>
                </div>
              </li>
              <li>
                <span className="font-medium">Letter Guessing:</span> Click on
                consonants to guess. Correct guesses will reveal all instances
                of that letter in the title.
              </li>
              <li>
                <span className="font-medium">Incorrect Guesses:</span> Any
                incorrect guesses will be shown in red and will strike through
                one letter of "FILMQUIZ".
              </li>
              <li>
                <span className="font-medium">Winning:</span> Complete the movie
                title to win.
              </li>
              <li>
                <span className="font-medium">Losing:</span> If all letters in
                "FILMQUIZ" are struck through, the game ends and you lose.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Difficulty Levels</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-medium text-green-400">Easy:</span> More
                common movies with 8 guesses and 1 hint available.
              </li>
              <li>
                <span className="font-medium text-yellow-400">Medium:</span>{" "}
                Less common movies with 5 guesses and 1 hint available.
              </li>
              <li>
                <span className="font-medium text-red-400">Hard:</span> Least
                common plus newer movies with 4 guesses and 1 hint available.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Game Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Choose from various movie genres</li>
              <li>Select different movie industries worldwide</li>
              <li>View the movie poster upon game completion</li>
              <li>Track your progress on the leaderboard</li>
              <li>Celebrate wins with special animations</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={toggleRules} className="btn-primary">
            Got it!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
