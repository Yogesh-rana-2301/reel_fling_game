"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Game from "@/app/components/Game";
import HowToPlay from "@/app/components/HowToPlay";
import Leaderboard from "@/app/components/Leaderboard";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import AuthButton from "@/app/components/AuthButton";
import { useGameStore } from "@/app/store/gameStore";
import Link from "next/link";
import { FaUser, FaUsers, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";

export default function Home() {
  const { showRules, showLeaderboard } = useGameStore();

  return (
    <div className="h-screen flex items-center justify-center relative">
      <AnimatedBackground />

      {/* Auth button - top right */}
      <div className="absolute top-4 right-4 z-20">
        <AuthButton />
      </div>

      <div className="game-container max-w-2xl relative z-10">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-bold mb-3 font-display">
            Reel <span className="text-accent">Fling</span>
          </h1>
          <p className="text-gray-300">
            Guess the movie title, one letter at a time!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/single-player"
            className="btn-primary h-32 flex flex-col items-center justify-center rounded-lg transition-transform hover:scale-105"
          >
            <FaUser className="text-3xl mb-2" />
            <span className="text-lg font-semibold">Single Player</span>
            <span className="text-xs text-gray-300">Classic gameplay</span>
          </Link>

          <Link
            href="/multiplayer"
            className="btn-primary h-32 flex flex-col items-center justify-center rounded-lg transition-transform hover:scale-105"
          >
            <FaUsers className="text-3xl mb-2" />
            <span className="text-lg font-semibold">Multiplayer</span>
            <span className="text-xs text-gray-300">Race against friends</span>
          </Link>

          <Link
            href="/daily-challenge"
            className="btn-primary h-32 flex flex-col items-center justify-center rounded-lg transition-transform hover:scale-105"
          >
            <FaCalendarAlt className="text-3xl mb-2" />
            <span className="text-lg font-semibold">Daily Challenge</span>
            <span className="text-xs text-gray-300">
              Same movie for everyone
            </span>
          </Link>

          <Link
            href="/how-to-play"
            className="btn-outline h-32 flex flex-col items-center justify-center rounded-lg transition-transform hover:scale-105"
          >
            <FaInfoCircle className="text-3xl mb-2" />
            <span className="text-lg font-semibold">How to Play</span>
            <span className="text-xs text-gray-300">Game rules &amp; tips</span>
          </Link>
        </div>

        <footer className="text-center text-sm text-gray-400">
          <p>© 2025 Reel Fling. All Rights Reserved.</p>
          <p className="mt-1">No login required - Progress saved locally</p>
        </footer>
      </div>
    </div>
  );
}
