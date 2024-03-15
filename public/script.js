var watchlistTab = document.getElementById('watchlist-tab');
var watchedTab = document.getElementById('watched-tab');
var searchBar = document.getElementById('search-bar');
var listTitle = document.getElementById('list-title');
var curTab = 'watchlistTab';

// Object to hold details of each media (will later be populated by TMDB API calls)
var watchlist = [
    {
      thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
      title: "Breaking Bad",
      mediaType: "TV Show (5 seasons)",
      genre: "Crime, Drama, Thriller",
      year: "2008",
      description: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future."
    },
    {
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        title: "Blade Runner 2049",
        mediaType: "Movie (2h 39m)",
        genre: "Sci-Fi, Mystery",
        year: "2017",
        description: "Some robot guy thinks he's special and he's the first born robot or something but he's really not."
      }
    ];

var watched = [
    {
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/pCGyPVrI9Fzw6rE1Pvi4BIXF6ET.jpg",
        title: "Ozark",
        mediaType: "TV Show (4 Seasons)",
        genre: "Crime, Drama, Thriller",
        year: "22017",
        description: "A financial advisor drags his family from Chicago to the Missouri Ozarks, where he must launder money to appease a drug boss."
    },
    {
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg",
        title: "No Country For Old Men",
        mediaType: "Movie (2h 2m)",
        genre: "Sci-Fi, Mystery",
        year: "2002",
        description: "Violence and mayhem ensue after a hunter stumbles upon the aftermath of a drug deal gone wrong and over two million dollars in cash near the Rio Grande."
    },
    {
        thumbnail: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        title: "Interstellar",
        mediaType: "Movie (2h 49m)",
        genre: "Sci-Fi, Adventure, Drama",
        year: "2014",
        description: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.'
    }
    ];

// var watchlist = [];
// var watched = [];
var searchList = [];

// Load up the watchlist first
window.onload = function(){
    populateMediaCards(watchlist);
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
    }
  });

// Switch to watchlist tab
watchedTab.addEventListener('click', function(event) {
    if (curTab != 'watchedTab'){
        // Clear the main list
        const list = document.querySelector('.main-list');
        list.innerHTML = '';

        // Populate it with the items in watched
        populateMediaCards(watched);

        // Change the current tab, clear the search bar, change list title
        curTab = 'watchedTab';
        searchBar.value = '';
        listTitle.textContent = 'Watched';

        // Clear the watchlist tab background and set the watched tab background
        watchlistTab.style.background = 'none';
        this.style.backgroundColor = '#3A3F74';
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
                let media = {
                    thumbnail: data.results[i].poster_path, 
                    title: data.results[i].title || data.results[i].name, 
                    mediaType: '', 
                    genre: '', 
                    year: data.results[i].release_date || data.results[i].first_air_date, 
                    description: data.results[i].overview
                };
                if (media.thumbnail === null){
                    media.thumbnail = 'images/no image available.webp';
                }
                else{
                    media.thumbnail = 'https://image.tmdb.org/t/p/w500' + media.thumbnail;
                }
                media.year = media.year.substring(0, 4);
                searchList.push(media);
            }
            // Populate mainList using searchList
            populateMediaCards(searchList);
        })
        .catch(error => console.error('Error fetching data:', error));

        // Change the current tab, clear the backgrounds of watchlistTab and watchedTab, change list title
        curTab = 'search';
        watchedTab.style.background = 'none';
        watchlistTab.style.background = 'none';
        listTitle.textContent = 'Searched: ' + this.value;
    }
});


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
    const list = document.querySelector('.main-list');
    for (let i = 0; i < selectedList.length; i++){
        const cardData = selectedList[i];
        const mediaCard = createMediaCard(cardData);
        list.appendChild(mediaCard);
    }

    // Update item count
    const itemCount = document.querySelector('.item-count');
    itemCount.textContent = `${selectedList.length} Items`;
}