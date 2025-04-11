-- This script creates the necessary tables for the Reel Fling game
-- Use this in Supabase SQL Editor to set up your database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  poster_path TEXT,
  release_year INT,
  genre TEXT,
  industry TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT
);

-- Create profiles table for users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  level INT DEFAULT 1,
  experience INT DEFAULT 0
);

-- Create game_sessions table to track played games and movie history
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('in_progress', 'won', 'lost')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  incorrect_guesses TEXT[] DEFAULT '{}',
  guessed_letters TEXT[] DEFAULT '{}'
);

-- Create multiplayer_lobby table
CREATE TABLE IF NOT EXISTS multiplayer_lobby (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lobby_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('waiting', 'playing', 'completed')),
  max_players INT DEFAULT 4,
  current_movie_id BIGINT REFERENCES movies(id) ON DELETE SET NULL,
  round_number INT DEFAULT 0
);

-- Create multiplayer_players table
CREATE TABLE IF NOT EXISTS multiplayer_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID REFERENCES multiplayer_lobby(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  score INT DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lobby_id, user_id)
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  score INT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table for multiplayer
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID REFERENCES multiplayer_lobby(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);
CREATE INDEX IF NOT EXISTS idx_movies_industry ON movies(industry);
CREATE INDEX IF NOT EXISTS idx_movies_difficulty ON movies(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_movie_id ON game_sessions(movie_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON game_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_multiplayer_lobby_code ON multiplayer_lobby(lobby_code);
CREATE INDEX IF NOT EXISTS idx_multiplayer_players_lobby ON multiplayer_players(lobby_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_lobby ON chat_messages(lobby_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);

-- Enable row level security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_lobby ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Movies: anyone can view movies
CREATE POLICY "Movies are viewable by everyone" ON movies
  FOR SELECT USING (true);

-- Game Sessions: users can view and insert their own sessions
CREATE POLICY "Users can view their own game sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" ON game_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable Realtime functionality for multiplayer
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_lobby;
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_players;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Setup function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || floor(random() * 10000)::text),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creating a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample movie data
INSERT INTO public.movies (id, title, poster_path, release_year, genre, industry, difficulty, description)
VALUES 
  (1, 'The Shawshank Redemption', '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 1994, 'Drama', 'Hollywood', 'medium', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'),
  (2, 'The Godfather', '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 1972, 'Crime', 'Hollywood', 'medium', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'),
  (3, 'Inception', '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 2010, 'Science Fiction', 'Hollywood', 'easy', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.')
ON CONFLICT (id) DO NOTHING; 