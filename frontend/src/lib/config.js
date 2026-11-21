const env = import.meta.env;

// Flask AI service (backend/ai_service_api.py).
// VITE_API_URL may be a full URL, a bare host, or — as Render's Blueprint
// `fromService: property: host` provides — just the service name.
function apiBase(raw) {
  if (!raw) return env.PROD ? '' : 'http://localhost:5000';
  let v = raw.trim().replace(/\/$/, '');
  if (!/^https?:\/\//.test(v)) v = `https://${v.includes('.') ? v : `${v}.onrender.com`}`;
  return v;
}

export const API_CONFIG = {
  BASE_URL: apiBase(env.VITE_API_URL),
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
