/*
    This file contains the functions necessary for handling the header mostly. That includes switching between tabs and searching.
*/

var watchlistTab = document.getElementById('watchlist-tab');
var watchedTab = document.getElementById('watched-tab');
var searchBar = document.getElementById('search-bar');
var listTitle = document.getElementById('list-title');


// Load up the watchlist first
window.onload = function(){
    populateMediaCards(watchlist);
    mainList = watchlist;
    document.getElementById('genre-checkboxes').style.display = 'none';
}

// Switch to watchlist tab
watchlistTab.addEventListener('click', function(event) {
    if (curTab != 'watchlistTab'){
        curTab = 'watchlistTab';
        // Clear the main list
        const list = document.querySelector('.main-list');
        list.innerHTML = '';

        // Populate it with the items in watchlist
        populateMediaCards(watchlist);

        // Clear the search bar, change list title
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
        curTab = 'watchedTab';
        // Clear the main list
        const list = document.querySelector('.main-list');
        list.innerHTML = '';

        // Populate it with the items in watched
        populateMediaCards(watchedList);

        // Clear the search bar, change list title
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
        curTab = 'searchTab';
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
                        mediaID: data.results[i].id,
                        thumbnail: data.results[i].poster_path === null ? 'images/no image available.webp' : 'https://image.tmdb.org/t/p/original' + data.results[i].poster_path, 
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
                    Object.keys(media).forEach(key => {
                        if (media[key] === undefined) {
                            media[key] = 'N/A';
                        }
                    });
                    if (media.year !== 'N/A'){
                        media.year = media.year.substring(0, 4)
                    }
                    searchList.push(media);   
                }
            }
            // Populate mainList using searchList
            populateMediaCards(searchList);
        })
        .catch(error => console.error('Error fetching data:', error));

        // Clear the backgrounds of watchlistTab and watchedTab, change list title
        watchedTab.style.background = 'none';
        watchlistTab.style.background = 'none';
        listTitle.textContent = 'Searched: ' + this.value;
        mainList = searchList;
    }
});