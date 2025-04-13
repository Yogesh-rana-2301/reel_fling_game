// TMDb API Proxy - Vercel Serverless Function
// This function securely proxies requests to the TMDb API

// Genre mappings
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
  adult: [10749, 18], // Romance + Drama with filters
};

// Industry mappings
const INDUSTRY_MAPPINGS = {
  world: null,
  hollywood: { region: "US", with_original_language: "en" },
  bollywood: { with_original_language: "hi" },
  korean: { language: "ko-KR" },
  japanese: { language: "ja-JP" },
  tollywood: { with_original_language: "te" },
  kollywood: { with_original_language: "ta" },
  nollywood: { with_original_language: "yo" },
  french: { language: "fr-FR" },
  spanish: { language: "es-ES" },
  chinese: { language: "zh-CN" },
};

// Difficulty to popularity mapping
const DIFFICULTY_MAPPINGS = {
  easy: { popularity_gte: 50 },
  medium: { popularity_gte: 20, popularity_lte: 50 },
  hard: { popularity_lte: 20 },
};

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
    // Extract query parameters
    const {
      difficulty = "medium",
      genre = "all",
      industry = "world",
      recent = false,
      page = 1,
    } = req.query;

    // Validate query parameters
    if (!Object.keys(DIFFICULTY_MAPPINGS).includes(difficulty.toLowerCase())) {
      return res.status(400).json({ error: "Invalid difficulty parameter" });
    }

    if (!Object.keys(GENRE_MAPPINGS).includes(genre.toLowerCase())) {
      return res.status(400).json({ error: "Invalid genre parameter" });
    }

    if (!Object.keys(INDUSTRY_MAPPINGS).includes(industry.toLowerCase())) {
      return res.status(400).json({ error: "Invalid industry parameter" });
    }

    // Build TMDb API request parameters
    let params = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY,
      language: "en-US",
      include_adult: genre.toLowerCase() === "adult" ? "true" : "false",
      sort_by: "popularity.desc",
      page: page.toString(),
    });

    // Add genre filter
    const genreId = GENRE_MAPPINGS[genre.toLowerCase()];
    if (genreId) {
      if (Array.isArray(genreId)) {
        // For "adult" or other multi-genre filters
        params.append("with_genres", genreId.join(","));
      } else {
        params.append("with_genres", genreId.toString());
      }
    }

    // Add industry filter
    const industryParams = INDUSTRY_MAPPINGS[industry.toLowerCase()];
    if (industryParams) {
      Object.entries(industryParams).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    // Add difficulty filter (based on popularity)
    const difficultyParams = DIFFICULTY_MAPPINGS[difficulty.toLowerCase()];
    if (difficultyParams) {
      Object.entries(difficultyParams).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    // Add recent filter if requested
    if (recent === "true" || recent === true) {
      const currentYear = new Date().getFullYear();
      params.append("primary_release_date.gte", `${currentYear - 5}-01-01`);
    }

    // Determine endpoint based on genre
    const endpoint = "discover/movie";

    // Make request to TMDb API
    const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?${params.toString()}`;
    console.log(
      `Fetching from TMDb: ${tmdbUrl.replace(
        /api_key=([^&]+)/,
        "api_key=HIDDEN"
      )}`
    );

    const tmdbResponse = await fetch(tmdbUrl);
    const data = await tmdbResponse.json();

    // Return the data with proper headers
    res.status(200).json(data);
  } catch (error) {
    console.error("TMDb API proxy error:", error);
    res.status(500).json({
      error: "Failed to fetch data from TMDb",
      message: error.message,
    });
  }
}
