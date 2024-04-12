/*
    This file contains the functions necessary for populating the lists of media.
*/

import { auth } from './firebaseConfig.js';
import { populateMainListGenres, populateGenreCheckboxes } from './sidebar.js';
import { showPopup } from './index.js';

// Function to create media cards for each media in the the dataset. A "media card" is the block of information you see about a piece
// of media such as the thumbnail, title, mediaType, description, etc.
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

    // Card content div is everything to the right of the thumbnail
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
        contentOptions.style.opacity = contentOptions.style.opacity === '100' ? '0' : '100';
    });

    // Add the click listener for each content option
    const contentOptions = listItem.querySelectorAll('.content-option');
    contentOptions.forEach(option => {
        option.addEventListener('click', function(event) {
            // Options will be different based on which tab the user is currently in
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
                        removeFromList(watchlist, cardData, 'option-2');
                    }
                    else if (curTab === 'watchedTab'){
                        removeFromList(watchedList, cardData, 'option-2');                       
                    }
                    else if (curTab === 'searchTab'){
                        moveToList(watchedList, searchList, cardData);
                    }
                    break;
                case 'option-3':
                    seeStreamingOptions(cardData);
                    break;
            }
            // Close the content options box after the user selects an option
            const contentOptions = listItem.querySelector('.content-options');
            contentOptions.style.opacity = contentOptions.style.opacity === '100' ? '0' : '100';
        });
    });
    return listItem;
}

// Move a media item to one list from another. Removes it from "from" list unless it's from search results.
function moveToList(to, from, cardData){
    // Move the media to the to list if it's not already in there
    if (!to.some(item => item.mediaID.toString() === cardData.mediaID.toString())){
        to.push(cardData);
    }
    // From watchlist or watched
    if (from !== searchList){
        removeFromList(from, cardData, 'option-1');
        if (auth.currentUser){
            let addTo = '';
            let removeFrom = '';
            let popUpMsg = '';
            if (from === watchlist){
                addTo = 'addToWatched';
                removeFrom = 'removeFromWatchlist';
                popUpMsg = 'Added to watched list successfully';
            }
            else if (from === watchedList){
                addTo = 'addToWatchlist';
                removeFrom = 'removeFromWatched';
                popUpMsg = 'Added to watchlist successfully';
            }
            // Add media to either Watchlist table or Watched table
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
                    showPopup(popUpMsg);
                })
                .catch((error) => {
                    console.error('Error adding to table:', error);
                });
            });
        }
    }
    // From search
    else{
        if (auth.currentUser){
            let addTo = '';
            let popUpMsg = '';
            if (to === watchlist){
                addTo = 'addToWatchlist';
                popUpMsg = 'Added to watchlist successfully';
            } 
            else if (to === watchedList){
                addTo = 'addToWatched';
                popUpMsg = 'Added to watched list successfully';
            } 
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
                showPopup(popUpMsg);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }
}

// Removes the given media item from the list and appropriate database table
function removeFromList(list, cardData, option){
    for (let i = list.length - 1; i >= 0; i--){
        if (list[i].mediaID === cardData.mediaID){
            list.splice(i, 1);
            break;
        }
    }
    populateMediaCards(list);

    // Remove media from either Watchlist table or Watched table
    let removeFrom = '';
    let popUpMsg = '';
    if (list === watchlist){
        removeFrom = 'removeFromWatchlist';
        popUpMsg = 'Removed from watchlist successfully';
    }
    else if (list === watchedList){
        removeFrom = 'removeFromWatched';
        popUpMsg = 'Removed from watched list successfully';
    }
    // Delete the media from either Watchlist table or Watched table
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
            if (option === 'option-2') showPopup(popUpMsg);
        })
        .catch((error) => {
            console.error('Error removing from table:', error);
        });
    });
}

// TMDB API call to get the streaming options from the JustWatch database (attributed). Currently filtered to just U.S. results.
function seeStreamingOptions(cardData){
    // Validate mediaID (should be numbers) and mediaType (should be tv show or movie)
    if (!(/^\d+$/.test(cardData.mediaID.toString())) || (cardData.mediaType.toLowerCase() !== 'tv show' && cardData.mediaType.toLowerCase() !== 'movie')) {
        console.error('Invalid input');
        return;
    }

    // Fetch streaming providers using TMDB API server side
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
            // Streaming options data found (checking by type validation of result)
            if (Array.isArray(data.flatrate)) {
                whereToWatch.textContent = 'Available on: ' + data.flatrate.map(provider => provider.provider_name.trim()).join(', ') + ". (Source: JustWatch)";
            } 
            // If JustWatch (used by TMDB API) doesn't have the data for the media, give the user the option to click a link to search where to watch on Google
            else {
                whereToWatch.innerHTML = 'Data not available. Click <a style="color: white;" target="_blank" href="https://www.google.com/search?q=where+to+watch+' + 
                    encodeURIComponent(cardData.title) + '">HERE</a> to search with Google.';
            }
            whereToWatch.style.display = 'block';
        })
        .catch(error => {
            // If JustWatch (used by TMDB API) doesn't have the data for the media or another error, give the user the option to click a link to search where to watch on Google
            console.error('Error fetching streaming options:', error);
            let whereAndID = 'where-to-watch-' + cardData.mediaID.toString();
            const whereToWatch = document.getElementById(whereAndID);
            whereToWatch.innerHTML = 'Data not available. Click <a style="color: white;" target="_blank" href="https://www.google.com/search?q=where+to+watch+' + 
                    encodeURIComponent(cardData.title) + '">HERE</a> to search with Google.';
            whereToWatch.style.display = 'block';
        });
}


// Function to facilitate creating media cards and updating item count
function populateMediaCards(selectedList) {
    // Populate the available genres to filter based on the current main list
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