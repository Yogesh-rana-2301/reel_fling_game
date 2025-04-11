/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1a1a1a",
        secondary: "#2d2d2d",
        accent: "#28a745",
        danger: "#ef4444", // red
        success: "#22c55e", // green
        warning: "#f59e0b", // amber
        info: "#3b82f6", // blue

        // Light mode colors - updated as per new requirements
        light: {
          primary: "#AAC4E7", // Start of gradient
          secondary: "#F24455", // Second color in gradient
          text: "#9B49AD", // White text
          accent: "#FF7A24", // Vibrant orange
          success: "#4CAF50", // Green for success/confirmation
          error: "#E53935", // Bright red for errors/warnings
        },

        // Dark mode colors (these match our existing colors)
        dark: {
          primary: "#1a1a1a",
          secondary: "#2d2d2d",
          text: "#ffffff",
        },
      },
      animation: {
        strike: "strike 0.5s ease-out forwards",
      },
      keyframes: {
        strike: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      backgroundImage: {
        "light-gradient": "linear-gradient(to bottom, #0F1520, #0B2B26)",
      },
    },
  },
  plugins: [],
};
