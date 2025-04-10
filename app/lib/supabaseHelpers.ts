"use client";

import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Helper function to safely execute Supabase operations
export const safeSupabaseOperation = async (
  supabase: SupabaseClient | null,
  operation: (db: SupabaseClient) => Promise<any>
) => {
  if (!supabase) {
    console.error("Supabase client is not available");
    return {
      data: null,
      error: { message: "Database connection not available" },
    };
  }

  try {
    return await operation(supabase);
  } catch (error) {
    console.error("Error in Supabase operation:", error);
    return { data: null, error };
  }
};

// Function to subscribe to lobby updates
export const subscribeToLobby = (
  supabase: SupabaseClient | null,
  lobbyCode: string,
  onPlayersUpdate: (players: any[]) => void
) => {
  if (!supabase) return null;

  const subscription = supabase
    .channel(`lobby_${lobbyCode}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "lobby_players",
        filter: `lobby_code=eq.${lobbyCode}`,
      },
      (payload) => {
        // Fetch all players when there's an update
        fetchLobbyPlayers(supabase, lobbyCode).then((players) => {
          if (players) {
            onPlayersUpdate(players);
          }
        });
      }
    )
    .subscribe();

  return subscription;
};

// Function to subscribe to chat messages
export const subscribeToChat = (
  supabase: SupabaseClient | null,
  lobbyCode: string,
  onChatUpdate: (messages: any[]) => void
) => {
  if (!supabase) return null;

  const subscription = supabase
    .channel(`chat_${lobbyCode}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "lobby_chat",
        filter: `lobby_code=eq.${lobbyCode}`,
      },
      (payload) => {
        // Fetch all messages when there's a new one
        fetchChatMessages(supabase, lobbyCode).then((messages) => {
          if (messages) {
            onChatUpdate(messages);
          }
        });
      }
    )
    .subscribe();

  return subscription;
};

// Function to fetch all players in a lobby
export const fetchLobbyPlayers = async (
  supabase: SupabaseClient | null,
  lobbyCode: string
) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("lobby_players")
    .select("*")
    .eq("lobby_code", lobbyCode)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching lobby players:", error);
    return null;
  }

  return data;
};

// Function to fetch chat messages for a lobby
export const fetchChatMessages = async (
  supabase: SupabaseClient | null,
  lobbyCode: string
) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("lobby_chat")
    .select("*")
    .eq("lobby_code", lobbyCode)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return null;
  }

  return data;
};

// Function to send a chat message
export const sendChatMessage = async (
  supabase: SupabaseClient | null,
  lobbyCode: string,
  playerId: string,
  playerName: string,
  message: string
) => {
  if (!supabase) {
    toast.error("Cannot send message in offline mode");
    return false;
  }

  if (!message.trim()) {
    return false;
  }

  const { error } = await supabase.from("lobby_chat").insert({
    lobby_code: lobbyCode,
    player_id: playerId,
    player_name: playerName,
    message: message.trim(),
  });

  if (error) {
    console.error("Error sending chat message:", error);
    toast.error("Failed to send message");
    return false;
  }

  return true;
};

// Function to update player's last activity timestamp
export const updatePlayerActivity = async (
  supabase: SupabaseClient | null,
  playerId: string,
  lobbyCode: string
) => {
  if (!supabase) return;

  const { error } = await supabase
    .from("lobby_players")
    .update({ last_active: new Date().toISOString() })
    .match({ player_id: playerId, lobby_code: lobbyCode });

  if (error) {
    console.error("Error updating player activity:", error);
  }
};

// Function to kick inactive players
export const kickInactivePlayers = async (
  supabase: SupabaseClient | null,
  lobbyCode: string,
  inactiveThresholdMinutes: number = 2
) => {
  if (!supabase) return [];

  // Calculate the cutoff time
  const now = new Date();
  const cutoffTime = new Date(
    now.getTime() - inactiveThresholdMinutes * 60 * 1000
  );

  // Get inactive players
  const { data: inactivePlayers, error: fetchError } = await supabase
    .from("lobby_players")
    .select("*")
    .eq("lobby_code", lobbyCode)
    .lt("last_active", cutoffTime.toISOString());

  if (fetchError) {
    console.error("Error fetching inactive players:", fetchError);
    return [];
  }

  if (!inactivePlayers || inactivePlayers.length === 0) {
    return [];
  }

  // Delete inactive players
  const playerIds = inactivePlayers.map((p) => p.player_id);

  const { error: deleteError } = await supabase
    .from("lobby_players")
    .delete()
    .in("player_id", playerIds)
    .eq("lobby_code", lobbyCode);

  if (deleteError) {
    console.error("Error kicking inactive players:", deleteError);
  }

  return inactivePlayers;
};
