import { initializeApp } from 'firebase/app';

// Import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDYhDvRfhjhin1B2RIMnwXn_IzujHQ7L3E",
    authDomain: "inspired-68d68.firebaseapp.com",
    projectId: "inspired-68d68",
    storageBucket: "inspired-68d68.firebasestorage.app",
    messagingSenderId: "240096510082",
    appId: "1:240096510082:web:ac2d4e6f00d007969a349b",
    measurementId: "G-943R6JZPH5"
};

const app = initializeApp(firebaseConfig);
// Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
