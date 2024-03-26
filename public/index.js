/*
    This file contains the functions necessary for handling the header and signing up/in.
*/
// import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { auth } from './firebaseConfig.js';
import { populateMediaCards } from './mediaList.js';

var watchlistTab = document.getElementById('watchlist-tab');
var watchedTab = document.getElementById('watched-tab');
var searchBar = document.getElementById('search-bar');
var listTitle = document.getElementById('list-title');
var overlay = document.getElementById('overlay');

var signUpModal = document.getElementById('sign-up-modal');
var signUpClick = document.getElementById('sign-up-click');
var signUpCancel = document.getElementById('sign-up-cancel-button');
var signUpButton = document.getElementById('sign-up-button');
var signUpEmail = document.getElementById('sign-up-email');
var signUpPassword = document.getElementById('sign-up-password');

var signInModal = document.getElementById('sign-in-modal');
var signInClick = document.getElementById('sign-in-click');
var signInCancel = document.getElementById('sign-in-cancel-button');
var signInButton = document.getElementById('sign-in-button');
var signInEmail = document.getElementById('sign-in-email');
var signInPassword = document.getElementById('sign-in-password');
var signOutClick = document.getElementById('sign-out-click');

// // Firebase
// const firebaseConfig = {
//     apiKey: "AIzaSyBdJKGFKN1-tc0dYEVWnpSFB_spLzTQkRs",
//     authDomain: "cinecull-e7ab6.firebaseapp.com",
//     projectId: "cinecull-e7ab6",
//     storageBucket: "cinecull-e7ab6.appspot.com",
//     messagingSenderId: "362241236949",
//     appId: "1:362241236949:web:2244cf6fcd8cad797a275c"
// };

// initializeApp(firebaseConfig);

// const auth = getAuth();


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
});

signUpButton.addEventListener('click', function(event) {
    const email = signUpEmail.value;
    const password = signUpPassword.value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }
    // Create user with email and pass.
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        console.log("User signed up: ", user);
        var user = userCredential.user;
        signUpClick.style.display = 'none';
        signInClick.style.display = 'none';
        signOutClick.style.display = 'flex';
        signUpModal.style.display = 'none';
        overlay.style.display = 'none';
        signUpEmail.value = '';
        signUpPassword.value = '';
    })
    .catch(function (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
        } else {
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
});

signInButton.addEventListener('click', function(event) {
    const email = signInEmail.value;
    const password = signInPassword.value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
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
    })    
    .catch(function (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
        } 
        else {
            alert(errorMessage);
        }
        console.log(error);
    });
});


// Sign Out 
signOutClick.addEventListener('click', function() {
    signOut
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
});

auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in.
        console.log("User is signed in: " + user.uid);
        signUpClick.style.display = 'none';
        signInClick.style.display = 'none';
        signOutClick.style.display = 'flex';
    } 
    else {
        // User is signed out.
        if (user === null){
            console.log('user is null');
        }
        signUpClick.style.display = 'flex';
        signInClick.style.display = 'flex';
        signOutClick.style.display = 'none';
    }
});