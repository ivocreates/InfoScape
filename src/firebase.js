// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFirebaseConfig, isDevelopment, getLoggingConfig } from "./utils/apiConfig";

// Get Firebase configuration securely
const firebaseConfig = getFirebaseConfig();
const loggingConfig = getLoggingConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize analytics only in production and if measurement ID is provided
let analytics = null;
if (firebaseConfig.measurementId && !isDevelopment()) {
  try {
    analytics = getAnalytics(app);
    if (loggingConfig.enableConsole) {
      console.log('Firebase Analytics initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
  }
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure auth settings
auth.useDeviceLanguage();

// Log initialization in development
if (loggingConfig.enableConsole) {
  console.log('Firebase services initialized:', {
    auth: !!auth,
    firestore: !!db,
    storage: !!storage,
    analytics: !!analytics,
    projectId: firebaseConfig.projectId
  });
}

export { auth, db, storage, analytics };
