/*
    This file contains the functions necessary for populating the sidebar. This includes the genres and the filtering system.
*/

var applyFilter = document.getElementById('apply-filter');
var resetFilter = document.getElementById('reset-filter');
var plusMinus = document.getElementById('plus-minus');
var genreCheckboxes = document.getElementById('genre-checkboxes');
var genreText = document.getElementById('genre-text');

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

    // Filtering with genres
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

// Function to populate the list of genres that the user can filter with checkboxes
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

// Function to show/hide the genre list depending on the user's clicking of the word "Genre"/the plus/minus icon
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