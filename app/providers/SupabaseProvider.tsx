"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Create a context for Supabase
type SupabaseContextType = {
  supabase: SupabaseClient | null;
};

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
});

// Create a custom hook to use the Supabase context
export function useSupabase() {
  return useContext(SupabaseContext);
}

// Create the provider
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Initialize Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(supabaseClient);
    } else {
      console.warn("Supabase credentials not found in environment variables");
    }
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}
