// import the functions you need from the sdks you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// your web app's firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBE26xHOPxzJAOw_p4sfvUbTaBnsoBCDPM",
    authDomain: "dyslexia-lens.firebaseapp.com",
    projectId: "dyslexia-lens",
    storageBucket: "dyslexia-lens.firebasestorage.app",
    messagingSenderId: "910087340117",
    appId: "1:910087340117:web:48f397330c5a67565514dc",
    measurementId: "G-78K56BQ1T5"
};

// initialize firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
