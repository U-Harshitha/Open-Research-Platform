import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AtSign, BellRing, CheckCheck, ExternalLink, Inbox as InboxIcon, Loader2, MessageCircle, MessageSquare, RefreshCw, Sparkles } from 'lucide-react';
import { useInbox } from '../../lib/inbox.js';
import Avatar from '../ui/Avatar.jsx';

const KIND = {
  chat: { icon: MessageCircle, label: 'Chat' },
  comment: { icon: MessageSquare, label: 'Comment' },
  citation: { icon: BellRing, label: 'Citation' },
  system: { icon: Sparkles, label: 'Nexus' },
};
const FILTERS = [['all', 'All'], ['unread', 'Unread'], ['chat', 'Chat'], ['comment', 'Comments'], ['citation', 'Citations']];

function when(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (today - d < 6 * 864e5) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

// A mail-style inbox: list on the left, reading pane on the right.
export default function Inbox({ user, projects }) {
  const { items, read, markRead, markAll, citationsLoading, refreshCitations } = useInbox(user, projects);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  const list = useMemo(
    () => items.filter((i) => (filter === 'all' ? true : filter === 'unread' ? !read.has(i.id) : i.kind === filter)),
    [items, filter, read]
  );
  const open = items.find((i) => i.id === openId);
  const unread = items.filter((i) => !read.has(i.id)).length;
  const select = (i) => {
    setOpenId(i.id);
    markRead(i.id);
  };

  return (
    <div className="flex h-full min-h-0">
      <section className={`flex w-full min-w-0 flex-col border-r border-rule bg-surface md:w-[24rem] md:shrink-0 ${open ? 'max-md:hidden' : ''}`}>
        <header className="border-b border-rule px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <h1 className="display text-2xl">Updates</h1>
            <span className="flex items-center gap-1">
              <button onClick={refreshCitations} className="icon-btn h-7 w-7" title="Check for new citations" aria-label="Refresh">
                {citationsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              </button>
              <button onClick={markAll} disabled={!unread} className="icon-btn h-7 w-7" title="Mark all as read" aria-label="Mark all as read"><CheckCheck className="h-4 w-4" /></button>
            </span>
          </div>
          <p className="text-xs text-ink-3">{unread ? `${unread} unread` : 'All caught up'}</p>
          <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto">
            {FILTERS.map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs ${filter === id ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-sunken'}`}>
                {label}
              </button>
            ))}
          </div>
        </header>
        <ul className="flex-1 overflow-y-auto">
          {list.length === 0 && (
            <li className="flex flex-col items-center px-6 py-16 text-center text-sm text-ink-3">
              <InboxIcon className="mb-2 h-6 w-6" /> Nothing here.
            </li>
          )}
          {list.map((i, n) => {
            const K = KIND[i.kind];
            const isUnread = !read.has(i.id);
            return (
              <li key={i.id} className="animate-rise" style={{ animationDelay: `${Math.min(n, 12) * 35}ms` }}>
                <button
                  onClick={() => select(i)}
                  className={`relative flex w-full gap-3 border-b border-rule px-4 py-3 text-left transition-colors ${openId === i.id ? 'bg-accent-soft/60' : 'hover:bg-sunken/60'}`}
                >
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${isUnread ? 'bg-accent' : 'bg-transparent'}`} aria-label={isUnread ? 'Unread' : undefined} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${isUnread ? 'font-semibold' : 'font-medium'}`}>{i.from}</span>
                      <span className="shrink-0 font-mono text-[0.6rem] text-ink-3">{when(i.time)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 truncate text-xs text-ink">
                      <K.icon className="h-3 w-3 shrink-0 text-ink-3" /> <span className="truncate">{i.subject}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-ink-3">{i.preview}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`min-w-0 flex-1 overflow-y-auto bg-paper ${open ? '' : 'max-md:hidden'}`}>
        {!open ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-ink-3">
            <AtSign className="mb-3 h-8 w-8" />
            <p className="font-serif text-xl text-ink-2">Select an update to read it</p>
          </div>
        ) : (
          <article key={open.id} className="route-enter mx-auto max-w-2xl px-6 py-8">
            <button onClick={() => setOpenId(null)} className="btn-ghost btn-sm mb-4 md:hidden"><ArrowLeft className="h-3.5 w-3.5" /> Updates</button>
            <p className="eyebrow">{KIND[open.kind].label}</p>
            <h2 className="display mt-2 text-3xl leading-tight">{open.subject}</h2>
            <div className="mt-4 flex items-center gap-3 border-b border-rule pb-4">
              <Avatar name={open.from} size="h-9 w-9 text-xs" />
              <div className="text-sm">
                <p className="font-medium">{open.from}</p>
                <p className="text-xs text-ink-3">{open.time ? (open.kind === 'citation' ? new Date(open.time).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(open.time).toLocaleString()) : ''}</p>
              </div>
            </div>
            {open.quote && <p className="mt-6 border-l-2 border-mark pl-3 font-reading italic text-ink-2">“{open.quote}”</p>}
            {open.kind === 'citation' ? (
              <div className="mt-6 space-y-3">
                <p className="display text-xl">{open.work.title}</p>
                <p className="text-sm text-ink-2">{[open.work.authors?.map((a) => a.name).join(', '), open.work.year, open.work.venue].filter(Boolean).join(' · ')}</p>
                {open.body && <p className="font-reading leading-relaxed">{open.body}</p>}
                {open.work.url && <a href={open.work.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm"><ExternalLink className="h-3.5 w-3.5" /> Open paper</a>}
              </div>
            ) : (
              <p className="mt-6 whitespace-pre-wrap font-reading text-lg leading-relaxed">{open.body}</p>
            )}
            {open.projectId && (
              <Link to={`/workspace/${open.projectId}?panel=${open.kind === 'chat' ? 'chat' : 'comments'}`} className="btn-primary mt-8">
                {open.kind === 'chat' ? 'Reply in chat' : 'Open the draft'}
              </Link>
            )}
            {open.kind === 'system' && <Link to="/library" className="btn-secondary mt-8">Open the Library</Link>}
          </article>
        )}
      </section>
    </div>
  );
}
