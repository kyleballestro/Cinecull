var watchlistTab = document.getElementById('watchlist-tab');
var watchedTab = document.getElementById('watched-tab');
var searchBar = document.getElementById('search-bar');
var listTitle = document.getElementById('list-title');
var applyFilter = document.getElementById('apply-filter');
var resetFilter = document.getElementById('reset-filter');
var plusMinus = document.getElementById('plus-minus');
var genreCheckboxes = document.getElementById('genre-checkboxes');
var genreText = document.getElementById('genre-text');
var curTab = 'watchlistTab';
var fromApplyFilter = false;

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
        description: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard, a former LAPD blade runner who has been missing for 30 years."
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
    genreCheckboxes.style.display = 'none';
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
    fromApplyFilter = true;
    var checkedTypes = [];
    // Check which of the filters are checked
    var moviesIsChecked = document.getElementById('moviesCheckbox').checked;
    var tvIsChecked = document.getElementById('tvShowsCheckbox').checked;
    // If neither is checked, set them to true so that it searches for both tv and movies
    if (!moviesIsChecked && !tvIsChecked) {
        checkedTypes.push('Movie', 'TV Show');
    } 
    else {
        if (moviesIsChecked) checkedTypes.push('Movie');
        if (tvIsChecked) checkedTypes.push('TV Show');
    }

    // Get the checked genres
    var checkedGenres = [];
    const checkboxes = document.querySelectorAll('#genre-checkboxes .checkbox');

    // Loop through each checkbox div
    checkboxes.forEach(checkbox => {
        const input = checkbox.querySelector('input[type="checkbox"]');

        // If the checkbox is checked, get the label's text
        if (input.checked) {
            const label = checkbox.querySelector('label');
            checkedGenres.push(label.textContent.substring(1, label.textContent.length));
        }
    });


    // New filtering with genres
    filteredList = [];
    for (let i = 0; i < mainList.length; i++){
        var curGenres = mainList[i].genre.split(', ');
        var curType = mainList[i].mediaType;
        if ((checkedGenres.length === 0 || checkedGenres.some(genre => curGenres.includes(genre))) && checkedTypes.includes(curType)){
            filteredList.push(mainList[i]);
        }
    }
    // Populate the list with filteredList
    populateMediaCards(filteredList);
});

// Reset Filter
resetFilter.addEventListener('click', function(event) {
    // Uncheck all the filters
    document.getElementById('moviesCheckbox').checked = false;
    document.getElementById('tvShowsCheckbox').checked = false;
    
    // Uncheck any of the checked genres
    const checkboxes = document.querySelectorAll('#genre-checkboxes .checkbox');

    // Loop through each checkbox div
    checkboxes.forEach(checkbox => {
        const input = checkbox.querySelector('input[type="checkbox"]');

        // If the checkbox is checked, get the label's text
        if (input.checked) {
            input.checked = false;
        }
    });

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

function populateGenreCheckboxes(){
    genreCheckboxes.innerHTML = '';
    for (let i = 0; i < mainListGenres.length; i++){
        var theGenre = mainListGenres[i];

        // Create the container that holds the checkbox and the label
        const genreCheckbox = document.createElement("div");
        genreCheckbox.className = 'checkbox genre';
        
        // Create the checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = theGenre;
        checkbox.name = theGenre;
        checkbox.className = 'actual-checkbox';
        
        // Create a label and associate it with the checkbox
        const label = document.createElement("label");
        label.htmlFor = theGenre;
        label.textContent = ' ' + theGenre;
        label.className = 'checkbox-label';
        // label.appendChild(document.createTextNode(theGenre));
        
        // Append the checkbox and label to the list item
        genreCheckbox.appendChild(checkbox);
        genreCheckbox.appendChild(label);
        
        // Append the list item to the unordered list
        genreCheckboxes.appendChild(genreCheckbox);
    }
}

genreText.addEventListener('click', function(event) {
    displayGenreList();
});

plusMinus.addEventListener('click', function(event) {
    displayGenreList();
});

function displayGenreList(){
    if (plusMinus.src.includes('images/plus.svg')) {
        plusMinus.src = 'images/minus.svg';
        genreCheckboxes.style.display = 'block';
    } 
    else {
        plusMinus.src = 'images/plus.svg';
        genreCheckboxes.style.display = 'none';
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
    if (fromApplyFilter === false){
        populateGenreCheckboxes();
    }
    fromApplyFilter = false;
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