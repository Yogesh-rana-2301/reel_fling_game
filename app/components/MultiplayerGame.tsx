"use client";

import { useMultiplayerStore } from "@/app/store/multiplayerStore";

export default function MultiplayerGame() {
  const { players, countdownTimer, gameTimer } = useMultiplayerStore();

  // Placeholder component
  return (
    <div className="game-container">
      <h2 className="text-2xl font-semibold mb-4">Multiplayer Game</h2>
      <p>Timer: {gameTimer || 0}s</p>
      <p>Players: {players.length}</p>
    </div>
  );
}
