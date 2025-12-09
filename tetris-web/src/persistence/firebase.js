// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8Ws1Rjy2YFIu5Z1k0Y3gDc_1-ueqSAWk",
  authDomain: "tetris-83844.firebaseapp.com",
  projectId: "tetris-83844",
  storageBucket: "tetris-83844.firebasestorage.app",
  messagingSenderId: "735091780830",
  appId: "1:735091780830:web:52418892c58ff9a0d1a64f",
  measurementId: "G-8KKGW3LS1R"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Get Realtime Database instance
export const db = getDatabase(
    app,
    "https://tetris-83844-default-rtdb.europe-west1.firebasedatabase.app"
);

// Get Analytics
export const analytics = getAnalytics(app);
