"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getMoviesByCategory,
  getMovieDetails,
  searchMovies,
} from "../lib/tmdbCloudflare";
import { Movie } from "../lib/supabase";

export default function CloudflareMoviesExample() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [category, setCategory] = useState<string>("korean");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Load movies by category on component mount or category change
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError("");
      try {
        const moviesData = await getMoviesByCategory(category);
        setMovies(moviesData);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError(`Failed to fetch ${category} movies`);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [category]);

  // Handle searching for movies
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    try {
      const data = await searchMovies(searchQuery);

      // Convert search results to our Movie format
      if (data.results && data.results.length > 0) {
        const searchMovies = data.results.map(
          (movie: any): Movie => ({
            id: movie.id,
            title: movie.title.toUpperCase(),
            poster_path: movie.poster_path,
            release_year: movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : 0,
            genre: "Unknown", // We don't have genre_ids in search results
            industry: "Unknown",
            difficulty: "medium",
            description: movie.overview || "No description available.",
          })
        );
        setMovies(searchMovies);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error("Error searching movies:", err);
      setError("Failed to search movies");
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing movie details
  const viewMovieDetails = async (movieId: number) => {
    setLoading(true);
    setError("");
    try {
      const details = await getMovieDetails(movieId);
      setSelectedMovie(details);
    } catch (err) {
      console.error("Error fetching movie details:", err);
      setError("Failed to fetch movie details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Movies via Cloudflare Worker</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies..."
            className="px-4 py-2 border border-gray-300 rounded-l flex-grow dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Category selector */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Browse by Category:</h2>
        <div className="flex flex-wrap gap-2">
          {["korean", "japanese", "chinese", "french", "spanish"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSearchQuery("");
                setSelectedMovie(null);
                setCategory(cat);
              }}
              className={`px-3 py-1 rounded ${
                category === cat
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-100">
          {error}
        </div>
      )}

      {/* Movie details view */}
      {selectedMovie && (
        <div className="mb-6 p-4 border border-gray-300 rounded dark:border-gray-700">
          <button
            onClick={() => setSelectedMovie(null)}
            className="mb-4 text-blue-500 hover:underline"
          >
            ← Back to list
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              {selectedMovie.poster_path ? (
                <div className="relative aspect-[2/3]">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                    className="rounded"
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 flex items-center justify-center rounded">
                  <span className="text-gray-500">No poster available</span>
                </div>
              )}
            </div>

            <div className="w-full md:w-2/3">
              <h2 className="text-2xl font-bold mb-2">{selectedMovie.title}</h2>

              <div className="text-sm text-gray-500 mb-4">
                {selectedMovie.release_date
                  ? new Date(selectedMovie.release_date).getFullYear()
                  : "Unknown"}
                {selectedMovie.runtime && ` • ${selectedMovie.runtime} min`}
                {selectedMovie.genres &&
                  ` • ${selectedMovie.genres
                    .map((g: any) => g.name)
                    .join(", ")}`}
              </div>

              <p className="mb-4">{selectedMovie.overview}</p>

              {selectedMovie.vote_average && (
                <div className="mb-4">
                  <span className="font-semibold">Rating:</span>{" "}
                  {selectedMovie.vote_average.toFixed(1)}/10
                </div>
              )}

              {selectedMovie.production_companies &&
                selectedMovie.production_companies.length > 0 && (
                  <div className="mb-4">
                    <span className="font-semibold">Production:</span>{" "}
                    {selectedMovie.production_companies
                      .map((c: any) => c.name)
                      .join(", ")}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Movies grid */}
      {!selectedMovie && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : `${
                  category.charAt(0).toUpperCase() + category.slice(1)
                } Movies`}
          </h2>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="border border-gray-300 rounded-lg overflow-hidden dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => viewMovieDetails(movie.id)}
                >
                  <div className="aspect-[2/3] relative">
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                        <span className="text-gray-500">No poster</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {movie.release_year || "Unknown"}
                    </p>
                    <p className="text-xs line-clamp-2 text-gray-600 dark:text-gray-400">
                      {movie.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery
                ? `No results found for "${searchQuery}"`
                : `No ${category} movies found`}
            </div>
          )}
        </>
      )}
    </div>
  );
}
