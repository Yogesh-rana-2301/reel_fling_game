import fs from "fs";
import path from "path";

const postersDir = path.join(process.cwd(), "public", "posters");

// Create posters directory if it doesn't exist
if (!fs.existsSync(postersDir)) {
  fs.mkdirSync(postersDir, { recursive: true });
}

// Generate 16 placeholder images
for (let i = 1; i <= 16; i++) {
  const svg = `
    <svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="300" fill="#1a1a1a"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        Movie ${i}
      </text>
    </svg>
  `;

  fs.writeFileSync(path.join(postersDir, `${i}.svg`), svg);
}

console.log("Placeholder posters generated successfully!");
