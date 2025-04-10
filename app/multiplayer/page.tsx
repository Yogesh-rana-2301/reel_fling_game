"use client";

import { useEffect } from "react";
import MultiplayerLobby from "@/app/components/MultiplayerLobby";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function MultiplayerPage() {
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

      <MultiplayerLobby />
    </div>
  );
}
