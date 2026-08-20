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
  {
    id: 11,
    title: "DILWALE DULHANIA LE JAYENGE",
    poster_path: "/u216P4y8n0q211J6R7z8Z4q2x6e.jpg",
    release_year: 1995,
    genre: "Romance",
    industry: "Bollywood",
    difficulty: "hard",
    description:
      "A young man and woman fall in love on a trip through Europe, but the woman's father has already promised her hand to another.",
  },
  {
    id: 12,
    title: "OLDBOY",
    poster_path: "/p9Yv9jxH3F2L864G0BqZ1G2L3eL.jpg",
    release_year: 2003,
    genre: "Thriller",
    industry: "Korean",
    difficulty: "hard",
    description:
      "After being kidnapped and imprisoned for fifteen years, Oh Dae-Su is released, only to find that he must find his captor in five days.",
  },
  {
    id: 13,
    title: "SPIRITED AWAY",
    poster_path: "/39nU1WbQ2cK4sL6g3QJq2oJ2lJ7.jpg",
    release_year: 2001,
    genre: "Animation",
    industry: "Japanese",
    difficulty: "easy",
    description:
      "A young girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.",
  },
  {
    id: 14,
    title: "PAN'S LABYRINTH",
    poster_path: "/qL84Hk57v6S2zL4G8V2H9U4R2cI.jpg",
    release_year: 2006,
    genre: "Fantasy",
    industry: "Spanish",
    difficulty: "medium",
    description:
      "In the Falangist Spain of 1944, the stepdaughter of a sadistic army officer escapes into an eerie but captivating fantasy world.",
  },
  {
    id: 15,
    title: "CITY OF GOD",
    poster_path: "/e0oZ45PZ5Vv6mU6V4G3V3S1nL4T.jpg",
    release_year: 2002,
    genre: "Crime",
    industry: "Brazilian",
    difficulty: "hard",
    description:
      "Two boys growing up in a violent neighborhood of Rio de Janeiro take different paths: one becomes a photographer, the other a drug dealer.",
  },
  {
    id: 16,
    title: "THE LION KING",
    poster_path: "/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
    release_year: 1994,
    genre: "Animation",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
  },
  {
    id: 17,
    title: "PK",
    poster_path: "/o1uL5r1R45uQ3p2eL5mQ4p2oP4O.jpg",
    release_year: 2014,
    genre: "Comedy",
    industry: "Bollywood",
    difficulty: "medium",
    description:
      "An alien on Earth loses the only device he can use to communicate with his spaceship.",
  },
  {
    id: 18,
    title: "TRAIN TO BUSAN",
    poster_path: "/v2y5W6n60sC7H4eP9H8H6H6H6H6.jpg",
    release_year: 2016,
    genre: "Horror",
    industry: "Korean",
    difficulty: "easy",
    description:
      "While a zombie virus breaks out in South Korea, passengers struggle to survive on the train from Seoul to Busan.",
  },
  {
    id: 19,
    title: "SEVEN SAMURAI",
    poster_path: "/7eM63pP5Hj5Z3w3H3R3eL3oL3oM.jpg",
    release_year: 1954,
    genre: "Action",
    industry: "Japanese",
    difficulty: "hard",
    description:
      "Farmers from a village exploited by bandits hire a veteran samurai for protection, who then gathers six other samurai to join him.",
  },
  {
    id: 20,
    title: "THE SECRET IN THEIR EYES",
    poster_path: "/x2H9U4R2cI4H8H6H6H6H6H6H6H6.jpg",
    release_year: 2009,
    genre: "Mystery",
    industry: "Spanish",
    difficulty: "medium",
    description:
      "A retired legal counselor writes a novel hoping to find closure for one of his past unresolved homicide cases and for his unrequited love with his superior.",
  },
  // --- Hollywood: Sci-Fi & Action ---
  {
    id: 21,
    title: "INTERSTELLAR",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    release_year: 2014,
    genre: "Science Fiction",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    id: 22,
    title: "THE MATRIX",
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    release_year: 1999,
    genre: "Science Fiction",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
  },
  {
    id: 23,
    title: "DUNE",
    poster_path: "/d5NXSklpcvkn173OKGiSead1AEL.jpg",
    release_year: 2021,
    genre: "Science Fiction",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.",
  },
  {
    id: 24,
    title: "GLADIATOR",
    poster_path: "/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    release_year: 2000,
    genre: "Action",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
  },
  {
    id: 25,
    title: "TOP GUN MAVERICK",
    poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    release_year: 2022,
    genre: "Action",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot.",
  },
  {
    id: 26,
    title: "KILL BILL VOLUME 1",
    poster_path: "/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg",
    release_year: 2003,
    genre: "Action",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "After awakening from a four-year coma, a former assassin wreaks vengeance on the team of assassins who betrayed her.",
  },
  {
    id: 27,
    title: "SPIDER-MAN NO WAY HOME",
    poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    release_year: 2021,
    genre: "Action",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
  },
  // --- Hollywood: Drama & Thriller ---
  {
    id: 28,
    title: "THE SHAWSHANK REDEMPTION",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    release_year: 1994,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
  },
  {
    id: 29,
    title: "SCHINDLER'S LIST",
    poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    release_year: 1993,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
  },
  {
    id: 30,
    title: "FORREST GUMP",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    release_year: 1994,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75.",
  },
  {
    id: 31,
    title: "GOODFELLAS",
    poster_path: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    release_year: 1990,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.",
  },
  {
    id: 32,
    title: "FIGHT CLUB",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    release_year: 1999,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much more.",
  },
  {
    id: 33,
    title: "WHIPLASH",
    poster_path: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    release_year: 2014,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
  },
  {
    id: 34,
    title: "OPPENHEIMER",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    release_year: 2023,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
  },
  {
    id: 35,
    title: "THE SILENCE OF THE LAMBS",
    poster_path: "/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg",
    release_year: 1991,
    genre: "Thriller",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer who skins his victims.",
  },
  {
    id: 36,
    title: "NO COUNTRY FOR OLD MEN",
    poster_path: "/bj1v6YKF8yHqA489VFfnQvOJpnr.jpg",
    release_year: 2007,
    genre: "Thriller",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande.",
  },
  {
    id: 37,
    title: "KNIVES OUT",
    poster_path: "/pThyQovXQrws2hmol1gyhRfFCQn.jpg",
    release_year: 2019,
    genre: "Thriller",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the eccentric members of his family all become suspects.",
  },
  // --- Hollywood: Horror & Animation ---
  {
    id: 38,
    title: "HEREDITARY",
    poster_path: "/p9YagjNrCuGtOAvt7VZPMRlNDFG.jpg",
    release_year: 2018,
    genre: "Horror",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "When the matriarch of the Graham family passes away, her daughter's family begins to unravel cryptic and terrifying secrets about their ancestry.",
  },
  {
    id: 39,
    title: "A QUIET PLACE",
    poster_path: "/nAU74GmpUk7t5iklEp3bufwDq4n.jpg",
    release_year: 2018,
    genre: "Horror",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "In a post-apocalyptic world, a family is forced to live in near silence while hiding from monsters with ultra-sensitive hearing.",
  },
  {
    id: 40,
    title: "JURASSIC PARK",
    poster_path: "/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg",
    release_year: 1993,
    genre: "Science Fiction",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "A pragmatic paleontologist visiting an almost-complete theme park is tasked with protecting a couple of kids after a power failure causes the park's cloned dinosaurs to run loose.",
  },
  {
    id: 41,
    title: "COCO",
    poster_path: "/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
    release_year: 2017,
    genre: "Animation",
    industry: "Hollywood",
    difficulty: "easy",
    description:
      "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer.",
  },
  {
    id: 42,
    title: "EVERYTHING EVERYWHERE ALL AT ONCE",
    poster_path: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    release_year: 2022,
    genre: "Science Fiction",
    industry: "Hollywood",
    difficulty: "hard",
    description:
      "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
  },
  // --- Bollywood ---
  {
    id: 43,
    title: "DANGAL",
    poster_path: "/nHl1n9zKVkqQIvCJuLzluvSHBZO.jpg",
    release_year: 2016,
    genre: "Drama",
    industry: "Bollywood",
    difficulty: "medium",
    description:
      "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards the 2010 Commonwealth Games in the sport of wrestling.",
  },
  {
    id: 44,
    title: "LAGAAN",
    poster_path: "/noDQkHNzDtOAlVHxMfEZKfnNJPN.jpg",
    release_year: 2001,
    genre: "Drama",
    industry: "Bollywood",
    difficulty: "hard",
    description:
      "In the Victorian era, the people of a small village in India stake their future on a game of cricket against their British rulers.",
  },
  {
    id: 45,
    title: "ANDHADHUN",
    poster_path: "/3oMVcGG2nVmGgzh6MGPIG1qBiWF.jpg",
    release_year: 2018,
    genre: "Thriller",
    industry: "Bollywood",
    difficulty: "hard",
    description:
      "A series of mysterious events change the life of a blind pianist who now must report a murder that he should technically never have seen.",
  },
  {
    id: 46,
    title: "RRR",
    poster_path: "/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg",
    release_year: 2022,
    genre: "Action",
    industry: "Bollywood",
    difficulty: "medium",
    description:
      "A fictional take on the lives of two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.",
  },
  // --- Korean ---
  {
    id: 47,
    title: "BURNING",
    poster_path: "/9z3KihCMLzPDpqojKFNsqHOUQ3v.jpg",
    release_year: 2018,
    genre: "Drama",
    industry: "Korean",
    difficulty: "hard",
    description:
      "Jong-su meets Hae-mi by chance and when she returns from Africa with a mysterious young man, a series of puzzling events unfolds.",
  },
  // --- Japanese ---
  {
    id: 48,
    title: "PRINCESS MONONOKE",
    poster_path: "/dUoTmBk18YjNqAGUJdDGQmqMaXv.jpg",
    release_year: 1997,
    genre: "Animation",
    industry: "Japanese",
    difficulty: "hard",
    description:
      "On a journey to find the cure for a Tatarigami's curse, Ashitaka finds himself in the middle of a war between the forest gods and Tatara, a mining colony.",
  },
  // --- European Arthouse ---
  {
    id: 49,
    title: "AMELIE",
    poster_path: "/nzxOMoTMhwNkUOI96fVgGiO3HxF.jpg",
    release_year: 2001,
    genre: "Romance",
    industry: "French",
    difficulty: "hard",
    description:
      "Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and along the way, discovers love.",
  },
  {
    id: 50,
    title: "ROMA",
    poster_path: "/aiM8B4XT74Ql7tSzPBSVkS2eUBU.jpg",
    release_year: 2018,
    genre: "Drama",
    industry: "Spanish",
    difficulty: "hard",
    description:
      "A year in the life of a middle-class family's maid in Mexico City in the early 1970s.",
  },
  {
    id: 51,
    title: "CITY OF GOD",
    poster_path: "/k7eYdWvhYQyRQoU2TB2A2Xu2TfK.jpg",
    release_year: 2002,
    genre: "Crime",
    industry: "Brazilian",
    difficulty: "hard",
    description:
      "Two boys growing up in a violent neighborhood of Rio de Janeiro take different paths: one becomes a photographer, the other a drug dealer.",
  },
  {
    id: 52,
    title: "GRAVITY",
    poster_path: "/kZ2nZw8D681aphWVPqRSZFULGBs.jpg",
    release_year: 2013,
    genre: "Science Fiction",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "A medical engineer and an astronaut work together to survive after an accident leaves them adrift in space.",
  },
  {
    id: 53,
    title: "JOKER",
    poster_path: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    release_year: 2019,
    genre: "Drama",
    industry: "Hollywood",
    difficulty: "medium",
    description:
      "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society, then embarks on a downward spiral of revolution and bloody crime.",
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
