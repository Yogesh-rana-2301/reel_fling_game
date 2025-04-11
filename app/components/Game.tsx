"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsQuestionCircleFill, BsTrophy } from "react-icons/bs";
import { useGameStore } from "@/app/store/gameStore";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import { getRandomMovie, updateUserAfterGame } from "@/app/lib/supabase";
import { getRandomMockMovie } from "@/app/lib/mockData";
import Image from "next/image";
import Confetti from "react-confetti";
import { toast } from "sonner";
import { getRandomTMDBMovie } from "@/app/lib/tmdb";
import HintButton from "@/app/components/HintButton";
import { updateLocalProgressAfterGame } from "@/app/lib/localProgress";
import Leaderboard from "@/app/components/Leaderboard";

export default function Game() {
  const {
    genre,
    industry,
    difficulty,
    currentMovie,
    displayTitle,
    incorrectLetters,
    wordGuesser,
    strikes,
    gameStatus,
    showMoviePoster,
    setCurrentMovie,
    initializeGame,
    guessLetter,
    resetGame,
    toggleRules,
    toggleLeaderboard,
    showPoster,
    isLoading,
    setIsLoading,
    guessedLetters,
    maxStrikes,
    showLeaderboard,
  } = useGameStore();

  const { supabase } = useSupabase();

  useEffect(() => {
    if (!currentMovie) return;

    if (gameStatus === "won" || gameStatus === "lost") {
      // Update local progress
      updateLocalProgressAfterGame(
        gameStatus === "won" ? "win" : "loss",
        currentMovie.id,
        currentMovie.title,
        guessedLetters,
        incorrectLetters,
        difficulty
      );

      // Show poster after a short delay
      const timer = setTimeout(() => {
        showPoster();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [
    gameStatus,
    currentMovie,
    guessedLetters,
    incorrectLetters,
    difficulty,
    showPoster,
  ]);

  // Handle start game
  const handleStartGame = async () => {
    // Show loading state
    setIsLoading(true);

    try {
      // Try to fetch from TMDB first
      const tmdbMovie = await getRandomTMDBMovie(genre, industry, difficulty);
      if (tmdbMovie) {
        setCurrentMovie(tmdbMovie);
        initializeGame();
        setIsLoading(false);
        return;
      }

      // If TMDB fails or is not available, try Supabase
      if (supabase) {
        const movie = await getRandomMovie(
          supabase,
          genre,
          industry,
          difficulty
        );
        if (movie) {
          setCurrentMovie(movie);
          initializeGame();
          setIsLoading(false);
          return;
        }
      }

      // If both fail, use mock data
      const mockMovie = getRandomMockMovie(genre, industry, difficulty);
      setCurrentMovie(mockMovie);
      initializeGame();
      toast.info("Using sample movie data", {
        description: "Using built-in movie database as fallback.",
      });
    } catch (error) {
      console.error("Error starting game:", error);
      // Final fallback
      const mockMovie = getRandomMockMovie(genre, industry, difficulty);
      setCurrentMovie(mockMovie);
      initializeGame();
      toast.error("Error fetching movie", {
        description: "Using built-in movie database instead.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle hint usage
  const handleUseHint = (letter: string) => {
    guessLetter(letter);
  };

  return (
    <div className="game-container relative">
      {/* Quit/Restart button - moved to top left */}
      {gameStatus === "playing" && (
        <div className="absolute top-4 left-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5z" />
            </svg>
            Quit
          </motion.button>
        </div>
      )}

      {/* Header section */}
      <div className="mb-8 text-center">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-2 font-display"
        >
          Reel <span className="text-accent">Fling</span>
        </motion.h1>
        <p className="text-gray-300">
          Guess the movie title, one letter at a time!
        </p>
        {/* Add game control buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRules}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary hover:bg-secondary-light"
          >
            <BsQuestionCircleFill />
            <span className="text-sm">Rules</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLeaderboard}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary hover:bg-secondary-light"
          >
            <BsTrophy className="text-yellow-400" />
            <span className="text-sm">Leaderboard</span>
          </motion.button>
        </div>
      </div>

      {/* Game Settings (shown before starting game) */}
      {gameStatus === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Difficulty selection */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Select Difficulty</h2>
            <div className="flex flex-wrap gap-2">
              {["easy", "medium", "hard"].map((level) => (
                <button
                  key={level}
                  onClick={() =>
                    useGameStore.getState().setDifficulty(level as any)
                  }
                  className={`genre-btn ${
                    difficulty === level ? "bg-accent" : "bg-secondary"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Genre selection */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Select Genre</h2>
            <div className="flex flex-wrap gap-2">
              {[
                "All",
                "Action",
                "Comedy",
                "Drama",
                "Horror",
                "Romance",
                "Thriller",
                "Science Fiction",
                "Animation",
                "Adult",
                "Recent 5 Years",
              ].map((g) => (
                <button
                  key={g}
                  onClick={() => useGameStore.getState().setGenre(g)}
                  className={`genre-btn ${
                    genre === g ? "bg-accent" : "bg-secondary"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Industry selection */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Select Industry</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium mb-2">World</h3>
                <div className="flex flex-wrap gap-2">
                  {["Hollywood", "Nollywood", "Chinese Cinema"].map((ind) => (
                    <button
                      key={ind}
                      onClick={() => useGameStore.getState().setIndustry(ind)}
                      className={`industry-btn ${
                        industry === ind ? "bg-accent" : "bg-secondary"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">India</h3>
                <div className="flex flex-wrap gap-2">
                  {["Bollywood", "Tollywood", "Kollywood", "Sandalwood"].map(
                    (ind) => (
                      <button
                        key={ind}
                        onClick={() => useGameStore.getState().setIndustry(ind)}
                        className={`industry-btn ${
                          industry === ind ? "bg-accent" : "bg-secondary"
                        }`}
                      >
                        {ind}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Special</h3>
                <div className="flex flex-wrap gap-2">
                  {["Korean", "Japanese", "French", "Spanish"].map((ind) => (
                    <button
                      key={ind}
                      onClick={() => useGameStore.getState().setIndustry(ind)}
                      className={`industry-btn ${
                        industry === ind ? "bg-accent" : "bg-secondary"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Start game button */}
          <div className="pt-4 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-3"
              onClick={handleStartGame}
            >
              Start Game
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main game area (when a game is running) */}
      {gameStatus !== "idle" && (
        <div className="space-y-8">
          {/* Display the movie title with blanks for consonants */}
          {gameStatus === "playing" && currentMovie?.description && (
            <div
              className="bg-secondary p-4 rounded-lg max-w-2xl mx-auto 
            mb-2"
            >
              <h3 className="text-lg font-semibold mb-2">Movie Hint:</h3>
              <p className="text-sm text-gray-300 italic">
                "{currentMovie.description}"
              </p>
            </div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {displayTitle.split("").map((letter, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`letter-box ${
                    letter !== "_" ? "correct-letter" : ""
                  }`}
                >
                  {letter === "_" ? " " : letter}
                </motion.div>
              ))}
            </div>

            {/* Word Guesser with strike-through effect for FILMQUIZ */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-gray-400 mb-1">Remaining Chances:</p>
              <div className="word-guesser">
                {wordGuesser.split("").map((letter, index) => (
                  <span
                    key={index}
                    className={index < strikes ? "strike-through" : ""}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {wordGuesser.length - strikes} chances left
              </p>
            </div>

            {/* Show incorrect letters */}
            {incorrectLetters.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-1">Incorrect letters:</p>
                <div className="flex justify-center flex-wrap max-w-xs mx-auto">
                  {incorrectLetters.map((letter) => (
                    <span key={letter} className="incorrect-letter">
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Game result screen */}
          <AnimatePresence>
            {(gameStatus === "won" || gameStatus === "lost") && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center py-4"
              >
                <h2 className="text-2xl font-bold mb-2">
                  {gameStatus === "won" ? "🎉 You Won! 🎉" : "Game Over!"}
                </h2>
                <p className="text-lg mb-4">
                  {gameStatus === "won"
                    ? "Congratulations! You've correctly guessed the movie title."
                    : `The movie title was: ${currentMovie?.title}`}
                </p>

                {/* Movie poster */}
                {showMoviePoster && currentMovie && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="my-4 flex justify-center"
                  >
                    {currentMovie.poster_path ? (
                      <div className="relative w-48 h-72 rounded-lg overflow-hidden border-2 border-accent">
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
                          alt={currentMovie.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-72 rounded-lg border-2 border-accent flex items-center justify-center bg-primary">
                        <div className="text-center p-4">
                          <p className="text-sm text-gray-400 mb-2">
                            No poster available
                          </p>
                          <p className="font-semibold text-accent">
                            {currentMovie.title}
                          </p>
                          {currentMovie.release_year && (
                            <p className="text-sm mt-1">
                              ({currentMovie.release_year})
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <button className="btn-primary mt-4" onClick={resetGame}>
                  Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confetti animation on win */}
          {gameStatus === "won" && (
            <Confetti recycle={false} numberOfPieces={200} />
          )}

          {/* Keyboard for letter guessing (only shown during active gameplay) */}
          {gameStatus === "playing" && (
            <>
              {/* Hint button */}
              <HintButton onUseHint={handleUseHint} />

              {/* Existing keyboard */}
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {Array.from("BCDFGHJKLMNPQRSTVWXYZ").map((letter) => {
                  const isGuessed =
                    incorrectLetters.includes(letter) ||
                    displayTitle.includes(letter);

                  return (
                    <motion.button
                      key={letter}
                      whileHover={!isGuessed ? { scale: 1.1 } : {}}
                      whileTap={!isGuessed ? { scale: 0.9 } : {}}
                      disabled={isGuessed}
                      onClick={() => guessLetter(letter)}
                      className={`keyboard-btn ${
                        isGuessed
                          ? incorrectLetters.includes(letter)
                            ? "wrong-letter cursor-not-allowed opacity-60"
                            : "correct-letter cursor-not-allowed opacity-60"
                          : "bg-accent hover:bg-opacity-90"
                      }`}
                    >
                      {letter}
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Show Leaderboard when active */}
      {showLeaderboard && <Leaderboard />}

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
