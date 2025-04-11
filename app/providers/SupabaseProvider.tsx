"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

// Create a context for Supabase
type SupabaseContextType = {
  supabase: SupabaseClient | null;
  user: User | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  user: null,
  loading: true,
});

// Create a custom hook to use the Supabase context
export function useSupabase() {
  return useContext(SupabaseContext);
}

// Create the provider
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Initialize Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(supabaseClient);

      // Get initial session
      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        setLoading(false);
      });

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      });

      // Clean up subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    } else {
      console.warn("Supabase credentials not found in environment variables");
      setLoading(false);
    }
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, user, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}
