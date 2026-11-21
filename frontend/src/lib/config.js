const env = import.meta.env;

// Flask AI service (backend/ai_service_api.py)
export const API_CONFIG = {
  BASE_URL: (env.VITE_API_URL || (env.PROD ? '' : 'http://localhost:5000')).replace(/\/$/, ''),
  ENDPOINTS: {
    SEARCH: '/api/search',
    COMPLETE: '/api/complete',
    ANALYZE: '/api/analyze',
    PLAGIARISM: '/api/plagiarism',
    ASSET_ANALYSIS: '/api/asset-analysis',
  },
};

// Where "back to portfolio" links point. Same default the Hangman app uses.
export const PORTFOLIO_URL = env.VITE_PORTFOLIO_URL || 'https://harshitha-upadhyayula.vercel.app';

export const APP_NAME = 'Open Research Nexus';
