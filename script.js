// Object to hold details of each media (will later be populated by TMDB API calls)
const mediaCardsData = [
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
  
// Function to create media cards for each media in the the dataset
function createMediaCard(cardData) {
    const listItem = document.createElement('li');
    listItem.className = 'media-card';

    console.log(cardData.title);

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
function populateMediaCards() {
    const list = document.querySelector('.main-list');
    mediaCardsData.forEach(cardData => {
        const mediaCard = createMediaCard(cardData);
        list.appendChild(mediaCard);
    });

    // Update item count
    const itemCount = document.querySelector('.item-count');
    itemCount.textContent = `${mediaCardsData.length} Items`;
}

// Initialize list
populateMediaCards();