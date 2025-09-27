// src/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvlzRSj3vDZ_WWZ7jKyVlM9_y-7lB5S-0",
  authDomain: "hicet-student-image.firebaseapp.com",
  projectId: "hicet-student-image",
  storageBucket: "hicet-student-image.firebasestorage.app",
  messagingSenderId: "237010220394",
  appId: "1:237010220394:web:b24207184a38c26de56113"
};

// initialize once
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
