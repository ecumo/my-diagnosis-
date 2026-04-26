import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-5WQfkWm9ap1iOUIyDWAhB6jdduhMBeY",
  authDomain: "my-attachment-type.firebaseapp.com",
  projectId: "my-attachment-type",
  storageBucket: "my-attachment-type.firebasestorage.app",
  messagingSenderId: "513195883308",
  appId: "1:513195883308:web:b278aa7cee245a2439ca89",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
