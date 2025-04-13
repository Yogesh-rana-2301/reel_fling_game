#!/usr/bin/env node

/**
 * TMDb Movie Fetcher
 *
 * This script fetches movies from TMDb, downloads poster images,
 * uploads them to Supabase Storage, and saves metadata to a Supabase table.
 *
 * Usage:
 *   node fetchMovies.js
 *
 * Requirements:
 *   - TMDB_API_KEY in .env file
 *   - SUPABASE_URL and SUPABASE_KEY in .env file
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const https = require("https");
const cliProgress = require("cli-progress");
const colors = require("ansi-colors");

// Configuration
const CONFIG = {
  // TMDb API
  tmdbApiKey: process.env.TMDB_API_KEY,
  tmdbBaseUrl: "https://api.themoviedb.org/3",
  tmdbImageBaseUrl: "https://image.tmdb.org/t/p/w500",

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey:
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,

  // Script settings
  moviesPerGenre: 20, // How many movies to fetch per genre
  totalMoviesTarget: 400, // Target total movies to fetch
  tempImageDir: path.join(__dirname, "temp_posters"),
  genres: [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thriller" },
  ],
  industries: [
    {
      key: "Hollywood",
      params: { region: "US", with_original_language: "en" },
    },
    {
      key: "Bollywood",
      params: { region: "IN", with_original_language: "hi" },
    },
    { key: "Korean", params: { region: "KR", with_original_language: "ko" } },
    { key: "Japanese", params: { region: "JP", with_original_language: "ja" } },
    { key: "French", params: { region: "FR", with_original_language: "fr" } },
    { key: "Spanish", params: { with_original_language: "es" } },
    { key: "Chinese", params: { with_original_language: "zh" } },
  ],
  retries: 3,
  concurrentDownloads: 5,
  delayBetweenRequests: 100, // ms
};

// Initialize Supabase client
let supabase;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase credentials. Please set SUPABASE_URL and either SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY in your .env file."
    );
  }

  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error("Failed to initialize Supabase client:", error.message);
  console.log(
    "\nPlease make sure you have created a .env file with the following variables:"
  );
  console.log("  SUPABASE_URL=your_supabase_url");
  console.log("  SUPABASE_SERVICE_KEY=your_service_key");
  console.log("  TMDB_API_KEY=your_tmdb_api_key\n");
  process.exit(1);
}

// Create temp directory if it doesn't exist
if (!fs.existsSync(CONFIG.tempImageDir)) {
  fs.mkdirSync(CONFIG.tempImageDir, { recursive: true });
  console.log(`Created temporary directory: ${CONFIG.tempImageDir}`);
}

// Helper function to determine movie difficulty based on popularity
function getDifficulty(popularity) {
  if (popularity > 50) return "easy";
  if (popularity > 20) return "medium";
  return "hard";
}

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch movies from TMDb API
async function fetchMoviesFromTMDb(genre, industry, page = 1) {
  try {
    const params = new URLSearchParams({
      api_key: CONFIG.tmdbApiKey,
      language: "en-US",
      sort_by: "popularity.desc",
      include_adult: false,
      page: page,
      with_genres: genre.id,
    });

    // Add industry-specific parameters
    if (industry.params) {
      Object.entries(industry.params).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    const url = `${CONFIG.tmdbBaseUrl}/discover/movie?${params.toString()}`;
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      httpsAgent: new https.Agent({ keepAlive: true }),
    });

    if (response.status !== 200) {
      throw new Error(
        `TMDb API Error: ${response.status} - ${response.statusText}`
      );
    }

    return response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview || "No description available",
      poster_path: movie.poster_path,
      release_year: movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : null,
      popularity: movie.popularity,
      genre: genre.name,
      industry: industry.key,
      difficulty: getDifficulty(movie.popularity),
    }));
  } catch (error) {
    console.error(
      `Error fetching movies for ${genre.name}/${industry.key}:`,
      error.message
    );
    return [];
  }
}

// Download poster image
async function downloadPoster(movie, retryCount = 0) {
  if (!movie.poster_path) {
    return null; // Skip if no poster available
  }

  const posterUrl = `${CONFIG.tmdbImageBaseUrl}${movie.poster_path}`;
  const fileName = `movie_${movie.id}_${path.basename(movie.poster_path)}`;
  const filePath = path.join(CONFIG.tempImageDir, fileName);

  try {
    const response = await axios({
      method: "GET",
      url: posterUrl,
      responseType: "stream",
      timeout: 10000,
      httpsAgent: new https.Agent({ keepAlive: true }),
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        resolve({
          fileName,
          filePath,
          contentType: response.headers["content-type"] || "image/jpeg",
        });
      });

      writer.on("error", async (err) => {
        writer.close();
        fs.unlinkSync(filePath); // Clean up partial file

        if (retryCount < CONFIG.retries) {
          await delay(1000); // Wait a bit before retrying
          const result = await downloadPoster(movie, retryCount + 1);
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  } catch (error) {
    if (retryCount < CONFIG.retries) {
      await delay(1000); // Wait a bit before retrying
      return downloadPoster(movie, retryCount + 1);
    }
    console.error(
      `Failed to download poster for movie ${movie.id}:`,
      error.message
    );
    return null;
  }
}

// Upload poster to Supabase Storage
async function uploadPosterToSupabase(posterData, retryCount = 0) {
  if (!posterData) return null;

  try {
    const fileContent = fs.readFileSync(posterData.filePath);
    const storagePath = `posters/${posterData.fileName}`;

    const { data, error } = await supabase.storage
      .from("movies")
      .upload(storagePath, fileContent, {
        contentType: posterData.contentType,
        upsert: true,
      });

    if (error) throw error;

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("movies")
      .getPublicUrl(storagePath);

    return urlData.publicUrl;
  } catch (error) {
    if (retryCount < CONFIG.retries) {
      await delay(1000); // Wait a bit before retrying
      return uploadPosterToSupabase(posterData, retryCount + 1);
    }
    console.error(
      `Failed to upload poster to Supabase: ${posterData.fileName}`,
      error
    );
    return null;
  }
}

// Insert movie data into Supabase database
async function insertMovieIntoSupabase(movie, posterUrl, retryCount = 0) {
  try {
    const { data, error } = await supabase.from("movies").upsert(
      {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        industry: movie.industry,
        difficulty: movie.difficulty,
        release_year: movie.release_year,
        poster_url: posterUrl,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    if (error) throw error;
    return true;
  } catch (error) {
    if (retryCount < CONFIG.retries) {
      await delay(1000); // Wait a bit before retrying
      return insertMovieIntoSupabase(movie, posterUrl, retryCount + 1);
    }
    console.error(`Failed to insert movie ${movie.id} into Supabase:`, error);
    return false;
  }
}

// Process a batch of movies
async function processMovieBatch(movies, progressBar) {
  const results = {
    processed: 0,
    postersUploaded: 0,
    failed: 0,
  };

  // Process in chunks to control concurrency
  const chunkSize = CONFIG.concurrentDownloads;
  for (let i = 0; i < movies.length; i += chunkSize) {
    const chunk = movies.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map(async (movie) => {
        try {
          // Skip if this movie already exists in our DB
          const { data: existingMovie } = await supabase
            .from("movies")
            .select("id")
            .eq("id", movie.id)
            .single();

          if (existingMovie) {
            progressBar.increment(1, { status: "Skipped (exists)" });
            results.processed++;
            return;
          }

          // Step 1: Download poster
          progressBar.update({ status: `Downloading poster for ${movie.id}` });
          const posterData = await downloadPoster(movie);

          // Step 2: Upload poster to Supabase Storage
          let posterUrl = null;
          if (posterData) {
            progressBar.update({ status: `Uploading poster for ${movie.id}` });
            posterUrl = await uploadPosterToSupabase(posterData);
            if (posterUrl) results.postersUploaded++;

            // Clean up local file
            fs.unlinkSync(posterData.filePath);
          }

          // Step 3: Insert movie data into Supabase
          progressBar.update({ status: `Inserting movie ${movie.id}` });
          const success = await insertMovieIntoSupabase(movie, posterUrl);

          if (success) {
            results.processed++;
            progressBar.increment(1, { status: `Processed ${movie.id}` });
          } else {
            results.failed++;
            progressBar.increment(1, { status: `Failed ${movie.id}` });
          }

          // Add a small delay to avoid rate limiting
          await delay(CONFIG.delayBetweenRequests);
        } catch (error) {
          console.error(`Error processing movie ${movie.id}:`, error);
          results.failed++;
          progressBar.increment(1, { status: `Error ${movie.id}` });
        }
      })
    );
  }

  return results;
}

// Main function
async function main() {
  console.log(colors.cyan.bold("🎬 TMDb Movie Fetcher"));
  console.log(
    colors.cyan(
      "Fetching movies, downloading posters, and storing in Supabase\n"
    )
  );

  // Verify Supabase connection
  try {
    const { data, error } = await supabase.from("movies").select("id").limit(1);
    if (error) throw error;
    console.log(colors.green("✓ Supabase connection successful"));
  } catch (error) {
    console.error(colors.red("✗ Supabase connection failed:"), error.message);
    console.log(
      colors.yellow(
        "Check your SUPABASE_URL and SUPABASE_KEY environment variables."
      )
    );
    process.exit(1);
  }

  // Verify TMDb API connection
  try {
    const testUrl = `${CONFIG.tmdbBaseUrl}/configuration?api_key=${CONFIG.tmdbApiKey}`;
    const response = await axios.get(testUrl);
    if (response.status !== 200)
      throw new Error(`Status code: ${response.status}`);
    console.log(colors.green("✓ TMDb API connection successful"));
  } catch (error) {
    console.error(colors.red("✗ TMDb API connection failed:"), error.message);
    console.log(colors.yellow("Check your TMDB_API_KEY environment variable."));
    process.exit(1);
  }

  console.log(
    colors.yellow(
      `\nTarget: ~${CONFIG.totalMoviesTarget} movies, ${CONFIG.moviesPerGenre} per genre/industry combination\n`
    )
  );

  // Initialize progress bar
  const progressBar = new cliProgress.SingleBar({
    format:
      colors.cyan("{bar}") +
      " | {percentage}% | {value}/{total} | Status: {status}",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  const allMovies = [];
  const stats = { fetched: 0, processed: 0, postersUploaded: 0, failed: 0 };

  try {
    // First, collect movies from all genre/industry combinations
    console.log(colors.yellow("Fetching movies from TMDb API..."));

    for (const genre of CONFIG.genres) {
      for (const industry of CONFIG.industries) {
        process.stdout.write(
          colors.cyan(`  Fetching ${genre.name} / ${industry.key}... `)
        );

        // Fetch first page to get total results
        const movies = await fetchMoviesFromTMDb(genre, industry);

        if (movies.length > 0) {
          // Take only what we need
          const moviesNeeded = Math.min(movies.length, CONFIG.moviesPerGenre);
          allMovies.push(...movies.slice(0, moviesNeeded));
          stats.fetched += moviesNeeded;

          console.log(colors.green(`OK (${moviesNeeded} movies)`));
        } else {
          console.log(colors.red("Failed"));
        }

        // Avoid rate limiting
        await delay(CONFIG.delayBetweenRequests);

        // If we've reached our target, stop fetching
        if (allMovies.length >= CONFIG.totalMoviesTarget) break;
      }

      if (allMovies.length >= CONFIG.totalMoviesTarget) break;
    }

    // Shuffle movies to get a good mix
    allMovies.sort(() => Math.random() - 0.5);

    // Reduce to target size if we fetched too many
    const moviesToProcess = allMovies.slice(0, CONFIG.totalMoviesTarget);

    console.log(
      colors.green(`\n✓ Fetched ${moviesToProcess.length} movies from TMDb API`)
    );
    console.log(
      colors.yellow(
        "\nProcessing movies (downloading posters and storing in Supabase)..."
      )
    );

    // Start the progress bar
    progressBar.start(moviesToProcess.length, 0, { status: "Starting" });

    // Process all movies
    const results = await processMovieBatch(moviesToProcess, progressBar);

    stats.processed += results.processed;
    stats.postersUploaded += results.postersUploaded;
    stats.failed += results.failed;

    // Stop the progress bar
    progressBar.stop();

    console.log(
      colors.green(`\n✓ Completed! ${stats.processed} movies processed`)
    );
    console.log(colors.cyan(`  - ${stats.postersUploaded} posters uploaded`));

    if (stats.failed > 0) {
      console.log(
        colors.yellow(`  - ${stats.failed} movies failed to process`)
      );
    }
  } catch (error) {
    progressBar.stop();
    console.error(colors.red("\nAn error occurred:"), error);
  } finally {
    // Clean up the temp directory
    try {
      fs.rmdirSync(CONFIG.tempImageDir, { recursive: true });
      console.log(colors.gray("\nTemporary files cleaned up."));
    } catch (error) {
      console.error(
        colors.yellow("\nFailed to clean up temporary files:"),
        error.message
      );
    }
  }

  console.log(
    colors.cyan.bold("\nDone! Your movies are now stored in Supabase.")
  );
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
