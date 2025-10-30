import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs_WPHPxQCq8Qcu4Ogd8ly8VJW5USiH3s",
  authDomain: "research-e9734.firebaseapp.com",
  projectId: "research-e9734",
  storageBucket: "research-e9734.firebasestorage.app",
  messagingSenderId: "208778232009",
  appId: "1:208778232009:web:bdb83fb0bbe0a2897f8d18",
  measurementId: "G-H8VDY7HDPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production and browser environment)
export const analytics = typeof window !== 'undefined' && process.env.NODE_ENV === 'production' 
  ? getAnalytics(app) 
  : null;

// Connect to emulators in development (commented out for production Firebase)
// if (process.env.NODE_ENV === 'development' && !auth.emulatorConfig) {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectStorageEmulator(storage, 'localhost', 9199');
//   } catch (error) {
//     console.log('Emulators already connected or not available:', error.message);
//   }
// }

export default app;