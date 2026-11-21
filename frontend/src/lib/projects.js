import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebase.js';

// Projects live in the existing `documents` collection (see firestore.rules).
// Demo sessions, or a Firestore that refuses the write, fall back to
// localStorage so the workspace still works end to end.

const LOCAL_KEY = 'orn:local-projects:v1';
const listeners = new Set();

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
};
const writeLocal = (docs) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(docs));
  } catch {
    /* storage unavailable: keep in memory only */
  }
  listeners.forEach((fn) => fn(docs));
};

export const isLocalId = (id) => typeof id === 'string' && id.startsWith('local-');
const useLocal = (user) => !db || !user || user.isDemo;

export async function createProject(user, data) {
  const base = {
    title: data.title || 'Untitled project',
    content: data.content || '',
    question: data.question || '',
    disciplines: data.disciplines || [],
    stage: data.stage || 'idea',
    license: data.license || 'cc-by-4.0',
    template: data.template || 'blank',
    seeking: data.seeking || [],
    buildsOn: data.buildsOn || null,
    isPublic: !!data.isPublic,
    createdBy: user.uid,
    collaborators: [user.uid],
    assets: [],
    version: 1,
    lastEditedBy: user.uid,
  };

  if (!useLocal(user)) {
    try {
      const ref = await addDoc(collection(db, 'documents'), {
        ...base,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: ref.id, local: false };
    } catch (e) {
      console.warn('Firestore create failed, saving locally', e);
    }
  }
  const id = `local-${Date.now()}`;
  const now = new Date().toISOString();
  writeLocal([{ id, ...base, createdAt: now, updatedAt: now }, ...readLocal()]);
  return { id, local: true };
}

export async function updateProject(user, id, updates) {
  if (isLocalId(id)) {
    writeLocal(readLocal().map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)));
    return;
  }
  await updateDoc(doc(db, 'documents', id), {
    ...updates,
    updatedAt: serverTimestamp(),
    lastEditedBy: user?.uid || null,
  });
}

// Subscribe to the signed-in user's projects (Firestore + local), newest first.
export function subscribeToProjects(user, callback) {
  let remote = [];
  const emit = () => {
    const local = readLocal().filter((d) => d.createdBy === user.uid || user.isDemo);
    const all = [...remote, ...local];
    all.sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
    callback(all);
  };
  const onLocal = () => emit();
  listeners.add(onLocal);

  let unsub = () => {};
  if (!useLocal(user)) {
    try {
      const q = query(
        collection(db, 'documents'),
        where('collaborators', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc')
      );
      unsub = onSnapshot(
        q,
        (snap) => {
          remote = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          emit();
        },
        (err) => {
          console.warn('Project subscription failed', err);
          emit();
        }
      );
    } catch (e) {
      console.warn(e);
    }
  }
  emit();
  return () => {
    listeners.delete(onLocal);
    unsub();
  };
}

export const getLocalProject = (id) => readLocal().find((d) => d.id === id) || null;

export function toMillis(v) {
  if (!v) return Date.now();
  if (v.toMillis) return v.toMillis();
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? 0 : t;
}
