import { API_CONFIG } from './config.js';

// GET a JSON endpoint on the Flask service (OpenAlex / Open Library / Gutendex / Datamuse proxies).
export async function getSource(path, params = {}) {
  if (!API_CONFIG.BASE_URL && import.meta.env.PROD) throw new Error('NO_BACKEND');
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
  let res;
  try {
    res = await fetch(`${API_CONFIG.BASE_URL}${path}${qs ? `?${qs}` : ''}`);
  } catch {
    throw new Error('NO_BACKEND');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const sourceErrorText = (e) =>
  e?.message === 'NO_BACKEND' ? 'The research service isn’t reachable. It may be waking up — try again in a moment.' : e?.message || 'Something went wrong.';
