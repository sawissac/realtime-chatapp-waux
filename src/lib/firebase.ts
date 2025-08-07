// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB9kPF-vsCHiK3mfk4Kd8TvvQWRVWsvdOo",
  authDomain: "realtime-chatapp-waux.firebaseapp.com",
  databaseURL: "https://realtime-chatapp-waux-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "realtime-chatapp-waux",
  storageBucket: "realtime-chatapp-waux.firebasestorage.app",
  messagingSenderId: "312988897492",
  appId: "1:312988897492:web:f682b730e87a18c4c9eb41",
  measurementId: "G-JV15710R2T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const database = getDatabase(app);