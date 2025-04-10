"use client";

import { useEffect } from "react";
import Game from "@/app/components/Game";
import HowToPlay from "@/app/components/HowToPlay";
import Leaderboard from "@/app/components/Leaderboard";
import DailyChallenge from "@/app/components/DailyChallenge";
import LevelProgress from "@/app/components/LevelProgress";
import { useGameStore } from "@/app/store/gameStore";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function DailyChallengePage() {
  const { showRules, showLeaderboard } = useGameStore();

  return (
    <div className="py-8 container mx-auto">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-accent hover:underline"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </div>

      <DailyChallenge />
      <Game />

      <div className="mt-6">
        <LevelProgress />
      </div>

      {/* Conditionally render modals */}
      {showRules && <HowToPlay />}
      {showLeaderboard && <Leaderboard />}
    </div>
  );
}
