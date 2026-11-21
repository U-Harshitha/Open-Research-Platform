// Papers a user watches for new citations. Kept per user in this browser.
const key = (uid) => `orn:watch:${uid || 'anon'}`;

export function getWatchlist(uid) {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) || '[]');
  } catch {
    return [];
  }
}

function save(uid, list) {
  try {
    localStorage.setItem(key(uid), JSON.stringify(list));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('orn:watchlist'));
}

export function isWatching(uid, id) {
  return getWatchlist(uid).some((w) => w.id === id);
}

export function toggleWatch(uid, work) {
  const list = getWatchlist(uid);
  if (list.some((w) => w.id === work.id)) {
    save(uid, list.filter((w) => w.id !== work.id));
    return false;
  }
  // Alerts cover works citing it from the day you start watching.
  save(uid, [{ id: work.id, title: work.title, since: new Date().toISOString().slice(0, 10) }, ...list].slice(0, 25));
  return true;
}
