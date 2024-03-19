/*
    This file contains the functions necessary for populating the lists of media.
*/

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
    listItem.innerHTML = `
        <div class="thumbnail">
            <img src="${cardData.thumbnail}" alt="Thumbnail" />
        </div>
        <div class="card-content">
            <div class="title-and-dots-row">
                <h3 class="title">${cardData.title}</h3>
                <img
                id="three-dots-icon-${cardData.mediaID}"
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
            <p class="where-to-watch" id="where-to-watch-${cardData.mediaID}">Here is where I will put the list of streamers</p>
            <div class="content-options" id="content-options-${cardData.mediaID}">
                <div class="content-option" id="option-1">${option1}</div>
                <hr class="options-line" />
                <div class="content-option" id="option-2">${option2}</div>
                <hr class="options-line" />
                <div class="content-option" id="option-3">${option3}</div>
            </div>
        </div>
    `;

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
    if (from !== searchList){
        removeFromList(from, cardData);
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