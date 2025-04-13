const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "TMDb API proxy server is running" });
});

// TMDb API proxy endpoint
app.get("/api/tmdb/:endpoint(*)", async (req, res) => {
  try {
    // Extract the endpoint path
    const endpoint = req.params.endpoint;

    // Create the cache key from the endpoint and query params
    const cacheKey = `${endpoint}:${JSON.stringify(req.query)}`;

    // Check if we have a cached response
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);

      // Check if the cache is still valid
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(data);
      } else {
        // Cache expired
        cache.delete(cacheKey);
      }
    }

    // Build the full TMDb URL with all query parameters
    const params = new URLSearchParams(req.query);

    // Add the API key
    params.append("api_key", TMDB_API_KEY);

    const url = `${TMDB_BASE_URL}/${endpoint}?${params.toString()}`;
    console.log(
      `Proxying request to: ${url.replace(/api_key=([^&]+)/, "api_key=****")}`
    );

    // Make the request to TMDb
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 5000, // 5 second timeout
    });

    // Cache the response
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });

    // Return the data
    res.json(response.data);
  } catch (error) {
    console.error("Error proxying TMDb request:", error.message);

    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a non-2xx status
      return res.status(error.response.status).json({
        error: `TMDb API error: ${error.response.status}`,
        message: error.response.data.status_message || "Unknown error",
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(504).json({
        error: "Gateway timeout",
        message: "No response received from TMDb API",
      });
    } else {
      // Something else caused the error
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
});

// Clear the cache every hour
setInterval(() => {
  console.log("Clearing cache");
  cache.clear();
}, 60 * 60 * 1000);

// Start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TMDb proxy server running on port ${PORT}`);
  });
}

// Export for testing or serverless deployment
module.exports = app;
