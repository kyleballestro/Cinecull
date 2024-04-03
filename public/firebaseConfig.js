import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBdJKGFKN1-tc0dYEVWnpSFB_spLzTQkRs",
    authDomain: "cinecull-e7ab6.firebaseapp.com",
    projectId: "cinecull-e7ab6",
    storageBucket: "cinecull-e7ab6.appspot.com",
    messagingSenderId: "362241236949",
    appId: "1:362241236949:web:2244cf6fcd8cad797a275c"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();

export { auth, app, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword };