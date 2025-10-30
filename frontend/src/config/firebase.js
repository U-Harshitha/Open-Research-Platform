// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCs_WPHPxQCq8Qcu4Ogd8ly8VJW5USiH3s",
  authDomain: "research-e9734.firebaseapp.com",
  projectId: "research-e9734",
  storageBucket: "research-e9734.firebasestorage.app",
  messagingSenderId: "208778232009",
  appId: "1:208778232009:web:bdb83fb0bbe0a2897f8d18",
  measurementId: "G-H8VDY7HDPR"
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-api.com'
    : 'http://localhost:5000',
  ENDPOINTS: {
    SEARCH: '/api/search',
    COMPLETE: '/api/complete',
    ANALYZE: '/api/analyze',
    PLAGIARISM: '/api/plagiarism',
    ASSET_ANALYSIS: '/api/asset-analysis'
  }
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Open Research Nexus',
  VERSION: '1.0.0',
  FEATURES: {
    COLLABORATION: true,
    AI_ASSISTANCE: true,
    ASSET_MANAGEMENT: true,
    PLAGIARISM_CHECK: true,
    SEARCH_GROUNDING: true,
    ANALYTICS: true
  }
};