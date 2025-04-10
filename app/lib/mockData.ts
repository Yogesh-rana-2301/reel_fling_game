import { Movie } from "./supabase";

// Mock movie data to use when TMDB API is not available
export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "INCEPTION",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    release_year: 2010,
    genre: "Science Fiction",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
  },
  {
    id: 2,
    title: "THE GODFATHER",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    release_year: 1972,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
  },
  {
    id: 3,
    title: "PULP FICTION",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    release_year: 1994,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
  },
  {
    id: 4,
    title: "THE DARK KNIGHT",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    release_year: 2008,
    genre: "Action",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  },
  {
    id: 5,
    title: "PARASITE",
    poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    release_year: 2019,
    genre: "Drama",
    industry: "Korean",
    difficulty: "hard",
    description:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
  },
  {
    id: 6,
    title: "TITANIC",
    poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    release_year: 1997,
    genre: "Romance",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
  },
  {
    id: 7,
    title: "AVATAR",
    poster_path: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
    release_year: 2009,
    genre: "Science Fiction",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
  },
  {
    id: 8,
    title: "THREE IDIOTS",
    poster_path: "/66A9MqXOyVFCssoloscw79z8Tew.jpg",
    release_year: 2009,
    genre: "Comedy",
    industry: "Bollywood",
    difficulty: "medium",
    description:
      "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the rest of the world called them 'idiots'.",
  },
  {
    id: 9,
    title: "YOUR NAME",
    poster_path: "/q719jXXEzOoYaps6babgKnONONX.jpg",
    release_year: 2016,
    genre: "Animation",
    industry: "Japanese",
    difficulty: "hard",
    description:
      "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?",
  },
  {
    id: 10,
    title: "GET OUT",
    poster_path: "/qbaIHiL1irPkbXGmRxVwmrYd7The.jpg",
    release_year: 2017,
    genre: "Horror",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.",
  },
];

// Function to get movies filtered by genre and industry
export const getFilteredMockMovies = (
  genre: string = "All",
  industry: string = "Hollywood",
  difficulty: "easy" | "medium" | "hard" = "medium"
): Movie[] => {
  let filtered = [...mockMovies];

  if (genre !== "All") {
    filtered = filtered.filter((movie) => movie.genre === genre);
  }

  if (industry !== "All") {
    filtered = filtered.filter((movie) => movie.industry === industry);
  }

  filtered = filtered.filter((movie) => movie.difficulty === difficulty);

  // If no movies match the criteria, return all movies of the selected difficulty
  if (filtered.length === 0) {
    return mockMovies.filter((movie) => movie.difficulty === difficulty);
  }

  return filtered;
};

// Function to get a random movie based on filters
export const getRandomMockMovie = (
  genre: string = "All",
  industry: string = "Hollywood",
  difficulty: "easy" | "medium" | "hard" = "medium"
): Movie => {
  const filteredMovies = getFilteredMockMovies(genre, industry, difficulty);
  const randomIndex = Math.floor(Math.random() * filteredMovies.length);
  return filteredMovies[randomIndex];
};
