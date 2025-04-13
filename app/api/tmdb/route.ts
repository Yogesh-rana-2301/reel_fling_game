import { NextRequest, NextResponse } from "next/server";

// Tell Next.js this route is dynamic
export const dynamic = "force-dynamic";

/**
 * Serverless function to proxy TMDB API requests
 * This helps bypass ISP blocks by fetching data server-side
 *
 * @param req - The incoming request with query parameters
 * @returns The TMDB API response
 */
export async function GET(req: NextRequest) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB API key is not configured" },
        { status: 500 }
      );
    }

    // Get URL parameters
    const searchParams = req.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") || "movie/popular";

    // Build the URL with all query parameters
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      // Don't include the endpoint in the params
      if (key !== "endpoint") {
        params.append(key, value);
      }
    });

    // Always add the API key
    params.append("api_key", apiKey);

    // Construct the TMDB API URL
    const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?${params.toString()}`;

    // Make the request to TMDB
    const response = await fetch(tmdbUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Get the response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying TMDB request:", error);
    return NextResponse.json(
      { error: "Error fetching data from TMDB" },
      { status: 500 }
    );
  }
}
