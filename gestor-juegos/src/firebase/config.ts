// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJCUT8qCRm-ejwtBNcBGP-hGDG6uUBWWA",
  authDomain: "gestorjuegos.firebaseapp.com",
  projectId: "gestorjuegos",
  storageBucket: "gestorjuegos.firebasestorage.app",
  messagingSenderId: "962700053006",
  appId: "1:962700053006:web:c468f31e43878d20e28a5f",
  measurementId: "G-X20KHCW1J5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
