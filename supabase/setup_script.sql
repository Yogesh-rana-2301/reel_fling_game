-- This script creates the necessary tables for the Reel Fling game
-- Use this in Supabase SQL Editor to set up your database

-- Lobbies table for multiplayer lobbies
CREATE TABLE IF NOT EXISTS public.lobbies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'waiting' NOT NULL,
  difficulty text DEFAULT 'medium' NOT NULL,
  current_movie jsonb
);

-- Players in lobbies
CREATE TABLE IF NOT EXISTS public.lobby_players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id text NOT NULL,
  lobby_code text NOT NULL REFERENCES public.lobbies(code) ON DELETE CASCADE,
  name text NOT NULL,
  is_ready boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  last_active timestamp with time zone DEFAULT now() NOT NULL,
  display_title text,
  incorrect_letters text[] DEFAULT '{}'::text[],
  guessed_letters text[] DEFAULT '{}'::text[],
  strikes integer DEFAULT 0,
  game_status text DEFAULT 'idle',
  completion_time numeric,
  rank integer
);

-- Lobby chat messages
CREATE TABLE IF NOT EXISTS public.lobby_chat (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_code text NOT NULL REFERENCES public.lobbies(code) ON DELETE CASCADE,
  player_id text NOT NULL,
  player_name text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Movies database - making sure the poster_path field is correctly named
DROP TABLE IF EXISTS public.movies;
CREATE TABLE public.movies (
  id integer PRIMARY KEY,
  title text NOT NULL,
  poster_path text,  -- This is the correct column name
  release_year integer,
  genre text,
  industry text DEFAULT 'Hollywood',
  difficulty text DEFAULT 'medium',
  description text
);

-- User profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  username text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  games_lost integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  max_streak integer DEFAULT 0,
  level integer DEFAULT 1,
  experience integer DEFAULT 0
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS lobby_code_idx ON public.lobby_players(lobby_code);
CREATE INDEX IF NOT EXISTS lobby_player_id_idx ON public.lobby_players(player_id);
CREATE INDEX IF NOT EXISTS lobby_chat_code_idx ON public.lobby_chat(lobby_code);

-- Enable Row Level Security
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access
CREATE POLICY "Allow all access to lobbies" ON public.lobbies FOR ALL USING (true);
CREATE POLICY "Allow all access to lobby players" ON public.lobby_players FOR ALL USING (true);
CREATE POLICY "Allow all access to lobby chat" ON public.lobby_chat FOR ALL USING (true);
CREATE POLICY "Allow read access to movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Allow read access to profiles" ON public.profiles FOR SELECT USING (true);

-- Set up realtime subscriptions
BEGIN;
  -- Enable publication for realtime
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobbies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_chat;

-- Insert sample movie data
INSERT INTO public.movies (id, title, poster_path, release_year, genre, industry, difficulty, description)
VALUES 
  (1, 'The Shawshank Redemption', '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 1994, 'Drama', 'Hollywood', 'medium', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'),
  (2, 'The Godfather', '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 1972, 'Crime', 'Hollywood', 'medium', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'),
  (3, 'Inception', '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 2010, 'Science Fiction', 'Hollywood', 'easy', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.')
ON CONFLICT (id) DO NOTHING; 