/**
 * TMDb API utility functions for client-side usage
 * These functions interact with our Vercel serverless TMDb proxy
 */

// Base URL for API endpoints - adjust for production/development
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

/**
 * Fetch a randomized list of movies based on filters
 * @param {Object} options - Filter options
 * @param {string} options.difficulty - "easy", "medium", or "hard"
 * @param {string} options.genre - Genre category (e.g. "action", "comedy")
 * @param {string} options.industry - Industry category (e.g. "hollywood", "bollywood")
 * @param {boolean} options.recent - Whether to only include movies from the past 5 years
 * @param {number} options.page - Page number for pagination
 * @returns {Promise<Object>} - Movies data from TMDb
 */
export async function fetchMovies({
  difficulty = "medium",
  genre = "all",
  industry = "world",
  recent = false,
  page = 1,
} = {}) {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      difficulty: difficulty.toLowerCase(),
      genre: genre.toLowerCase(),
      industry: industry.toLowerCase(),
      recent: recent.toString(),
      page: page.toString(),
    });

    // Make API request to our TMDb proxy
    const response = await fetch(
      `${API_BASE_URL}/api/tmdb?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching movies: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
}

/**
 * Get details for a specific movie by ID
 * @param {number} movieId - TMDb movie ID
 * @returns {Promise<Object>} - Movie details from TMDb
 */
export async function getMovieDetails(movieId) {
  try {
    if (!movieId) {
      throw new Error("Movie ID is required");
    }

    // Make API request to our movie details proxy
    const response = await fetch(`${API_BASE_URL}/api/movie?id=${movieId}`);

    if (!response.ok) {
      throw new Error(`Error fetching movie details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
}

/**
 * Get a random movie based on filters
 * @param {Object} options - Filter options (same as fetchMovies)
 * @returns {Promise<Object>} - Random movie object
 */
export async function getRandomMovie(options = {}) {
  try {
    const data = await fetchMovies(options);

    if (!data.results || data.results.length === 0) {
      throw new Error("No movies found matching the criteria");
    }

    // Get a random movie from the results
    const randomIndex = Math.floor(Math.random() * data.results.length);
    return data.results[randomIndex];
  } catch (error) {
    console.error("Error getting random movie:", error);
    throw error;
  }
}

/**
 * Get a TMDb movie poster URL
 * @param {string} posterPath - Poster path from TMDb (e.g. "/abc123.jpg")
 * @param {string} size - Size of the poster (w92, w154, w185, w342, w500, w780, original)
 * @returns {string} - Full URL to the movie poster
 */
export function getMoviePoster(posterPath, size = "w500") {
  if (!posterPath) {
    return `/posters/fallback-poster.svg`; // Return fallback poster
  }

  // Use our image proxy instead of direct TMDb URL to avoid CORS issues
  return `${API_BASE_URL}/api/image?size=${size}&path=${posterPath}`;
}
