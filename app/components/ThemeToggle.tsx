"use client";

import { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Default to dark theme
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", !isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 ${
        isDark
          ? "bg-gray-800 bg-opacity-50 hover:bg-opacity-70 focus:ring-accent"
          : "bg-light-secondary hover:bg-opacity-70 focus:ring-light-accent"
      }`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FaSun className="w-5 h-5 text-yellow-300" />
      ) : (
        <FaMoon className="w-5 h-5 text-light-accent" />
      )}
    </button>
  );
};

export default ThemeToggle;
