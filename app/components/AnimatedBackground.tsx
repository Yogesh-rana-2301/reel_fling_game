"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Real movie posters from TMDB
const posters = [
  "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // The Dark Knight
  "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", // Pulp Fiction
  "https://image.tmdb.org/t/p/w500/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg", // Inception
  "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", // The Matrix
  "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", // Goodfellas
  "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // The Godfather
  "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", // Interstellar
  "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", // Fight Club
  "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", // Forrest Gump
  "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", // The Shawshank Redemption
  "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", // Titanic
  "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", // Star Wars
  "https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg", // Jurassic Park
  "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg", // The Lion King
  "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg", // The Avengers
  "https://image.tmdb.org/t/p/w500/8kSerJrhrJWKLk1LViesGcnrUPE.jpg", // Avatar
];

// Fallback image if TMDB images fail to load
const fallbackImage = "/posters/movie-fallback.svg";

const MoviePoster = ({
  src,
  alt,
  index,
  onClick,
}: {
  src: string;
  alt: string;
  index: number;
  onClick: () => void;
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      key={`poster-${index}`}
      onClick={onClick}
      className={`relative h-48 w-32 flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-lg z-10" />
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        unoptimized
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setImgSrc(fallbackImage);
          setIsLoaded(true);
        }}
      />
    </div>
  );
};

const AnimatedBackground = () => {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateRow = (
      ref: React.RefObject<HTMLDivElement>,
      speed: number
    ) => {
      if (!ref.current) return;

      const row = ref.current;
      const scrollWidth = row.scrollWidth;
      const clientWidth = row.clientWidth;

      let position = 0;
      const animate = () => {
        position -= speed;
        if (position <= -scrollWidth / 2) {
          position = 0;
        }
        row.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animate);
      };

      animate();
    };

    // Different speeds for each row to create parallax effect
    animateRow(row1Ref, 0.5);
    animateRow(row2Ref, 0.7);
    animateRow(row3Ref, 0.3);
  }, []);

  const handlePosterClick = (index: number) => {
    console.log(`Poster ${index} clicked`);
    // Add your click handler logic here
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black/90 dark:bg-black/90 light:bg-light-primary/90">
      <div className="absolute inset-0 flex flex-col justify-between py-16">
        {/* Row 1 */}
        <div className="relative h-48 overflow-hidden">
          <div
            ref={row1Ref}
            className="absolute flex space-x-4 transition-transform duration-0"
          >
            {[...posters, ...posters].map((poster, index) => (
              <MoviePoster
                key={`row1-${index}`}
                src={poster}
                alt={`Movie poster ${index + 1}`}
                index={index}
                onClick={() => handlePosterClick(index)}
              />
            ))}
          </div>
        </div>

        {/* Row 2 - With extra margin */}
        <div className="relative h-48 overflow-hidden my-12">
          <div
            ref={row2Ref}
            className="absolute flex space-x-4 transition-transform duration-0"
          >
            {[...posters.slice().reverse(), ...posters].map((poster, index) => (
              <MoviePoster
                key={`row2-${index}`}
                src={poster}
                alt={`Movie poster ${index + 1}`}
                index={index}
                onClick={() => handlePosterClick(index)}
              />
            ))}
          </div>
        </div>

        {/* Row 3 */}
        <div className="relative h-48 overflow-hidden">
          <div
            ref={row3Ref}
            className="absolute flex space-x-4 transition-transform duration-0"
          >
            {[...posters, ...posters].map((poster, index) => (
              <MoviePoster
                key={`row3-${index}`}
                src={poster}
                alt={`Movie poster ${index + 1}`}
                index={index}
                onClick={() => handlePosterClick(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBackground;
