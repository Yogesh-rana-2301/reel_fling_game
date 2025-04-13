// TMDb API Proxy for Movie Details - Vercel Serverless Function
// This function securely proxies requests to fetch individual movie details

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
    // Extract movie ID from query parameters
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Movie ID is required" });
    }

    // Build TMDb API request parameters
    const params = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY,
      language: "en-US",
      append_to_response: "videos,images,credits",
    });

    // Make request to TMDb API
    const tmdbUrl = `https://api.themoviedb.org/3/movie/${id}?${params.toString()}`;
    console.log(
      `Fetching movie details from TMDb: ${tmdbUrl.replace(
        /api_key=([^&]+)/,
        "api_key=HIDDEN"
      )}`
    );

    const tmdbResponse = await fetch(tmdbUrl);

    if (!tmdbResponse.ok) {
      const errorData = await tmdbResponse.json();
      return res.status(tmdbResponse.status).json({
        error: "Error from TMDb API",
        details: errorData,
      });
    }

    const data = await tmdbResponse.json();

    // Return the data with proper headers
    res.status(200).json(data);
  } catch (error) {
    console.error("TMDb API movie details proxy error:", error);
    res.status(500).json({
      error: "Failed to fetch movie details from TMDb",
      message: error.message,
    });
  }
}
