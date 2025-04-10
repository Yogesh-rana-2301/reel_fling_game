# Reel Fling - Movie Guessing Game

Reel Fling is an interactive movie guessing game built with Next.js, React, Tailwind CSS, and Supabase.

## Features

- Single-player mode to guess movie titles
- Multiplayer mode with real-time lobby system
- In-game chat for multiplayer
- Automatic inactive player removal
- Dark/Light mode toggle
- Leaderboard system
- Local progress tracking
- Hint system based on difficulty levels

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account (free tier works fine)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd reel-fling
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the Supabase credentials from your Supabase dashboard
   - Optionally add a TMDB API key for movie data

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key (optional)
```

### Supabase Setup

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Once your project is created, navigate to the SQL Editor
3. Copy the entire contents of the `supabase/setup_script.sql` file and run it in the SQL Editor
4. This will create all the necessary tables and set up realtime subscriptions

### Running the App

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the game.

## Troubleshooting Supabase Connection Issues

If you're experiencing issues with Supabase connections:

1. Verify your credentials in `.env.local` match those in your Supabase project dashboard
2. Check that the correct tables are created by running the setup script
3. Ensure Realtime functionality is enabled in your Supabase project settings:

   - Go to your Supabase dashboard → Project Settings → API
   - Scroll down to "Realtime" section and make sure it's enabled
   - Enable all the necessary Realtime features (Broadcast, Presence, Postgres Changes)

4. Make sure Row Level Security (RLS) policies are set correctly:
   - The setup script includes RLS policies that should work, but if you've modified them, check the access permissions
   - For testing, you can temporarily open up policies with `USING (true)` and `WITH CHECK (true)`

## Game Modes

- **Easy Mode**: "FILMQUIZ" with 2 hints available
- **Medium Mode**: "FIL" crossed out + "MQUIZ" with 2 hints available
- **Hard Mode**: Only "QUIZ" with 1 hint available

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
