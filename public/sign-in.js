// import { initializeApp } from 'firebase/app';
// import {
//   connectAuthEmulator,
//   createUserWithEmailAndPassword,
//   getAuth,
//   onAuthStateChanged,
//   sendEmailVerification,
//   sendPasswordResetEmail,
//   signInWithEmailAndPassword,
//   signOut,
// } from 'firebase/auth';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyBdJKGFKN1-tc0dYEVWnpSFB_spLzTQkRs",
    authDomain: "cinecull-e7ab6.firebaseapp.com",
    projectId: "cinecull-e7ab6",
    storageBucket: "cinecull-e7ab6.appspot.com",
    messagingSenderId: "362241236949",
    appId: "1:362241236949:web:2244cf6fcd8cad797a275c"
};

initializeApp(firebaseConfig);

const auth = getAuth();

// if (window.location.hostname === 'localhost') {
//   connectAuthEmulator(auth, 'http://localhost:3000');
// }

const signUpEmail = document.getElementById('sign-up-email');
const signUpPassword = document.getElementById('sign-up-password');
const signUpButton = document.getElementById('sign-up-button');
const signInEmail = document.getElementById('sign-in-email');
const signInPassword = document.getElementById('sign-in-password');
const signInButton = document.getElementById('sign-in-button');

/**
 * Handles the sign in button press.
 */
function handleSignIn() {
  // if (auth.currentUser) {
  //   signOut(auth);
  // } 
  // else {
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
      window.location.href = 'index.html';
    })    
  .catch(function (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    if (errorCode === 'auth/wrong-password') {
      alert('Wrong password.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
  //   signInBtn.disabled = false;
  });
  // }
//   signInBtn.disabled = true;
}

/**
 * Handles the sign up button press.
 */
function handleSignUp() {
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
    var user = userCredential.user;
    console.log("User signed up: ", user);
    window.location.href = 'index.html';
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
}


// function sendPasswordReset() {
//   const email = emailInput.value;
//   sendPasswordResetEmail(auth, email)
//     .then(function () {
//       // Password Reset Email Sent!
//       alert('Password Reset Email Sent!');
//     })
//     .catch(function (error) {
//       // Handle Errors here.
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       if (errorCode == 'auth/invalid-email') {
//         alert(errorMessage);
//       } else if (errorCode == 'auth/user-not-found') {
//         alert(errorMessage);
//       }
//       console.log(error);
//     });
// }


// Listening for auth state changes.
// onAuthStateChanged(auth, function (user) {
//   verifyEmailButton.disabled = true;
//   if (user) {
//     // User is signed in.
//     const displayName = user.displayName;
//     const email = user.email;
//     const emailVerified = user.emailVerified;
//     const photoURL = user.photoURL;
//     const isAnonymous = user.isAnonymous;
//     const uid = user.uid;
//     const providerData = user.providerData;
//     signInStatus.textContent = 'Signed in';
//     signInButton.textContent = 'Sign out';
//     accountDetails.textContent = JSON.stringify(user, null, '  ');
//     if (!emailVerified) {
//       verifyEmailButton.disabled = false;
//     }
//   } 
//   else {
//     // User is signed out.
//     signInStatus.textContent = 'Signed out';
//     signInButton.textContent = 'Sign in';
//     accountDetails.textContent = 'null';
//   }
//   signInButton.disabled = false;
// });

signInButton.addEventListener('click', handleSignIn, false);
signUpButton.addEventListener('click', handleSignUp, false);
// verifyEmailButton.addEventListener('click', sendVerificationEmailToUser, false);
// passwordResetButton.addEventListener('click', sendPasswordReset, false);
  