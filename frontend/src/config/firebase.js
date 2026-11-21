import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase web config. These values are public identifiers (not secrets);
// access is controlled by firestore.rules and Firebase Auth authorized domains.
// Override any of them with VITE_FIREBASE_* variables.
const env = import.meta.env;
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCs_WPHPxQCq8Qcu4Ogd8ly8VJW5USiH3s',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'research-e9734.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'research-e9734',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'research-e9734.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '208778232009',
  appId: env.VITE_FIREBASE_APP_ID || '1:208778232009:web:bdb83fb0bbe0a2897f8d18',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
