var fromApplyFilter = false;
var curTab = 'watchlistTa';

var movieGenres = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

var tvGenres = {
    10759: "Action",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western"
};

var mainListGenres = [];

// Object to hold details of each media (will later be populated by TMDB API calls)
var watchlist = [
    {
        mediaID: '1396',
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
        title: "Breaking Bad",
        mediaType: "TV Show",
        genre: "Crime, Drama, Thriller",
        year: "2008",
        description: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future."
    },
    {
        mediaID: '335984',
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        title: "Blade Runner 2049",
        mediaType: "Movie",
        genre: "Sci-Fi, Mystery",
        year: "2017",
        description: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard, a former LAPD blade runner who has been missing for 30 years."
      }
    ];

var watchedList = [
    {
        mediaID: '697403',
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/pCGyPVrI9Fzw6rE1Pvi4BIXF6ET.jpg",
        title: "Ozark",
        mediaType: "TV Show",
        genre: "Crime, Drama, Thriller",
        year: "22017",
        description: "A financial advisor drags his family from Chicago to the Missouri Ozarks, where he must launder money to appease a drug boss."
    },
    {
        mediaID: '6977',
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg",
        title: "No Country For Old Men",
        mediaType: "Movie",
        genre: "Sci-Fi, Mystery",
        year: "2002",
        description: "Violence and mayhem ensue after a hunter stumbles upon the aftermath of a drug deal gone wrong and over two million dollars in cash near the Rio Grande."
    },
    {
        mediaID: '157336',
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        title: "Interstellar",
        mediaType: "Movie",
        genre: "Sci-Fi, Adventure, Drama",
        year: "2014",
        description: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.'
    }
    ];

// var watchlist = [];
// var watchedList = [];
var searchList = [];
var mainList = [];