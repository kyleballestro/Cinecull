/*
    This file contains the functions necessary for handling the header and signing up/in.
*/

import { auth, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './firebaseConfig.js';
import { populateMediaCards } from './mediaList.js';

var filterIcon = document.getElementById('filter-icon');
var sidebar = document.getElementById('sidebar');
var watchlistTab = document.getElementById('watchlist-tab');
var watchedTab = document.getElementById('watched-tab');
var searchBar = document.getElementById('search-bar');
var profileIcon = document.getElementById('profile-icon');
var listTitle = document.getElementById('list-title');
var overlay = document.getElementById('overlay');
var popup = document.getElementById('popup');

var signUpModal = document.getElementById('sign-up-modal');
var signUpClick = document.getElementById('sign-up-click');
var signUpCancel = document.getElementById('sign-up-cancel-button');
var signUpButton = document.getElementById('sign-up-button');
var signUpEmail = document.getElementById('sign-up-email');
var signUpPassword = document.getElementById('sign-up-password');
var signUpPasswordRepeat = document.getElementById('sign-up-password-repeat');
var signUpInfoBad = document.getElementById('sign-up-info-bad');

var signInModal = document.getElementById('sign-in-modal');
var signInClick = document.getElementById('sign-in-click');
var signInCancel = document.getElementById('sign-in-cancel-button');
var signInButton = document.getElementById('sign-in-button');
var signInEmail = document.getElementById('sign-in-email');
var signInPassword = document.getElementById('sign-in-password');
var signOutClick = document.getElementById('sign-out-click');
var signInInfoBad = document.getElementById('sign-in-info-bad');


// Switch to watchlist tab
watchlistTab.addEventListener('click', function(event) {
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
    watchedTab.style.boxShadow = 'none';
    this.style.backgroundColor = '#3A3F74';
    this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.19)';
    mainList = watchlist;
});

// Switch to watched tab
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
        watchlistTab.style.boxShadow = 'none';
        this.style.backgroundColor = '#3A3F74';
        this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.19)';
        mainList = watchedList;
    }
});

// Switch to search tab
searchBar.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && this.value != '') {
        // Call TMDB API to get the multi results from searching the user's input
        let searchedTitle = this.value;
        if (searchedTitle.length > 50){
            alert("Input is too long.");
        }
        else{
            searchedTitle = searchedTitle.replace(/[^a-zA-Z0-9 ]/g, '');
            curTab = 'searchTab';
            event.preventDefault();

            // Clear the main list and searched
            const list = document.querySelector('.main-list');
            list.innerHTML = '';
            searchList = [];
            const encodedTitle = encodeURIComponent(searchedTitle);
            fetch(`/searchMedia?title=${encodedTitle}`)
            .then(response => response.json())
            .then(data => {
                for (let i = 0; i < data.results.length; i++){
                    if (data.results[i].media_type !== 'person'){
                        // Creating the media object. Every movie/tv show will fit into this object and it's used to populate the list item details.
                        let media = {
                            mediaID: data.results[i].id,
                            thumbnail: data.results[i].poster_path === null ? 'images/no image available.webp' : 'https://image.tmdb.org/t/p/original' + data.results[i].poster_path, 
                            title: data.results[i].title || data.results[i].name, 
                            mediaType: data.results[i].media_type === 'movie' ? 'Movie' : 'TV Show', 
                            genre: '', 
                            year: (data.results[i].release_date || data.results[i].first_air_date), 
                            description: data.results[i].overview ? data.results[i].overview : 'No description available.'
                        };
                        if (data.results[i].genre_ids !== undefined){
                            for (let j = 0; j < data.results[i].genre_ids.length; j++){
                                var theGenre = media.mediaType === 'Movie' ? movieGenres[data.results[i].genre_ids[j]]: tvGenres[data.results[i].genre_ids[j]];
                                media.genre += j === data.results[i].genre_ids.length - 1 ? theGenre: theGenre + ', ';
                            }
                        }
                        Object.keys(media).forEach(key => {
                            if (media[key] === undefined || media[key] == '') {
                                media[key] = 'N/A';
                            }
                        });
                        if (media.year !== 'N/A'){
                            media.year = media.year.substring(0, 4)
                        }
                        searchList.push(media);   
                    }
                }
                // Populate the main list using the list of media items that were just searched for
                populateMediaCards(searchList);
            })
            .catch(error => console.error('Error fetching TMDB data:', error));

            // Clear the backgrounds of watchlistTab and watchedTab, change list title
            watchedTab.style.background = 'none';
            watchedTab.style.boxShadow = 'none';
            watchlistTab.style.background = 'none';
            watchlistTab.style.boxShadow = 'none';
            listTitle.textContent = 'Searched: ' + this.value;
            mainList = searchList;
        }
    }
});

// Toggle the sidebar visibility
filterIcon.addEventListener('click', function(event) {
    sidebar.style.display = window.getComputedStyle(sidebar).getPropertyValue("display") === 'none' ? 'flex' : 'none';
});

// Show the popup with the message for 3 seconds
function showPopup(message){
    popup.textContent = message;
    popup.style.opacity = '100';
    setTimeout(function() {
        popup.style.opacity = '0';
    }, 3000);
}

export { showPopup };

// ------------------ Signing Up, In, and Out ------------------
// Sign Up
signUpClick.addEventListener('click', function(event) {
    signInModal.style.display = 'none';
    signUpModal.style.display = 'flex';
    overlay.style.display = 'block';
});

signUpCancel.addEventListener('click', function(event) {
    signUpModal.style.display = 'none';
    overlay.style.display = 'none';
    signUpEmail.value = '';
    signUpPassword.value = '';
    signUpPasswordRepeat.value = '';
    signUpInfoBad.style.display = 'none';
});

signUpButton.addEventListener('click', function(event) {
    const email = signUpEmail.value;
    const password = signUpPassword.value;
    const passwordRepeat = signUpPasswordRepeat.value;
    // Email, password, or repeat password too short
    if (email.length < 4 || password.length < 4 || passwordRepeat.length < 4) {
        signUpInfoBad.textContent = 'Please sufficiently fill in all fields';
        signUpInfoBad.style.display = 'block';
        return;
    }
    // Password and repeat password don't match
    if (password !== passwordRepeat){
        signUpInfoBad.textContent = 'Passwords do not match';
        signUpInfoBad.style.display = 'block';
        return;
    }
    // Create user with email and pass using Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        signUpClick.style.display = 'none';
        signInClick.style.display = 'none';
        signOutClick.style.display = 'flex';
        signUpModal.style.display = 'none';
        overlay.style.display = 'none';
        signUpEmail.value = '';
        signUpPassword.value = '';
        signUpPasswordRepeat.value = '';
        signUpInfoBad.style.display = 'none';
        showPopup('Signed up successfully');
    })
    .catch(function (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        // Display relevant error messages if sign up was not successful
        if (errorCode == 'auth/weak-password'){
            signUpInfoBad.textContent = 'Password is too weak';
            signUpInfoBad.style.display = 'block';
            return;
        } 
        else if (errorCode == 'auth/email-already-in-use'){
            signUpInfoBad.textContent = 'Email is already in use';
            signUpInfoBad.style.display = 'block';
            return;
        }
        else {
            alert(errorMessage);
        }
        console.log("Error creating user:", error);
    });
});


// Sign In
signInClick.addEventListener('click', function(event) {
    signUpModal.style.display = 'none';
    signInModal.style.display = 'flex';
    overlay.style.display = 'block';
});

signInCancel.addEventListener('click', function(event) {
    signInModal.style.display = 'none';
    overlay.style.display = 'none';
    signInEmail.value = '';
    signInPassword.value = '';
    signInInfoBad.textContent = '';
    signInInfoBad.style.display = 'none';
});

signInButton.addEventListener('click', function(event) {
    const email = signInEmail.value;
    const password = signInPassword.value;
    // Email or password was too short
    if (email.length < 4 || password.length < 4) {
        signInInfoBad.textContent = 'Please sufficiently fill in all fields';
        signInInfoBad.style.display = 'block';
        return;
    }
    // Sign in with email and pass using Firebase authentication
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in
        signUpClick.style.display = 'none';
        signInClick.style.display = 'none';
        signOutClick.style.display = 'flex';
        signInModal.style.display = 'none';
        overlay.style.display = 'none';
        signInEmail.value = '';
        signInPassword.value = '';
        signInInfoBad.textContent = '';
        signInInfoBad.style.display = 'none';
        showPopup('Signed in successfully');
    })    
    .catch(function (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        // Display relevant error messages if sign in was not successful
        if (errorCode === 'auth/wrong-password'){
            signInInfoBad.textContent = 'Wrong password';
            signInInfoBad.style.display = 'block';
            return;
        } 
        else if (errorCode === 'auth/invalid-login-credentials'){
            signInInfoBad.textContent = 'Invalid credentials';
            signInInfoBad.style.display = 'block';
            return;
        }
        else if (errorCode === 'auth/invalid-email'){
            signInInfoBad.textContent = 'Invalid email format';
            signInInfoBad.style.display = 'block';
            return;
        }
        else {
            alert(errorMessage);
        }
        console.log("Error signing in:", error);
    });
});


// Sign Out 
signOutClick.addEventListener('click', function() {
    signOut(auth)
    .then(() => {
        // Sign-out successful
        signUpClick.style.display = 'flex';
        signInClick.style.display = 'flex';
        signOutClick.style.display = 'none';
        showPopup('Signed out successfully');
    })
    .catch((error) => {
        console.log('Error signing out:', error);
        alert(error);
    });
});

// When a modal pops up, there is an overlay behind it that closes the modal if clicked
overlay.addEventListener('click', function(event) {
    signUpModal.style.display = 'none';
    signInModal.style.display = 'none';
    overlay.style.display = 'none';
    signUpEmail.value = '';
    signUpPassword.value = '';
    signInEmail.value = '';
    signInPassword.value = '';
    signUpPasswordRepeat.value = '';
    signUpInfoBad.style.display = 'none';
    signInInfoBad.textContent = '';
    signInInfoBad.style.display = 'none';
});

// Firebase Authentication listener that detects if a user is logged in or not. Fires upon startup and if the user signs in/out/up.
auth.onAuthStateChanged((user) => {
    if (user && !isAlreadyRun) { // isAlreadyRun is to stop it from firing twice upon startup
        // User is signed in.
        isAlreadyRun = true;
        signUpClick.style.display = 'none';
        signInClick.style.display = 'none';
        signOutClick.style.display = 'flex';
        profileIcon.textContent = user.email.toString().substring(0, 2).toUpperCase();
        profileIcon.style.display = 'flex';
        // Populate the watchlist from database
        auth.currentUser.getIdToken(true).then(idToken => {
            fetch('/getWatchlist', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + idToken 
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.text();
            })
            .then(data => {
                watchlist = JSON.parse(data);
                if (curTab === 'watchlistTab'){
                    populateMediaCards(watchlist);
                    mainList = watchlist;
                }
            })
            .catch((error) => {
                console.error('Error fetching Watchlist:', error);
            });
        });
        // Populate the watched list from database
        auth.currentUser.getIdToken(true).then(idToken => {
            fetch('/getWatched', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + idToken 
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.text();
            })
            .then(data => {
                watchedList = JSON.parse(data);
                if (curTab === 'watchedTab'){
                    populateMediaCards(watchedList);
                    mainList = watchedList;
                }
            })
            .catch((error) => {
                console.error('Error fetching Watched list:', error);
            });
        });
    } 
    else if (!user) {
        // User is signed out.
        isAlreadyRun = false;
        signUpClick.style.display = 'flex';
        signInClick.style.display = 'flex';
        signOutClick.style.display = 'none';
        profileIcon.style.display = 'none';
        // Reset the lists and send the user back to watchlist tab
        watchlist = [];
        watchedList = [];
        watchlistTab.click();
    }
});