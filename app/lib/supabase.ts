import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// Database interfaces
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_year: number;
  genre: string;
  industry: string;
  difficulty: "easy" | "medium" | "hard";
  description?: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  movie_id: number;
  start_time: string;
  end_time: string | null;
  status: "in_progress" | "won" | "lost";
  difficulty: "easy" | "medium" | "hard";
  incorrect_guesses: string[];
  guessed_letters: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
  level: number;
  experience: number;
}

// Get random movie based on filters
export const getRandomMovie = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  genre: string = "All",
  industry: string = "Hollywood",
  difficulty: "easy" | "medium" | "hard" = "medium",
  userId?: string
) => {
  let query = supabase.from("movies").select("*");

  if (genre !== "All") {
    query = query.eq("genre", genre);
  }

  if (industry !== "All") {
    query = query.eq("industry", industry);
  }

  query = query.eq("difficulty", difficulty);

  // Get up to 100 matching movies
  const { data, error } = await query.limit(100);

  if (error) {
    console.error("Error fetching random movie:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // If user is logged in, prioritize unseen movies
  if (userId) {
    try {
      // Get recently played movies (last 10)
      const { data: recentGames } = await supabase
        .from("game_sessions")
        .select("movie_id")
        .eq("user_id", userId)
        .order("start_time", { ascending: false })
        .limit(10);

      const recentMovieIds = recentGames?.map((game) => game.movie_id) || [];

      // Filter out movies that haven't been played recently
      const unseenMovies = data.filter(
        (movie) => !recentMovieIds.includes(movie.id)
      );

      // If we have unseen movies, pick from those, otherwise use all movies
      if (unseenMovies.length > 0) {
        const randomIndex = Math.floor(Math.random() * unseenMovies.length);
        return unseenMovies[randomIndex] as Movie;
      }
    } catch (err) {
      console.error("Error fetching recent games:", err);
      // Fall back to random selection if there's an error
    }
  }

  // For non-logged in users or if no unseen movies are available, pick a random movie
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex] as Movie;
};

// Track played movie
export const trackPlayedMovie = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  userId: string,
  movieId: number,
  difficulty: string,
  status: "in_progress" | "won" | "lost" = "in_progress"
) => {
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        user_id: userId,
        movie_id: movieId,
        start_time: new Date().toISOString(),
        status: status,
        difficulty: difficulty,
        incorrect_guesses: [],
        guessed_letters: [],
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error tracking played movie:", error);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error("Error in trackPlayedMovie:", err);
    return null;
  }
};

// Update game session status
export const updateGameSession = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  sessionId: string,
  status: "won" | "lost",
  incorrectGuesses: string[] = [],
  guessedLetters: string[] = []
) => {
  try {
    const { error } = await supabase
      .from("game_sessions")
      .update({
        status: status,
        end_time: new Date().toISOString(),
        incorrect_guesses: incorrectGuesses,
        guessed_letters: guessedLetters,
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating game session:", error);
    }
  } catch (err) {
    console.error("Error in updateGameSession:", err);
  }
};

// Update user profile after game
export const updateUserAfterGame = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  userId: string,
  gameWon: boolean
) => {
  // Get current user profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    console.error("Error fetching user profile:", error);
    return;
  }

  // Calculate new stats
  const gamesPlayed = profile.games_played + 1;
  const gamesWon = gameWon ? profile.games_won + 1 : profile.games_won;
  const currentStreak = gameWon ? profile.current_streak + 1 : 0;
  const maxStreak = Math.max(currentStreak, profile.max_streak);

  // Calculate experience and level
  const expGained = gameWon ? 10 : 2;
  const newExp = profile.experience + expGained;
  const expPerLevel = 50;
  const newLevel = Math.floor(newExp / expPerLevel) + 1;

  // Update profile
  await supabase
    .from("profiles")
    .update({
      games_played: gamesPlayed,
      games_won: gamesWon,
      current_streak: currentStreak,
      max_streak: maxStreak,
      level: newLevel,
      experience: newExp,
    })
    .eq("id", userId);
};
