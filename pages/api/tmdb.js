/**
 * TMDb API Proxy - Vercel Serverless Function
 * This proxy handles requests to TMDb API with parameter mapping and caching
 */

// Genre mappings (TMDb genre IDs)
const GENRE_MAPPINGS = {
  all: null,
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  "science fiction": 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

// Industry mappings
const INDUSTRY_MAPPINGS = {
  all: null,
  world: null,
  hollywood: { region: "US", with_original_language: "en" },
  bollywood: { with_original_language: "hi" },
  korean: { language: "ko-KR", with_original_language: "ko" },
  japanese: { language: "ja-JP", with_original_language: "ja" },
  french: { language: "fr-FR", with_original_language: "fr" },
  spanish: { language: "es-ES", with_original_language: "es" },
  chinese: { language: "zh-CN", with_original_language: "zh" },
  // Add more industries as needed
};

// Difficulty to popularity mapping
const DIFFICULTY_MAPPINGS = {
  easy: { popularity_gte: 50 },
  medium: { popularity_gte: 20, popularity_lte: 50 },
  hard: { popularity_lte: 20 },
};

// Default response if TMDb fails (10 popular movies)
const DEFAULT_MOVIES = [
  {
    id: 299534,
    title: "Avengers: Endgame",
    poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    release_date: "2019-04-24",
    genre_ids: [12, 878, 28],
    popularity: 100,
    overview:
      "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
  },
  // Add more default movies here
];

/**
 * TMDb API proxy handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the API key from environment variables
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      console.error("TMDB API key is not configured");
      return res.status(500).json({
        error: "TMDB API key is not configured",
        results: DEFAULT_MOVIES,
      });
    }

    // Extract query parameters
    const {
      difficulty = "medium",
      genre = "all",
      industry = "all",
      recent = "false",
      page = "1",
      query = "",
      endpoint = "discover/movie",
    } = req.query;

    // Build TMDb API request parameters
    let params = new URLSearchParams({
      api_key: apiKey,
      language: "en-US",
      include_adult: "false",
      sort_by: "popularity.desc",
      page: String(page),
    });

    // If it's a search request
    if (query && endpoint.includes("search")) {
      params.append("query", query);
    } else {
      // Add difficulty filter (based on popularity)
      const difficultyParams = DIFFICULTY_MAPPINGS[difficulty.toLowerCase()];
      if (difficultyParams) {
        Object.entries(difficultyParams).forEach(([key, value]) => {
          params.append(key, value);
        });
      }

      // Add genre filter
      const genreId = GENRE_MAPPINGS[genre.toLowerCase()];
      if (genreId) {
        params.append("with_genres", genreId.toString());
      }

      // Add industry filter
      const industryParams = INDUSTRY_MAPPINGS[industry.toLowerCase()];
      if (industryParams) {
        Object.entries(industryParams).forEach(([key, value]) => {
          params.append(key, value);
        });
      }

      // Add recent filter if requested (movies from the last 5 years)
      if (recent === "true") {
        const currentYear = new Date().getFullYear();
        params.append("primary_release_date.gte", `${currentYear - 5}-01-01`);
      }
    }

    // Construct the TMDb API URL
    const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?${params.toString()}`;
    console.log(
      `Fetching from TMDb: ${tmdbUrl.replace(
        /api_key=([^&]+)/,
        "api_key=HIDDEN"
      )}`
    );

    // Make request to TMDb API
    const response = await fetch(tmdbUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 5000, // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    const data = await response.json();

    // Set cache control headers (1 hour for normal requests, 10 minutes for search)
    const cacheTime = endpoint.includes("search") ? 600 : 3600;
    res.setHeader(
      "Cache-Control",
      `s-maxage=${cacheTime}, stale-while-revalidate`
    );

    // Return the data
    return res.status(200).json(data);
  } catch (error) {
    console.error("TMDb API proxy error:", error);

    // Return default data if TMDb fails
    return res.status(500).json({
      error: "Failed to fetch data from TMDb",
      message: error.message,
      results: DEFAULT_MOVIES,
    });
  }
}
