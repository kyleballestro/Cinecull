/*
    This file contains the functions necessary for handling the header and signing up/in.
*/
import { auth, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './firebaseConfig.js';
import { populateMediaCards } from './mediaList.js';

var watchlistTab = document.getElementById('watchlist-tab');
var watchedTab = document.getElementById('watched-tab');
var searchBar = document.getElementById('search-bar');
var profileIcon = document.getElementById('profile-icon');
var listTitle = document.getElementById('list-title');
var overlay = document.getElementById('overlay');

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
    this.style.backgroundColor = '#3A3F74';
    mainList = watchlist;
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

        // TMDB API call on the server side and receive it. Parse and populate searchList.
        const searchedTitle = this.value;
        const encodedTitle = encodeURIComponent(searchedTitle);
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
            // Populate the main list using searchList
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


// ------------------------ Signing Up, In, and Out ------------------------

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
    if (email.length < 4 || password.length < 4 || passwordRepeat.length < 4) {
        signUpInfoBad.textContent = 'Please sufficiently fill in all fields';
        signUpInfoBad.style.display = 'block';
        return;
    }
    if (password !== passwordRepeat){
        signUpInfoBad.textContent = 'Passwords do not match';
        signUpInfoBad.style.display = 'block';
        return;
    }
    // Create user with email and pass.
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        var user = userCredential.user;
        console.log("User signed up: ", user);
        signUpClick.style.display = 'none';
        signInClick.style.display = 'none';
        signOutClick.style.display = 'flex';
        signUpModal.style.display = 'none';
        overlay.style.display = 'none';
        signUpEmail.value = '';
        signUpPassword.value = '';
        signUpPasswordRepeat.value = '';
        signUpInfoBad.style.display = 'none';
    })
    .catch(function (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
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
        console.log(error);
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
    if (email.length < 4 || password.length < 4) {
        signInInfoBad.textContent = 'Please sufficiently fill in all fields';
        signInInfoBad.style.display = 'block';
        return;
    }
    // Sign in with email and pass.
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        console.log("User signed in: ", user);
        signUpClick.style.display = 'none';
        signInClick.style.display = 'none';
        signOutClick.style.display = 'flex';
        signInModal.style.display = 'none';
        overlay.style.display = 'none';
        signInEmail.value = '';
        signInPassword.value = '';
        signInInfoBad.textContent = '';
        signInInfoBad.style.display = 'none';
    })    
    .catch(function (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
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
        console.log(error);
    });
});


// Sign Out 
signOutClick.addEventListener('click', function() {
    signOut(auth)
    .then(() => {
        // Sign-out successful.
        console.log('User signed out.');
        signUpClick.style.display = 'flex';
        signInClick.style.display = 'flex';
        signOutClick.style.display = 'none';
    })
    .catch((error) => {
        // An error happened.
        console.log('Error signing out:', error);
    });
});

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

auth.onAuthStateChanged((user) => {
    if (user && !isAlreadyRun) {
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
                console.log('getWatchlist success:', data);
                watchlist = JSON.parse(data);
                if (curTab === 'watchlistTab'){
                    populateMediaCards(watchlist);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
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
                console.log('getWatched success:', data);
                watchedList = JSON.parse(data);
                if (curTab === 'watchedTab'){
                    populateMediaCards(watchedList);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    } 
    else if (!user) {
        // User is signed out.
        console.log("No user signed in");
        isAlreadyRun = false;
        signUpClick.style.display = 'flex';
        signInClick.style.display = 'flex';
        signOutClick.style.display = 'none';
        profileIcon.style.display = 'none';
        watchlist = [];
        watchedList = [];
        watchlistTab.click();
    }
});