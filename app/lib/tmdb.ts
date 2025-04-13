import { Movie } from "./supabase";

// TMDB API integration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

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

// Add a new interface for TMDB API responses
interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  genre_ids: number[];
  popularity: number;
  overview: string;
}

/**
 * Fetch movies from TMDB API
 */
export const fetchMoviesFromTMDB = async (
  genre: string = "All",
  industry: string = "Hollywood"
): Promise<Movie[]> => {
  if (!TMDB_API_KEY) {
    console.warn("TMDB API key not found, using mock data instead");
    return [];
  }

  try {
    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=1`;

    // Add genre filter if specified
    if (genre !== "All") {
      const genreId = Object.entries(genreMap).find(
        ([_, name]) => name === genre
      )?.[0];
      if (genreId) {
        url += `&with_genres=${genreId}`;
      }
    }

    // Handle industry filter
    if (industry !== "Hollywood" && industry !== "All") {
      // Map industries to region codes or language codes
      let regionCode = "";
      switch (industry) {
        case "Bollywood":
          regionCode = "IN";
          url += "&with_original_language=hi";
          break;
        case "Korean":
          regionCode = "KR";
          url += "&with_original_language=ko";
          break;
        case "Japanese":
          regionCode = "JP";
          url += "&with_original_language=ja";
          break;
        case "French":
          regionCode = "FR";
          url += "&with_original_language=fr";
          break;
        case "Spanish":
          url += "&with_original_language=es";
          break;
        case "Chinese Cinema":
          url += "&with_original_language=zh";
          break;
        // Add other industries as needed
      }

      if (regionCode) {
        url += `&region=${regionCode}`;
      }
    }

    // Try to use our proxy API first
    try {
      const params = new URLSearchParams({
        difficulty: "medium",
        genre: genre.toLowerCase(),
        industry: industry.toLowerCase(),
        recent: "false",
        page: "1",
      });

      const proxyResponse = await fetch(
        `${API_BASE_URL}/api/tmdb?${params.toString()}`
      );
      if (proxyResponse.ok) {
        const data = await proxyResponse.json();

        if (data.results?.length) {
          // Convert TMDB movies to our app's movie format
          return data.results.map(
            (movie: TMDBMovie): Movie => ({
              id: movie.id,
              title: movie.title.toUpperCase(),
              poster_path: movie.poster_path,
              release_year: movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : 0,
              genre:
                movie.genre_ids.length > 0
                  ? genreMap[movie.genre_ids[0]] || "Other"
                  : "Other",
              industry: industry,
              difficulty: getDifficulty(movie.popularity),
              description:
                movie.overview || "No description available for this movie.",
            })
          );
        }
      }
    } catch (proxyError) {
      console.warn(
        "Error using API proxy, falling back to direct TMDB call:",
        proxyError
      );
    }

    // Fallback to direct API call if proxy fails
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results?.length) {
      return [];
    }

    // Convert TMDB movies to our app's movie format
    return data.results.map(
      (movie: TMDBMovie): Movie => ({
        id: movie.id,
        title: movie.title.toUpperCase(),
        poster_path: movie.poster_path,
        release_year: movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : 0,
        genre:
          movie.genre_ids.length > 0
            ? genreMap[movie.genre_ids[0]] || "Other"
            : "Other",
        industry: industry,
        difficulty: getDifficulty(movie.popularity),
        description:
          movie.overview || "No description available for this movie.",
      })
    );
  } catch (error) {
    console.error("Error fetching movies from TMDB:", error);
    return [];
  }
};

/**
 * Get a random movie from TMDB based on genre, industry and difficulty
 */
export const getRandomTMDBMovie = async (
  genre: string = "All",
  industry: string = "Hollywood",
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<Movie | null> => {
  try {
    const movies = await fetchMoviesFromTMDB(genre, industry);

    if (!movies.length) {
      return null;
    }

    // Filter by difficulty if specified
    const filteredMovies = movies.filter(
      (movie) => movie.difficulty === difficulty
    );

    // If no movies match the difficulty, use all fetched movies
    const moviesPool = filteredMovies.length > 0 ? filteredMovies : movies;

    // Get a random movie
    const randomIndex = Math.floor(Math.random() * moviesPool.length);
    const movie = moviesPool[randomIndex];

    return movie;
  } catch (error) {
    console.error("Error getting random TMDB movie:", error);
    return null;
  }
};

/**
 * Get full URL for a movie poster
 */
export const getMoviePoster = (posterPath: string | null): string => {
  if (!posterPath) return "/images/no-poster.png"; // You should add a default poster image
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

// Export a default function for backward compatibility
export default {
  fetchMoviesFromTMDB,
  getRandomTMDBMovie,
  getMoviePoster,
};
