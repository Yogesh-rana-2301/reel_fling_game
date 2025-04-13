"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsQuestionCircleFill,
  BsTrophy,
  BsCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs";
import { useGameStore } from "@/app/store/gameStore";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import {
  getRandomMovie,
  updateUserAfterGame,
  trackPlayedMovie,
  updateGameSession,
} from "@/app/lib/supabase";
import { getRandomMockMovie } from "@/app/lib/mockData";
import Image from "next/image";
import Confetti from "react-confetti";
import { toast } from "sonner";
import { getRandomTMDBMovie } from "@/app/lib/tmdb";
import HintButton from "@/app/components/HintButton";
import { updateLocalProgressAfterGame } from "@/app/lib/localProgress";
import Leaderboard from "@/app/components/Leaderboard";
import FixedImage from "@/app/components/FixedImage";

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

  const { supabase, user } = useSupabase();

  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const [posterLoaded, setPosterLoaded] = useState(false);

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

      // Update game session if it exists
      if (supabase && user && gameSessionId) {
        updateGameSession(
          supabase,
          gameSessionId,
          gameStatus,
          incorrectLetters,
          guessedLetters
        );

        // Update user stats as well
        updateUserAfterGame(supabase, user.id, gameStatus === "won");
      }

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
    supabase,
    user,
    gameSessionId,
  ]);

  // Handle start game
  const handleStartGame = async () => {
    // Show loading state
    setIsLoading(true);
    setGameSessionId(null);

    try {
      // Try to fetch from TMDB first
      const tmdbMovie = await getRandomTMDBMovie(genre, industry, difficulty);
      if (tmdbMovie) {
        setCurrentMovie(tmdbMovie);
        initializeGame();

        // Track the game session if user is logged in
        if (supabase && user) {
          const sessionId = await trackPlayedMovie(
            supabase,
            user.id,
            tmdbMovie.id,
            difficulty
          );
          setGameSessionId(sessionId);
        }

        setIsLoading(false);
        return;
      }

      // If TMDB fails or is not available, try Supabase
      if (supabase) {
        // Pass the user ID if available to avoid recent movies
        const movie = await getRandomMovie(
          supabase,
          genre,
          industry,
          difficulty,
          user?.id
        );
        if (movie) {
          setCurrentMovie(movie);
          initializeGame();

          // Track the game session if user is logged in
          if (user) {
            const sessionId = await trackPlayedMovie(
              supabase,
              user.id,
              movie.id,
              difficulty
            );
            setGameSessionId(sessionId);
          }

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
              {displayTitle.split("").map((letter, index) => {
                // Handle spaces in the movie title
                if (currentMovie?.title.charAt(index) === " ") {
                  return (
                    <div
                      key={index}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center"
                    ></div>
                  );
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`letter-box text-sm sm:text-base md:text-lg w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 ${
                      letter !== "_" ? "correct-letter" : ""
                    }`}
                  >
                    {letter === "_" ? " " : letter}
                  </motion.div>
                );
              })}
            </div>

            {/* Word Guesser with strike-through effect for FILMQUIZ */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-gray-400 mb-1">Remaining Chances:</p>
              <div className="word-guesser text-sm sm:text-base md:text-lg">
                {difficulty === "easy" && (
                  <>
                    {wordGuesser.split("").map((letter, index) => (
                      <span
                        key={index}
                        className={index < strikes ? "strike-through" : ""}
                      >
                        {letter}
                      </span>
                    ))}
                  </>
                )}
                {difficulty === "medium" && (
                  <>
                    <span className="strike-through">F</span>
                    <span className="strike-through">I</span>
                    <span className="strike-through">L</span>
                    {wordGuesser
                      .substring(3)
                      .split("")
                      .map((letter, index) => (
                        <span
                          key={index}
                          className={index < strikes ? "strike-through" : ""}
                        >
                          {letter}
                        </span>
                      ))}
                  </>
                )}
                {difficulty === "hard" && (
                  <>
                    <span className="strike-through">F</span>
                    <span className="strike-through">I</span>
                    <span className="strike-through">L</span>
                    <span className="strike-through">M</span>
                    {wordGuesser
                      .substring(4)
                      .split("")
                      .map((letter, index) => (
                        <span
                          key={index}
                          className={index < strikes ? "strike-through" : ""}
                        >
                          {letter}
                        </span>
                      ))}
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {maxStrikes - strikes} chances left
              </p>
            </div>

            {/* Show incorrect letters - always visible */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-1">Incorrect letters:</p>
              <div className="flex justify-center flex-wrap max-w-xs mx-auto">
                {incorrectLetters.length > 0 ? (
                  incorrectLetters.map((letter) => (
                    <span key={letter} className="incorrect-letter">
                      {letter}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">None yet</span>
                )}
              </div>
            </div>
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
                  <div
                    className={`flex justify-center w-full max-w-xs mx-auto my-6 transition-opacity ${
                      posterLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <FixedImage
                      src={currentMovie.poster_path || "/images/no-poster.png"}
                      alt={currentMovie.title}
                      width={250}
                      height={375}
                      className="rounded-lg shadow-lg"
                      priority
                      onLoad={() => setPosterLoaded(true)}
                    />
                  </div>
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
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-xl mx-auto">
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
                      className={`keyboard-btn text-xs sm:text-sm md:text-base w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ${
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
