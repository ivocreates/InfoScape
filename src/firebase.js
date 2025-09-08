// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7LfMgmB9Vo7tAw8D_z366zgqPB__oScs",
  authDomain: "infoscope-osint.firebaseapp.com",
  projectId: "infoscope-osint",
  storageBucket: "infoscope-osint.firebasestorage.app",
  messagingSenderId: "633111783755",
  appId: "1:633111783755:web:11fe05339ded011d68a0ce",
  measurementId: "G-17HQVKCKJ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, analytics };
