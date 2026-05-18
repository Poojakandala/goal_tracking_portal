import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAInlfsuVKEV83_mKmgHPlAFHAjN9x8j6E",
  authDomain: "goaltrackingportal.firebaseapp.com",
  projectId: "goaltrackingportal",
  storageBucket: "goaltrackingportal.firebasestorage.app",
  messagingSenderId: "804611744859",
  appId: "1:804611744859:web:93a29749f7a9af7aeecb7e",
  measurementId: "G-CEL0TM84YQ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
