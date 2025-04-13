"use client";

import { useEffect } from "react";
import HowToPlay from "@/app/components/HowToPlay";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

export default function HowToPlayPage() {
  return (
    <div className="py-8 container mx-auto">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-accent hover:underline"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="game-container"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">
            How to Play <span className="text-accent">Reel Fling</span>
          </h1>
          <p className="text-gray-300">
            Learn the game rules and tips to improve your score
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Game Objective</h2>
            <p className="mb-2">
              Guess the hidden movie title by guessing one letter at a time
              before you run out of chances.
            </p>
            <p>
              You win when you successfully reveal the entire movie title. You
              lose if you make too many incorrect guesses and run out of chances
              (represented by the letters in "FILMQUIZ").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Game Modes</h2>

            <div className="space-y-4">
              <div className="bg-secondary bg-opacity-40 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Single Player</h3>
                <p>
                  The classic gameplay. Guess the movie title at your own pace.
                  Your progress is saved and you earn XP to level up.
                </p>
              </div>

              <div className="bg-secondary bg-opacity-40 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Multiplayer</h3>
                <p>
                  Create or join a lobby to play with friends. Each player
                  guesses independently, and the first to complete the title
                  gets the highest rank.
                </p>
              </div>

              <div className="bg-secondary bg-opacity-40 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Daily Challenge</h3>
                <p>
                  A new movie challenge each day, the same for all players.
                  Complete daily challenges to maintain your streak and earn
                  bonus XP.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <span className="font-medium">Vowels Revealed:</span> The game
                starts with all vowels (A, E, I, O, U) pre-filled, along with
                any spaces and special characters.
              </li>
              <li>
                <span className="font-medium">Guess Consonants:</span> Use the
                on-screen keyboard or your physical keyboard to guess the
                remaining consonants.
              </li>
              <li>
                <span className="font-medium">Chances:</span> For each incorrect
                guess, one letter in "FILMQUIZ" gets struck through. When all
                letters are struck, you lose.
              </li>
              <li>
                <span className="font-medium">Hints:</span> If you get stuck,
                you can use a hint to reveal a random consonant. Earn hints by
                leveling up.
              </li>
              <li>
                <span className="font-medium">Timer:</span> In multiplayer mode,
                there's a time limit based on the difficulty level. The game
                ends when time runs out.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Difficulty Levels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-400">
                  Easy
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>More popular movies</li>
                  <li>Single player: uses "FILMQUIZ" (8 chances)</li>
                  <li>Multiplayer: 2 minutes time limit</li>
                </ul>
              </div>

              <div className="bg-yellow-900 bg-opacity-30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-yellow-400">
                  Medium
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Moderately popular movies</li>
                  <li>Single player: uses "MQUIZ" (5 chances)</li>
                  <li>Multiplayer: 1 minutes time limit</li>
                </ul>
              </div>

              <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-red-400">
                  Hard
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Less popular or indie movies</li>
                  <li>Single player: starts with 4 strikes</li>
                  <li>Multiplayer: 30 seconds time limit</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Tips & Tricks</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-medium">Common Letters:</span> Start with
                common consonants like R, T, N, S, L.
              </li>
              <li>
                <span className="font-medium">Word Patterns:</span> Look for
                common word patterns in English like "THE" or "ING".
              </li>
              <li>
                <span className="font-medium">Movie Genres:</span> Filter by
                genre to narrow down the possibilities.
              </li>
              <li>
                <span className="font-medium">Release Year:</span> Sometimes the
                year can give clues about the movie era or style.
              </li>
              <li>
                <span className="font-medium">Save Hints:</span> Save your hints
                for when you're really stuck.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="btn-primary px-6 py-3">
            Ready to Play!
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
