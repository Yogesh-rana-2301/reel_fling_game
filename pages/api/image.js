// TMDb Image Proxy - Vercel Serverless Function
// This function securely proxies image requests to TMDb

import { createReadStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
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
    // Extract size and path from query parameters
    const { size = "original", path } = req.query;

    if (!path) {
      return res.status(400).json({ error: "Image path is required" });
    }

    // Valid TMDb image sizes
    const validSizes = [
      "original",
      "w92",
      "w154",
      "w185",
      "w342",
      "w500",
      "w780",
      "h632",
    ];

    // Validate size parameter
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        error: "Invalid size parameter",
        message: `Valid sizes are: ${validSizes.join(", ")}`,
      });
    }

    // Get clean image path (removing any leading slashes)
    const cleanPath = path.replace(/^\/+/, "");

    // Build TMDb image URL
    const imageUrl = `https://image.tmdb.org/t/p/${size}/${cleanPath}`;

    // Fetch the image
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch image from TMDb",
        status: response.status,
      });
    }

    // Get content type and set appropriate header
    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType || "image/jpeg");

    // Add cache headers (cache for 7 days)
    res.setHeader("Cache-Control", "public, max-age=604800");

    // Get image as array buffer
    const imageBuffer = await response.arrayBuffer();

    // Return the image
    res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error("TMDb image proxy error:", error);
    res.status(500).json({
      error: "Failed to fetch image from TMDb",
      message: error.message,
    });
  }
}

// Configure response size limit (for large images)
export const config = {
  api: {
    responseLimit: "8mb",
  },
};
