// This is a Node.js script to download movie posters
// You would run this with: node scripts/download-posters.js

const fs = require("fs");
const path = require("path");
const https = require("https");

// Create the posters directory if it doesn't exist
const postersDir = path.join(process.cwd(), "public", "posters");
if (!fs.existsSync(postersDir)) {
  fs.mkdirSync(postersDir, { recursive: true });
}

// Sample movie poster URLs (replace with actual URLs in production)
// These are example placeholder URLs - in real implementation, these would be actual movie poster URLs
const posterUrls = [
  "https://example.com/poster1.jpg",
  "https://example.com/poster2.jpg",
  "https://example.com/poster3.jpg",
  "https://example.com/poster4.jpg",
  "https://example.com/poster5.jpg",
  "https://example.com/poster6.jpg",
  "https://example.com/poster7.jpg",
  "https://example.com/poster8.jpg",
  "https://example.com/poster9.jpg",
  "https://example.com/poster10.jpg",
  "https://example.com/poster11.jpg",
  "https://example.com/poster12.jpg",
  "https://example.com/poster13.jpg",
  "https://example.com/poster14.jpg",
  "https://example.com/poster15.jpg",
  "https://example.com/poster16.jpg",
];

// Function to download an image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${filename}`);

    // In a real script, you would uncomment this code
    /*
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filename);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filename, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
    */

    // For this example, we'll just create placeholder files
    fs.writeFileSync(filename, `This is a placeholder for ${url}`);
    resolve();
  });
}

// Generate colorful placeholders for movie posters
function generatePlaceholderImage(index, filename) {
  const colors = [
    "#E53935",
    "#D81B60",
    "#8E24AA",
    "#5E35B1",
    "#3949AB",
    "#1E88E5",
    "#039BE5",
    "#00ACC1",
    "#00897B",
    "#43A047",
    "#7CB342",
    "#C0CA33",
    "#FDD835",
    "#FFB300",
    "#FB8C00",
    "#F4511E",
  ];

  // Create a colorful SVG with a movie name
  const movieTitles = [
    "The Dark Knight",
    "Pulp Fiction",
    "Inception",
    "The Matrix",
    "Goodfellas",
    "The Godfather",
    "Interstellar",
    "Fight Club",
    "Forrest Gump",
    "The Shawshank Redemption",
    "Avatar",
    "Titanic",
    "Star Wars",
    "Jurassic Park",
    "The Lion King",
    "The Avengers",
  ];

  const color = colors[index % colors.length];
  const title = movieTitles[index % movieTitles.length];

  const svg = `
<svg width="300" height="450" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="450" fill="${color}" />
  <text x="150" y="225" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${title}
  </text>
  <text x="150" y="260" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">
    (Poster ${index + 1})
  </text>
</svg>
  `;

  fs.writeFileSync(filename, svg);
}

// Main function
async function main() {
  try {
    // Create the movie posters
    for (let i = 0; i < 16; i++) {
      const filename = path.join(postersDir, `movie${i + 1}.svg`);
      //await downloadImage(posterUrls[i], filename);
      generatePlaceholderImage(i, filename);
    }

    console.log("All movie posters have been downloaded/generated!");
  } catch (error) {
    console.error("Error downloading posters:", error);
  }
}

main();
