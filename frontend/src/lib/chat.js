import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { isLocalId, toMillis } from './projects.js';

// A small chat per project. Firestore for synced projects (rules: collaborators
// only); this browser's storage for local/demo projects.
const localKey = (pid) => `orn:chat:${pid}`;
const readLocal = (pid) => {
  try {
    return JSON.parse(localStorage.getItem(localKey(pid)) || '[]');
  } catch {
    return [];
  }
};
const useLocal = (user, pid) => !db || !user || user.isDemo || isLocalId(pid);

export function subscribeMessages(user, projectId, callback) {
  if (useLocal(user, projectId)) {
    const emit = () => callback(readLocal(projectId));
    const onEvt = (e) => e.detail === projectId && emit();
    window.addEventListener('orn:chat', onEvt);
    emit();
    return () => window.removeEventListener('orn:chat', onEvt);
  }
  const q = query(collection(db, 'messages'), where('projectId', '==', projectId), orderBy('createdAt', 'asc'), limit(300));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toMillis(d.data().createdAt) }))),
    (err) => {
      console.warn('chat subscription failed', err);
      callback(null, err);
    }
  );
}

export async function sendMessage(user, projectId, text) {
  const msg = {
    projectId,
    userId: user.uid,
    userName: user.displayName || (user.isAnonymous ? 'Guest' : user.email?.split('@')[0]) || 'Someone',
    userPhoto: user.photoURL || null,
    text: text.slice(0, 2000),
  };
  if (useLocal(user, projectId)) {
    const next = [...readLocal(projectId), { ...msg, id: `m-${Date.now()}`, createdAt: Date.now() }].slice(-300);
    try {
      localStorage.setItem(localKey(projectId), JSON.stringify(next));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent('orn:chat', { detail: projectId }));
    return;
  }
  await addDoc(collection(db, 'messages'), { ...msg, createdAt: serverTimestamp() });
}
