import { Movie } from "./supabase";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabaseClient: any = null;

if (supabaseUrl && supabaseKey) {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

// Map genre IDs to names
const genreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// Map popularity to difficulty
const getDifficulty = (popularity: number): "easy" | "medium" | "hard" => {
  if (popularity > 50) return "easy";
  if (popularity > 20) return "medium";
  return "hard";
};

// Interface for the movie data from Supabase
interface SupabaseMovie {
  id: number;
  title: string;
  description: string;
  poster_url: string | null | undefined;
  release_year: number | null;
  genre: string;
  industry: string;
  difficulty: string;
}

// Add a type guard function
function isValidPosterUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.length > 0;
}

/**
 * Fetch movies from Supabase database
 */
export const fetchMoviesFromTMDB = async (
  genre: string = "All",
  industry: string = "Hollywood"
): Promise<Movie[]> => {
  if (!supabaseClient) {
    console.warn("Supabase client not initialized, using mock data instead");
    return [];
  }

  try {
    // Build the query
    let query = supabaseClient.from("movies").select("*").order("id");

    // Add filters
    if (genre !== "All") {
      query = query.eq("genre", genre);
    }

    if (industry !== "All" && industry !== "Hollywood") {
      query = query.eq("industry", industry);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || !data.length) {
      return [];
    }

    // Convert to our app's Movie format
    return data.map(
      (movie: SupabaseMovie): Movie => ({
        id: movie.id,
        title: movie.title.toUpperCase(),
        // @ts-ignore - Store the full poster URL directly
        poster_path: isValidPosterUrl(movie.poster_url)
          ? movie.poster_url
          : null,
        release_year: movie.release_year || 0,
        genre: movie.genre || "Other",
        industry: movie.industry || "Hollywood",
        difficulty: movie.difficulty as "easy" | "medium" | "hard",
        description:
          movie.description || "No description available for this movie.",
      })
    );
  } catch (error) {
    console.error("Error fetching movies from Supabase:", error);
    return [];
  }
};

/**
 * Get a random movie from Supabase based on genre, industry and difficulty
 */
export function getRandomTMDBMovie(
  genre: string = "All",
  industry: string = "Hollywood",
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<Movie | null> {
  return new Promise(async (resolve) => {
    try {
      if (!supabaseClient) {
        console.warn("Supabase client not initialized");
        resolve(null);
        return;
      }

      console.log(
        `Fetching movie with genre: ${genre}, industry: ${industry}, difficulty: ${difficulty}`
      );

      // Build the query
      let query = supabaseClient.from("movies").select("*");

      // Add filters
      if (genre !== "All") {
        query = query.eq("genre", genre);
      }

      // Make sure industry filter is case-insensitive
      if (industry !== "All") {
        // Use ilike for case-insensitive matching
        query = query.ilike("industry", `%${industry}%`);
      }

      if (difficulty) {
        query = query.eq("difficulty", difficulty);
      }

      // Execute query
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let moviesData = data || [];

      if (!moviesData.length) {
        console.log(
          `No movies found with the given filters. Trying with fewer filters...`
        );

        // Try again with just the industry filter
        const { data: fallbackData, error: fallbackError } =
          await supabaseClient
            .from("movies")
            .select("*")
            .eq("industry", industry)
            .limit(50);

        if (fallbackError || !fallbackData || !fallbackData.length) {
          console.log("Still no results, returning null");
          resolve(null);
          return;
        }

        moviesData = fallbackData;
      }

      console.log(`Found ${moviesData.length} movies matching criteria`);

      // Get a random movie
      const randomIndex = Math.floor(Math.random() * moviesData.length);
      const supabaseMovie = moviesData[randomIndex] as SupabaseMovie;

      console.log(
        `Selected movie: ${supabaseMovie.title} (${supabaseMovie.industry})`
      );

      // Convert to app's Movie format using helper function
      const movie = convertSupabaseMovieToAppMovie(supabaseMovie);
      resolve(movie);
    } catch (error) {
      console.error("Error getting random movie from Supabase:", error);
      resolve(null);
    }
  });
}

/**
 * Helper function to convert from Supabase movie format to app Movie format
 */
function convertSupabaseMovieToAppMovie(supabaseMovie: SupabaseMovie): Movie {
  // Use the type guard to validate the poster URL
  // @ts-ignore - Store the full poster URL directly
  const posterPath = isValidPosterUrl(supabaseMovie.poster_url)
    ? supabaseMovie.poster_url
    : null;

  return {
    id: supabaseMovie.id,
    title: supabaseMovie.title.toUpperCase(),
    poster_path: posterPath,
    release_year: supabaseMovie.release_year || 0,
    genre: supabaseMovie.genre || "Other",
    industry: supabaseMovie.industry || "Hollywood",
    difficulty: supabaseMovie.difficulty as "easy" | "medium" | "hard",
    description:
      supabaseMovie.description || "No description available for this movie.",
  };
}

/**
 * Get full URL for a movie poster
 */
export const getMoviePoster = (posterPath: string | null): string => {
  if (!posterPath) return "/images/no-poster.png"; // Fallback poster image

  // If it's a Supabase URL, use it directly
  if (posterPath.includes("supabase") || posterPath.startsWith("http")) {
    return posterPath;
  }

  // Otherwise, assume it's a TMDb path
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

// Create an object with all exports for compatibility
const tmdbApi = {
  fetchMoviesFromTMDB,
  getRandomTMDBMovie,
  getMoviePoster,
};

// Export as default and named exports
export default tmdbApi;
