// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJCUT8qCRm-ejwtBNcBGP-hGDG6uUBWWA",
  authDomain: "gestorjuegos.firebaseapp.com",
  projectId: "gestorjuegos",
  storageBucket: "gestorjuegos.firebasestorage.app",
  messagingSenderId: "962700053006",
  appId: "1:962700053006:web:c468f31e43878d20e28a5f",
  measurementId: "G-X20KHCW1J5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
