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
                    
                    break;
                case 'option-2':
                    
                    break;
                case 'option-3':
                    
                    break;
            }
        });
    });

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