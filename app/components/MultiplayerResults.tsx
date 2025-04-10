"use client";

import { useMultiplayerStore } from "@/app/store/multiplayerStore";

export default function MultiplayerResults() {
  const { players, resetGame, exitLobby } = useMultiplayerStore();

  // Placeholder component
  return (
    <div className="game-container">
      <h2 className="text-2xl font-semibold mb-4">Game Results</h2>
      <p>Total Players: {players.length}</p>

      <div className="flex gap-4 mt-6">
        <button onClick={resetGame} className="btn-primary">
          Play Again
        </button>
        <button onClick={exitLobby} className="btn-secondary">
          Exit Lobby
        </button>
      </div>
    </div>
  );
}
