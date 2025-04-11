# Reel Fling - Movie Guessing Game

![Reel Fling Logo](public/logo.png)

Reel Fling is an interactive movie guessing game where players test their knowledge of films by guessing movie titles letter by letter. The game features both single-player and multiplayer modes, with real-time functionality for a competitive experience.

## 🎮 Features

- **Single-player Mode**: Guess movie titles with customizable difficulty levels
- **Multiplayer Mode**: Create or join lobbies to play with friends in real-time
- **In-game Chat**: Communicate with other players during multiplayer games
- **Difficulty Levels**: Easy, Medium, and Hard modes with varying levels of challenge
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable gameplay
- **Leaderboard System**: Compete for high scores and track your progress
- **Responsive Design**: Play on desktop, tablet, or mobile devices
- **Secure Authentication**: User accounts with hCaptcha protection

## 🚀 Live Demo

Visit the live game at: [https://reel-fling.vercel.app](https://reel-fling.vercel.app)

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication, Realtime)
- **APIs**: TMDB API for movie data
- **Deployment**: Vercel
- **Security**: hCaptcha for bot protection

## 📋 Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account (free tier works fine)
- TMDB API key (optional, for fresh movie data)
- hCaptcha site key and secret key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/reel-fling-game.git
cd reel-fling-game
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key
NEXT_PUBLIC_HCAPTCHA_SITEKEY=your-hcaptcha-site-key
HCAPTCHA_SECRET=your-hcaptcha-secret-key
```

### Supabase Setup

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Navigate to the SQL Editor
3. Copy the entire contents of the `supabase/setup_script.sql` file and run it in the SQL Editor
4. Configure realtime subscriptions in your Supabase project settings

### Running the App

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the game.

### Deployment

The application is configured for easy deployment to Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in Vercel's dashboard
4. Deploy!

## 🎲 Game Modes

### Single Player

- **Easy Mode**: More visible letters and 2 hints available
- **Medium Mode**: Fewer visible letters and 2 hints available
- **Hard Mode**: Minimal visible letters and 1 hint available

### Multiplayer

- **Lobby System**: Create or join game lobbies with friends
- **Round-Based**: Play 3, 5, or 7 rounds per game
- **Real-time Scoring**: Compete for the fastest completion times
- **Host Controls**: Kick inactive players, start games, and configure settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgements

- [TMDB](https://www.themoviedb.org/) for their extensive movie database
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Vercel](https://vercel.com/) for hosting
- [hCaptcha](https://www.hcaptcha.com/) for security protection
