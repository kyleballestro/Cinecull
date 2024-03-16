var watchlistTab = document.getElementById('watchlist-tab');
var watchedTab = document.getElementById('watched-tab');
var searchBar = document.getElementById('search-bar');
var listTitle = document.getElementById('list-title');
var applyFilter = document.getElementById('apply-filter');
var clearFilter = document.getElementById('clear-filter');
var curTab = 'watchlistTab';

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
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

var tvGenres = {
    10759: "Action & Adventure",
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
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western"
};

var mainListGenres = [];

// Object to hold details of each media (will later be populated by TMDB API calls)
var watchlist = [
    {
      thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
      title: "Breaking Bad",
      mediaType: "TV Show",
      genre: "Crime, Drama, Thriller",
      year: "2008",
      description: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future."
    },
    {
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        title: "Blade Runner 2049",
        mediaType: "Movie",
        genre: "Sci-Fi, Mystery",
        year: "2017",
        description: "Some robot guy thinks he's special and he's the first born robot or something but he's really not."
      }
    ];

var watchedList = [
    {
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/pCGyPVrI9Fzw6rE1Pvi4BIXF6ET.jpg",
        title: "Ozark",
        mediaType: "TV Show",
        genre: "Crime, Drama, Thriller",
        year: "22017",
        description: "A financial advisor drags his family from Chicago to the Missouri Ozarks, where he must launder money to appease a drug boss."
    },
    {
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg",
        title: "No Country For Old Men",
        mediaType: "Movie",
        genre: "Sci-Fi, Mystery",
        year: "2002",
        description: "Violence and mayhem ensue after a hunter stumbles upon the aftermath of a drug deal gone wrong and over two million dollars in cash near the Rio Grande."
    },
    {
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

// Load up the watchlist first
window.onload = function(){
    populateMediaCards(watchlist);
    mainList = watchlist;
}

// Switch to watchlist tab
watchlistTab.addEventListener('click', function(event) {
    if (curTab != 'watchlistTab'){
        // Clear the main list
        const list = document.querySelector('.main-list');
        list.innerHTML = '';

        // Populate it with the items in watchlist
        populateMediaCards(watchlist);

        // Change the current tab, clear the search bar, change list title
        curTab = 'watchlistTab';
        searchBar.value = '';
        listTitle.textContent = 'Watchlist';

        // Clear the watched tab background and set the watchlist tab background
        watchedTab.style.background = 'none';
        this.style.backgroundColor = '#3A3F74';
        mainList = watchlist;
    }
});

// Switch to watchlist tab
watchedTab.addEventListener('click', function(event) {
    if (curTab != 'watchedTab'){
        // Clear the main list
        const list = document.querySelector('.main-list');
        list.innerHTML = '';

        // Populate it with the items in watched
        populateMediaCards(watchedList);

        // Change the current tab, clear the search bar, change list title
        curTab = 'watchedTab';
        searchBar.value = '';
        listTitle.textContent = 'Watched';

        // Clear the watchlist tab background and set the watched tab background
        watchlistTab.style.background = 'none';
        this.style.backgroundColor = '#3A3F74';
        mainList = watchedList;
    }
});

// Switch to search tab
searchBar.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && this.value != '') {
        event.preventDefault();

        // Clear the main list and searched
        const list = document.querySelector('.main-list');
        list.innerHTML = '';
        searchList = [];

        const searchedTitle = this.value;
        const encodedTitle = encodeURIComponent(searchedTitle);

        // TMDB API call on the server side and receive it. Parse and populate searchList.
        fetch(`/searchMedia?title=${encodedTitle}`)
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.results.length; i++){
                if (data.results[i].media_type !== 'person'){
                    let media = {
                        thumbnail: data.results[i].poster_path === null ? 'images/no image available.webp' : 'https://image.tmdb.org/t/p/w500' + data.results[i].poster_path, 
                        title: data.results[i].title || data.results[i].name, 
                        mediaType: data.results[i].title ? 'Movie' : 'TV Show', 
                        genre: '', 
                        year: (data.results[i].release_date || data.results[i].first_air_date), 
                        description: data.results[i].overview ? data.results[i].overview : 'No description available.'
                    };
                    for (let j = 0; j < data.results[i].genre_ids.length; j++){
                        var theGenre = media.mediaType === 'Movie' ? movieGenres[data.results[i].genre_ids[j]]: tvGenres[data.results[i].genre_ids[j]];
                        media.genre += j === data.results[i].genre_ids.length - 1 ? theGenre: theGenre + ', ';
                    }
                    media.year = media.year.substring(0, 4);
                    searchList.push(media);   
                }
            }
            // Populate mainList using searchList
            populateMediaCards(searchList);
        })
        .catch(error => console.error('Error fetching data:', error));

        // Change the current tab, clear the backgrounds of watchlistTab and watchedTab, change list title
        curTab = 'searchTab';
        watchedTab.style.background = 'none';
        watchlistTab.style.background = 'none';
        listTitle.textContent = 'Searched: ' + this.value;
        mainList = searchList;
    }
});


// --------- Filters ---------
// Apply Filter
applyFilter.addEventListener('click', function(event) {
    // Check which of the filters are checked
    var moviesIsChecked = document.getElementById('moviesCheckbox').checked;
    var tvIsChecked = document.getElementById('tvShowsCheckbox').checked;

    // If movie and TV filters and current list size != main list size, repopulate with main list
    if (moviesIsChecked && tvIsChecked && document.querySelector('.item-count').textContent.match(/^\d+/) != String(mainList.length)){
        populateMediaCards(mainList);
    }
    else if (moviesIsChecked || tvIsChecked){ 
        // Otherwise, go through main list and add the ones that meet the filters to filteredList
        var filteredList = [];
    
        for (let i = 0; i < mainList.length; i++){
            if ((moviesIsChecked && mainList[i].mediaType === 'Movie') || (tvIsChecked && mainList[i].mediaType === 'TV Show')){
                filteredList.push(mainList[i]);
            }
        }

        // Populate the list with filteredList
        if (filteredList.length != mainList.length){
            populateMediaCards(filteredList);
        }
    }
});

// Clear Filter
clearFilter.addEventListener('click', function(event) {
    // Uncheck all the filters
    document.getElementById('moviesCheckbox').checked = false;
    document.getElementById('tvShowsCheckbox').checked = false;
    document.getElementById('genreCheckbox').checked = false;

    // Reset to full list if the current list isn't the same size as main list
    if (document.querySelector('.item-count').textContent.match(/^\d+/) != String(mainList.length)){
        populateMediaCards(mainList);
    }
});


// Function to populate the mainListGenres array given the current mainList
function populateMainListGenres(selectedList){
    mainListGenres = [];
    for (let i = 0; i < selectedList.length; i++){
        var mediaGenres = selectedList[i].genre.split(', ');
        for (let j = 0; j < mediaGenres.length; j++){
            if (!mainListGenres.includes(mediaGenres[j]) && mediaGenres[j] != ''){
                mainListGenres.push(mediaGenres[j]);
            }
        }
    }
}


// --------- Functions to create the lists of media cards ---------
// Function to create media cards for each media in the the dataset
function createMediaCard(cardData) {
    const listItem = document.createElement('li');
    listItem.className = 'media-card';

    // Populate the media card
    listItem.innerHTML = `
        <div class="thumbnail">
        <img src="${cardData.thumbnail}" alt="Thumbnail" />
        </div>
        <div class="card-content">
        <div class="title-and-dots-row">
            <h3 class="title">${cardData.title}</h3>
            <img
            class="three-dots-icon"
            src="images/three-dots.svg"
            alt="Menu"
            />
        </div>
        <div class="type-genre-year">
            <p class="media-details">${cardData.mediaType} &nbsp;|&nbsp; ${cardData.genre} &nbsp;|&nbsp; ${cardData.year} </p>
        </div>
        <p class="media-description">
            ${cardData.description}
        </p>
        </div>
    `;

    return listItem;
}

// Function to facilitate creating media cards and updating item count
function populateMediaCards(selectedList) {
    populateMainListGenres(selectedList);
    const list = document.querySelector('.main-list');
    list.innerHTML = '';
    for (let i = 0; i < selectedList.length; i++){
        const cardData = selectedList[i];
        const mediaCard = createMediaCard(cardData);
        list.appendChild(mediaCard);
    }

    // Update item count
    const itemCount = document.querySelector('.item-count');
    itemCount.textContent = `${selectedList.length} Items`;
}