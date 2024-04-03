/*
    This file contains the functions necessary for populating the lists of media.
*/
import { auth } from './firebaseConfig.js';
import { populateMainListGenres, populateGenreCheckboxes } from './sidebar.js';

// Function to create media cards for each media in the the dataset
function createMediaCard(cardData) {
    const listItem = document.createElement('li');
    listItem.className = 'media-card';
    var option1 = 'Move To Watched';
    var option2 = 'Remove From List';
    var option3 = 'Where To Watch';
    if (curTab === 'watchedTab'){
        option1 = 'Move To Watchlist';
    }
    else if (curTab === 'searchTab'){
        option1 = 'Add To Watchlist';
        option2 = 'Add To Watched';
    }

    // Populate the media card
    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.className = 'thumbnail';
    const img = document.createElement('img');
    img.src = cardData.thumbnail;
    img.alt = 'Thumbnail';
    thumbnailDiv.appendChild(img);

    const cardContentDiv = document.createElement('div');
    cardContentDiv.className = 'card-content';

    const titleAndDotsRowDiv = document.createElement('div');
    titleAndDotsRowDiv.className = 'title-and-dots-row';
    const titleH3 = document.createElement('h3');
    titleH3.className = 'title';
    titleH3.textContent = cardData.title;
    const dotsImg = document.createElement('img');
    dotsImg.id = `three-dots-icon-${cardData.mediaID}`;
    dotsImg.className = 'three-dots-icon';
    dotsImg.src = 'images/three-dots.svg';
    dotsImg.alt = 'Menu';
    titleAndDotsRowDiv.appendChild(titleH3);
    titleAndDotsRowDiv.appendChild(dotsImg);

    const typeGenreYearP = document.createElement('p');
    typeGenreYearP.className = 'type-genre-year';
    typeGenreYearP.innerHTML = `${cardData.mediaType} &nbsp;|&nbsp; ${cardData.genre} &nbsp;|&nbsp; ${cardData.year}`;

    const descriptionP = document.createElement('p');
    descriptionP.className = 'media-description';
    descriptionP.textContent = cardData.description;

    const whereToWatchP = document.createElement('p');
    whereToWatchP.className = 'where-to-watch';
    whereToWatchP.id = `where-to-watch-${cardData.mediaID}`;
    whereToWatchP.textContent = 'N/A';

    const contentOptionsDiv = document.createElement('div');
    contentOptionsDiv.className = 'content-options';
    contentOptionsDiv.id = `content-options-${cardData.mediaID}`;

    const contentOption1Div = document.createElement('div');
    contentOption1Div.className = 'content-option';
    contentOption1Div.id = 'option-1';
    contentOption1Div.textContent = option1;

    const optionsLine1Hr = document.createElement('hr');
    optionsLine1Hr.className = 'options-line';

    const contentOption2Div = document.createElement('div');
    contentOption2Div.className = 'content-option';
    contentOption2Div.id = 'option-2';
    contentOption2Div.textContent = option2;

    const optionsLine2Hr = document.createElement('hr');
    optionsLine2Hr.className = 'options-line';

    const contentOption3Div = document.createElement('div');
    contentOption3Div.className = 'content-option';
    contentOption3Div.id = 'option-3';
    contentOption3Div.textContent = option3;

    contentOptionsDiv.appendChild(contentOption1Div);
    contentOptionsDiv.appendChild(optionsLine1Hr);
    contentOptionsDiv.appendChild(contentOption2Div);
    contentOptionsDiv.appendChild(optionsLine2Hr);
    contentOptionsDiv.appendChild(contentOption3Div);

    cardContentDiv.appendChild(titleAndDotsRowDiv);
    cardContentDiv.appendChild(typeGenreYearP);
    cardContentDiv.appendChild(descriptionP);
    cardContentDiv.appendChild(whereToWatchP);
    cardContentDiv.appendChild(contentOptionsDiv);

    listItem.appendChild(thumbnailDiv);
    listItem.appendChild(cardContentDiv);

    // Add the click listener for the three dots icon
    const dotsIcon = listItem.querySelector('.three-dots-icon');
    dotsIcon.addEventListener('click', function(event) {
        const contentOptions = listItem.querySelector('.content-options');
        contentOptions.style.display = contentOptions.style.display === 'flex' ? 'none' : 'flex';
    });

    // Add the click listeners for the content-option divs
    const contentOptions = listItem.querySelectorAll('.content-option');
    contentOptions.forEach(option => {
        option.addEventListener('click', function(event) {
            switch (option.id) {
                case 'option-1':
                    var to = [];
                    var from = [];
                    if (curTab === 'watchlistTab'){
                        to = watchedList;
                        from = watchlist;
                    }
                    else if (curTab === 'watchedTab'){
                        to = watchlist;
                        from = watchedList;
                    }
                    else if (curTab === 'searchTab'){
                        to = watchlist;
                        from = searchList;
                    }
                    moveToList(to, from, cardData);
                    break;
                case 'option-2':
                    if (curTab === 'watchlistTab'){
                        removeFromList(watchlist, cardData);
                    }
                    else if (curTab === 'watchedTab'){
                        removeFromList(watchedList, cardData);                       
                    }
                    else if (curTab === 'searchTab'){
                        moveToList(watchedList, searchList, cardData);
                    }
                    break;
                case 'option-3':
                    seeStreamingOptions(cardData);
                    break;
            }
            const contentOptions = listItem.querySelector('.content-options');
            contentOptions.style.display = contentOptions.style.display === 'flex' ? 'none' : 'flex';
        });
    });

    return listItem;
}

// Move a media item to one list from another. Removes it from "from" list unless it's from search results.
function moveToList(to, from, cardData){
    if (!to.some(item => item.mediaID.toString() === cardData.mediaID.toString())){
        to.push(cardData);
    }
    // From watchlist or watched
    if (from !== searchList){
        removeFromList(from, cardData);
        if (auth.currentUser){
            var addTo = '';
            var removeFrom = '';
            if (from === watchlist){
                addTo = 'addToWatched';
                removeFrom = 'removeFromWatchlist';
            }
            else if (from === watchedList){
                addTo = 'addToWatchlist';
                removeFrom = 'removeFromWatched';
            }
            // Add media to either Watchlist table or Watched table
            console.log(addTo + " in mediaList.js");
            auth.currentUser.getIdToken(true).then(idToken => {
                fetch('/' + addTo, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + idToken 
                    },
                    body: JSON.stringify(cardData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok.');
                    }
                    return response.text();
                })
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
            // Remove media from either Watchlist table or Watched table
            auth.currentUser.getIdToken(true).then(idToken => {
                fetch('/' + removeFrom, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + idToken 
                    },
                    body: JSON.stringify(cardData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok.');
                    }
                    return response.text();
                })
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
        }
    }
    // From search
    else{
        if (auth.currentUser){
            var addTo = '';
            if (to === watchlist) addTo = 'addToWatchlist';
            else if (to === watchedList) addTo = 'addToWatched';
            // Add media to Media table
            auth.currentUser.getIdToken(true).then(function(idToken) {
                return fetch('/addToMedia', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + idToken
                    },
                    body: JSON.stringify(cardData)
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add to Media table');
                }
                return response.text();
            })
            .then(data => {
                console.log('(mediaList.js) Success in adding to media table:', data);
                return auth.currentUser.getIdToken(true);
            })
            // Add media to either Watchlist table or Watched table
            .then(idToken => {
                return fetch('/' + addTo, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + idToken
                    },
                    body: JSON.stringify(cardData)
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to add to ${addTo}`);
                }
                return response.text();
            })
            .then(data => {
                console.log(`(mediaList.js) Success in ${addTo}:`, data);
            })
            .catch((error) => {
                console.error('(mediaList.js) Error:', error);
            });
        }
    }
}

// Removes the given media item from the list
function removeFromList(list, cardData){
    for (let i = list.length - 1; i >= 0; i--){
        if (list[i].mediaID === cardData.mediaID){
            list.splice(i, 1);
            break;
        }
    }
    populateMediaCards(list);
}

// TMDB API call to get the streaming options from the JustWatch database (attributed). Currently filtered to just U.S. results.
function seeStreamingOptions(cardData){
    fetch(`/streamingOptions?id=${cardData.mediaID.toString().toLowerCase()}&type=${cardData.mediaType.toString().toLowerCase()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let whereAndID = 'where-to-watch-' + cardData.mediaID.toString();
            const whereToWatch = document.getElementById(whereAndID);
            if (Array.isArray(data.flatrate)) {
                whereToWatch.textContent = 'Available on: ' + data.flatrate.map(provider => provider.provider_name.trim()).join(', ') + ". (Source: JustWatch)";
            } 
            else {
                whereToWatch.innerHTML = 'Data not available. Click <a style="color: white;" target="_blank" href="https://www.google.com/search?q=where+to+watch+' + 
                    encodeURIComponent(cardData.title) + '">HERE</a> to search with Google.';
            }
            whereToWatch.style.display = 'block';
        })
        .catch(error => console.error('Error fetching data:', error));
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

export { populateMediaCards };