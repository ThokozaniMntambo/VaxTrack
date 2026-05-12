// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBP_F00dy97numOrcqJAfrRiYc8v_TRpQQ",
  authDomain: "socialcx-16f02.firebaseapp.com",
  projectId: "socialcx-16f02",
  storageBucket: "socialcx-16f02.firebasestorage.app",
  messagingSenderId: "703159704300",
  appId: "1:703159704300:web:8c7d2891811df29acaa3c9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
