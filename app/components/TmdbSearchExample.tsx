"use client";

import { useState } from "react";
import Image from "next/image";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  overview: string;
}

export default function TmdbSearchExample() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Call our serverless function instead of directly calling TMDB
      const response = await fetch(
        `/api/tmdb?endpoint=search/movie&query=${encodeURIComponent(
          query
        )}&include_adult=false`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setMovies(data.results || []);
    } catch (err) {
      console.error("Error searching movies:", err);
      setError("An error occurred while searching for movies");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">TMDB Movie Search</h2>

      <form onSubmit={searchMovies} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="border border-gray-300 rounded-lg overflow-hidden dark:border-gray-700"
          >
            <div className="aspect-[2/3] relative">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                  <span className="text-gray-500">No poster available</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">{movie.title}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "Unknown"}
              </p>
              <p className="text-sm line-clamp-3">{movie.overview}</p>
            </div>
          </div>
        ))}
      </div>

      {movies.length === 0 && !loading && query && (
        <div className="text-center py-8 text-gray-500">
          No movies found for "{query}"
        </div>
      )}
    </div>
  );
}
