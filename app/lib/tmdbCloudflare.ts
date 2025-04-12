import { Movie } from "./supabase";

// Cloudflare Worker URL - replace with your actual deployed URL
const CLOUDFLARE_WORKER_URL =
  "https://my-tmdb-worker.yogeshrana2301.workers.dev";

// Map genre IDs to names (same as in tmdb.ts)
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

// Map popularity to difficulty (same as in tmdb.ts)
const getDifficulty = (popularity: number): "easy" | "medium" | "hard" => {
  if (popularity > 50) return "easy";
  if (popularity > 20) return "medium";
  return "hard";
};

// Interface for TMDB movie data
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
 * Fetch movies from the Cloudflare Worker proxy
 */
export const fetchMoviesFromCloudflare = async (
  genre: string = "All",
  industry: string = "Hollywood"
): Promise<Movie[]> => {
  try {
    let endpoint = "";
    const params = new URLSearchParams();
    params.append("language", "en-US");
    params.append("sort_by", "popularity.desc");
    params.append("include_adult", "false");
    params.append("page", "1");

    // Handle genre filter
    if (genre !== "All") {
      endpoint = `/api/genre/${genre.toLowerCase()}`;
    } else {
      endpoint = "/api/movies";
    }

    // Handle industry filter
    if (industry !== "Hollywood" && industry !== "All") {
      switch (industry) {
        case "Korean":
          endpoint = "/api/category/korean";
          break;
        case "Japanese":
          endpoint = "/api/category/japanese";
          break;
        case "Chinese Cinema":
          endpoint = "/api/category/chinese";
          break;
        case "French":
          endpoint = "/api/category/french";
          break;
        case "Spanish":
          endpoint = "/api/category/spanish";
          break;
        case "Bollywood":
          // Note: Bollywood needs special handling since it's Hindi language
          endpoint = "/api/movies"; // We'll add language param below
          params.append("with_original_language", "hi");
          break;
        default:
          endpoint = "/api/movies";
      }
    }

    // Construct the full URL
    const url = `${CLOUDFLARE_WORKER_URL}${endpoint}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Cloudflare Worker API error: ${response.status}`);
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
    console.error("Error fetching movies from Cloudflare Worker:", error);
    return [];
  }
};

/**
 * Get random movie using the Cloudflare Worker
 */
export const getRandomCloudflareMovie = async (
  genre: string = "All",
  industry: string = "Hollywood",
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<Movie | null> => {
  const movies = await fetchMoviesFromCloudflare(genre, industry);

  if (!movies.length) {
    return null;
  }

  // Filter by difficulty
  const filteredMovies = movies.filter(
    (movie) => movie.difficulty === difficulty
  );

  // If no movies match the difficulty, use all fetched movies
  const moviesPool = filteredMovies.length > 0 ? filteredMovies : movies;

  // Get a random movie
  const randomIndex = Math.floor(Math.random() * moviesPool.length);
  const movie = moviesPool[randomIndex];

  return movie;
};

/**
 * Get movie details by ID
 */
export const getMovieDetails = async (movieId: number): Promise<any> => {
  try {
    const response = await fetch(
      `${CLOUDFLARE_WORKER_URL}/api/movie/${movieId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

/**
 * Get movies by category
 */
export const getMoviesByCategory = async (
  categoryName: string,
  page: number = 1
): Promise<Movie[]> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());

    const response = await fetch(
      `${CLOUDFLARE_WORKER_URL}/api/category/${categoryName.toLowerCase()}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${categoryName} movies: ${response.status}`
      );
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
        industry: categoryName,
        difficulty: getDifficulty(movie.popularity),
        description:
          movie.overview || "No description available for this movie.",
      })
    );
  } catch (error) {
    console.error(`Error fetching ${categoryName} movies:`, error);
    return [];
  }
};

/**
 * Search movies using the Cloudflare Worker
 */
export const searchMovies = async (query: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("query", query);
    params.append("include_adult", "false");

    const response = await fetch(
      `${CLOUDFLARE_WORKER_URL}/api/search?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search movies: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching movies:", error);
    return { results: [] };
  }
};
