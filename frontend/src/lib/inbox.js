import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { subscribeMessages } from './chat.js';
import { isLocalId, toMillis } from './projects.js';
import { getWatchlist } from './watchlist.js';
import { getSource } from './sources.js';

// Gathers updates for the inbox: others' chat messages and comments on your
// projects, and new works citing papers you watch (OpenAlex).
const readKey = (uid) => `orn:inbox-read:${uid}`;
const loadRead = (uid) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(readKey(uid)) || '[]'));
  } catch {
    return new Set();
  }
};

export function useInbox(user, projects) {
  const [chat, setChat] = useState({});
  const [comments, setComments] = useState({});
  const [citations, setCitations] = useState({ loading: false, items: [], error: null });
  const [read, setRead] = useState(() => loadRead(user?.uid));
  const ids = (projects || []).slice(0, 12).map((p) => p.id).join(',');

  // Chat + comments, one listener per recent project.
  useEffect(() => {
    if (!user || !projects) return undefined;
    const unsubs = [];
    projects.slice(0, 12).forEach((p) => {
      unsubs.push(subscribeMessages(user, p.id, (list) => setChat((c) => ({ ...c, [p.id]: list || [] }))));
      if (db && !user.isDemo && !isLocalId(p.id)) {
        const q = query(collection(db, 'comments'), where('docId', '==', p.id), where('resolved', '==', false), orderBy('createdAt', 'asc'));
        unsubs.push(onSnapshot(q, (snap) => setComments((c) => ({ ...c, [p.id]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })), () => {}));
      }
    });
    return () => unsubs.forEach((u) => u());
  }, [user, ids]); // eslint-disable-line react-hooks/exhaustive-deps

  // Citation alerts for watched works.
  const refreshCitations = async () => {
    const watch = getWatchlist(user?.uid);
    if (!watch.length) return setCitations({ loading: false, items: [], error: null });
    setCitations((c) => ({ ...c, loading: true }));
    try {
      const results = await Promise.all(
        watch.map((w) => getSource(`/api/scholar/works/${w.id}/cited-by`, { since: w.since }).then((d) => d.results.map((r) => ({ ...r, watched: w }))).catch(() => []))
      );
      setCitations({ loading: false, items: results.flat(), error: null });
    } catch (e) {
      setCitations({ loading: false, items: [], error: e.message });
    }
  };
  useEffect(() => {
    if (!user) return undefined;
    refreshCitations();
    const on = () => refreshCitations();
    window.addEventListener('orn:watchlist', on);
    return () => window.removeEventListener('orn:watchlist', on);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = useMemo(() => {
    if (!user) return [];
    const byId = Object.fromEntries((projects || []).map((p) => [p.id, p]));
    const out = [
      {
        id: 'welcome',
        kind: 'system',
        from: 'Nexus',
        subject: 'Welcome to Updates',
        preview: 'Chat, comments and new citations of papers you watch land here.',
        body: 'Messages and comments from collaborators on your projects show up here, along with new work citing any paper you watch in the Library (use “Watch citations” on a paper). Open an item to mark it read.',
        time: 0,
      },
    ];
    Object.entries(chat).forEach(([pid, list]) =>
      (list || []).filter((m) => m.userId !== user.uid).forEach((m) =>
        out.push({ id: `chat:${m.id}`, kind: 'chat', from: m.userName, subject: byId[pid]?.title || 'Project chat', preview: m.text, body: m.text, time: toMillis(m.createdAt), projectId: pid })
      )
    );
    Object.entries(comments).forEach(([pid, list]) =>
      (list || []).filter((c) => c.userId !== user.uid).forEach((c) =>
        out.push({ id: `comment:${c.id}`, kind: 'comment', from: c.userName, subject: `Comment on ${byId[pid]?.title || 'your project'}`, preview: c.content, body: c.content, quote: c.selection?.text, time: toMillis(c.createdAt), projectId: pid })
      )
    );
    citations.items.forEach((w) =>
      out.push({
        id: `cite:${w.watched.id}:${w.id}`,
        kind: 'citation',
        from: 'OpenAlex',
        subject: `New citation of “${w.watched.title}”`,
        preview: w.title,
        body: w.abstract,
        work: w,
        time: w.date ? new Date(w.date).getTime() : Date.now(),
      })
    );
    return out.sort((a, b) => b.time - a.time);
  }, [user, projects, chat, comments, citations.items]);

  const markRead = (id) =>
    setRead((r) => {
      if (r.has(id)) return r;
      const next = new Set(r).add(id);
      try {
        localStorage.setItem(readKey(user.uid), JSON.stringify([...next].slice(-500)));
      } catch {
        /* ignore */
      }
      return next;
    });
  const markAll = () => items.forEach((i) => markRead(i.id));

  return { items, read, markRead, markAll, citationsLoading: citations.loading, refreshCitations };
}
