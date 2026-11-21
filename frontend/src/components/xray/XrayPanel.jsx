import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { API_CONFIG } from '../../lib/config.js';
import { excerpt } from './source.js';
import { ScanIcon } from './XrayButton.jsx';

const TABS = [
  ['live', 'Live'],
  ['inside', 'Inside'],
  ['why', 'Why this stack'],
];

export default function XrayPanel({ onClose }) {
  const [tab, setTab] = useState('live');
  return (
    <aside
      className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-[27rem] flex-col border-l border-white/10 bg-[#101820] text-[#E8E6E0] shadow-2xl animate-fade-in"
      role="dialog"
      aria-label="X-ray: how this site works"
    >
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[#7FD1E0]">
          <ScanIcon className="h-4 w-4" /> X-ray
        </p>
        <button onClick={onClose} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close X-ray">
          <X className="h-4 w-4" />
        </button>
      </header>
      <nav className="flex gap-1 border-b border-white/10 px-3 pt-2" aria-label="X-ray sections">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-2.5 pb-2.5 pt-1 text-sm transition-colors ${tab === id ? 'border-[#7FD1E0] text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto px-5 py-5 text-sm leading-relaxed">
        {tab === 'live' && <Live />}
        {tab === 'inside' && <Inside />}
        {tab === 'why' && <Why />}
      </div>
      <footer className="border-t border-white/10 px-5 py-3 font-mono text-[0.65rem] text-white/40">
        Esc to close · code shown is cut from the real source at build time
      </footer>
    </aside>
  );
}

/* ---------------------------------------------------------------- Live */

function useLiveFacts() {
  const [facts, setFacts] = useState(null);
  const [health, setHealth] = useState({ state: 'checking' });

  const measure = useCallback(() => {
    const base = import.meta.env.BASE_URL;
    const nav = performance.getEntriesByType('navigation')[0];
    const assets = performance
      .getEntriesByType('resource')
      .filter((e) => e.name.includes(`${base}assets/`))
      .map((e) => ({
        file: e.name.split('/').pop().split('?')[0],
        // Compressed size when known; browsers report 0 for 304-revalidated files.
        kb: e.encodedBodySize ? Math.max(1, Math.round(e.encodedBodySize / 1024)) : null,
        sent: e.transferSize || 0,
        cached: e.transferSize === 0 || e.encodedBodySize === 0,
      }));
    const host = window.location.hostname;
    const where = /localhost|127\.0\.0\.1/.test(host)
      ? 'Local development'
      : host.endsWith('onrender.com')
        ? 'Directly from Render'
        : 'Through the portfolio (Vercel rewrite → Render)';
    setFacts({
      host: window.location.host,
      base,
      where,
      dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      assets,
      editorLoaded: assets.some((a) => /^Workspace-/.test(a.file)),
    });
  }, []);

  const ping = useCallback(async () => {
    if (!API_CONFIG.BASE_URL) return setHealth({ state: 'none' });
    setHealth({ state: 'checking' });
    const t0 = performance.now();
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/health`);
      const data = await res.json();
      setHealth({ state: 'up', ms: Math.round(performance.now() - t0), data });
    } catch {
      setHealth({ state: 'down', ms: Math.round(performance.now() - t0) });
    }
  }, []);

  useEffect(() => {
    measure();
    ping();
  }, [measure, ping]);

  return { facts, health, refresh: () => { measure(); ping(); } };
}

function Live() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { facts, health, refresh } = useLiveFacts();
  if (!facts) return null;

  const transferred = Math.round(facts.assets.reduce((n, a) => n + a.sent, 0) / 1024);
  const account = !user ? 'Not signed in' : user.isDemo ? 'Local demo session' : user.isAnonymous ? 'Firebase guest' : user.providerData?.[0]?.providerId === 'google.com' ? 'Google account' : 'Email account';
  const storage = !user ? '—' : user.isDemo ? 'This browser (localStorage)' : 'Firestore, synced live';

  let ai = 'Checking…';
  if (health.state === 'none') ai = 'No AI service configured for this build';
  if (health.state === 'down') ai = `Unreachable after ${health.ms} ms`;
  if (health.state === 'up') {
    const d = health.data || {};
    ai = `${d.provider || 'no provider'} · ${d.model || 'no key set'} · ${health.ms} ms${health.ms > 2500 ? ' (it was asleep — free tier)' : ''}`;
  }

  return (
    <div className="space-y-6">
      <p className="text-white/70">Measured from this tab, right now.</p>
      <Facts
        rows={[
          ['Served', facts.where],
          ['Host', facts.host],
          ['Mounted at', facts.base],
          ['Route', pathname],
          ['First paint ready', facts.dcl ? `${facts.dcl} ms (DOMContentLoaded)` : '—'],
          ['You', account],
          ['Your drafts live in', storage],
          ['AI service', ai],
        ]}
      />
      <div>
        <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/50">
          Code · {facts.assets.length} files · {transferred} KB over the network
        </p>
        <ul className="space-y-1 font-mono text-xs">
          {facts.assets.map((a) => (
            <li key={a.file} className="flex justify-between gap-4 text-white/75">
              <span className="truncate">{a.file}</span>
              <span className="shrink-0 text-white/45">{[a.kb && `${a.kb} KB`, a.cached && 'cached'].filter(Boolean).join(' · ')}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-white/55">
          {facts.editorLoaded
            ? 'The editor bundle is loaded because you opened the workspace.'
            : 'The editor (Quill) hasn’t been downloaded — it loads only when you open the workspace.'}
        </p>
      </div>
      <button onClick={refresh} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-white/40 hover:text-white">
        <RefreshCw className="h-3 w-3" /> Measure again
      </button>
    </div>
  );
}

function Facts({ rows }) {
  return (
    <dl className="divide-y divide-white/10 rounded-lg border border-white/10">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 px-3 py-2 text-xs">
          <dt className="text-white/45">{k}</dt>
          <dd className="break-words text-white/85">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------- Inside */

const SECTIONS = [
  {
    title: 'One build, mounted under /research',
    body: 'The portfolio forwards /research to this app, like /hangman. Vite builds every asset URL under that prefix and the router treats it as its root, so links and files resolve through the proxy.',
    file: 'frontend/src/main.jsx',
    name: 'base',
  },
  {
    title: 'The editor loads only when you need it',
    body: 'Quill is the heaviest dependency. The workspace route is a lazy import, so reading the site never downloads it. The Live tab shows whether it has been fetched yet.',
    file: 'frontend/src/App.jsx',
    name: 'lazy',
  },
  {
    title: 'Collaborators’ edits arrive; your own echoes don’t',
    body: 'Every open copy of a project listens to the same Firestore document. When a change arrives, it is applied only if it differs from what this tab last typed and isn’t a pending local write, so your own saves never reset the cursor.',
    file: 'frontend/src/components/CollaborativeEditor.jsx',
    name: 'echo',
  },
  {
    title: 'Autosave without a save button',
    body: 'Typing updates the page instantly; the write to Firestore waits for 1.5 s of quiet. Only edits made by a person trigger a save — programmatic updates are ignored.',
    file: 'frontend/src/components/CollaborativeEditor.jsx',
    name: 'autosave',
  },
  {
    title: 'Works before you make an account',
    body: 'If Firestore refuses a write (a demo session, or rules not deployed yet), the project is saved in this browser instead, behind the same function. Nothing else in the app needs to know.',
    file: 'frontend/src/lib/projects.js',
    name: 'fallback',
  },
  {
    title: 'Citations come from a real index, not the model’s memory',
    body: 'Find searches OpenAlex first. The model is then asked to answer using only those papers and cite them as [n], so every reference it gives points at a work that exists. The API key for this lives on the server.',
    file: 'backend/ai_service_api.py',
    name: 'find',
  },
  {
    title: 'One engine, two vocabularies',
    body: 'Research and Stories are the same app. Every page reads its words, stages, credits and templates from one config per mode, and the theme swaps a handful of CSS variables — fonts, paper, ink. Switching animates the colours instead of reloading.',
    file: 'frontend/src/data/modes.js',
    name: 'modes',
  },
  {
    title: 'Dictation for free',
    body: 'The browser records audio, the Flask service forwards it to Whisper on Groq’s free tier, and the text lands at the cursor. If that service is asleep or missing, it falls back to the browser’s own speech recognition.',
    file: 'frontend/src/components/workspace/Dictation.jsx',
    name: 'dictation',
  },
  {
    title: 'Honest numbers',
    body: 'Insights are counted from the manuscript itself — words, sections, citations like [1], figures. No invented “impact scores”.',
    file: 'frontend/src/lib/format.js',
    name: 'stats',
  },
];

function Inside() {
  const [open, setOpen] = useState(0);
  return (
    <ol className="space-y-2">
      {SECTIONS.map((s, i) => (
        <li key={s.name} className="rounded-lg border border-white/10">
          <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-start gap-3 px-3 py-3 text-left" aria-expanded={open === i}>
            <span className="mt-0.5 font-mono text-[0.65rem] text-[#7FD1E0]">{String(i + 1).padStart(2, '0')}</span>
            <span className="flex-1 font-medium text-white/90">{s.title}</span>
            <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-white/40 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="space-y-3 px-3 pb-3">
              <p className="text-white/70">{s.body}</p>
              <p className="font-mono text-[0.65rem] text-white/40">{s.file}</p>
              <pre className="max-h-72 overflow-auto rounded-md bg-black/40 p-3 font-mono text-[0.68rem] leading-relaxed text-[#CFE9EE]">{excerpt(s.file, s.name)}</pre>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------- Why */

const WHY = [
  ['A static app that is still real-time', 'The frontend is plain files on a CDN. Live collaboration comes from Firestore listeners: the browser talks to Google directly, so there is no socket server to run or keep awake.'],
  ['Nothing real-time goes through the proxy', 'Vercel rewrites can’t carry WebSockets — Hangman has to fall back to long-polling behind them. Here only HTML, JS and CSS pass through the rewrite; live data never does.'],
  ['Python only where a secret is needed', 'The Flask service holds the AI and OpenAlex keys, transcribes dictation, and proxies the book and word APIs so the browser never depends on their CORS settings. Everything else runs in the browser, so the server stays tiny and can sleep on the free tier.'],
  ['Free AI that can’t invent citations', 'Groq’s free tier runs an open model for drafting and review, and Whisper for dictation. OpenAlex supplies real papers and Open Library real books. The model summarises sources; it doesn’t produce them.'],
  ['$0 at zero traffic', 'Render static site + Render free web service + Firebase Spark + Groq and OpenAlex free tiers.'],
];

const TABLE = [
  ['Hosting', 'An always-on app server and database', 'Static files + an API that can sleep'],
  ['Live co-editing', 'Action Cable, Redis, and a socket through the proxy', 'Firestore listeners, browser to Google directly'],
  ['Behind the portfolio rewrite', 'Sockets can’t pass; needs a fallback', 'Nothing live passes through it'],
  ['API keys', 'On the server', 'On the server (Flask)'],
  ['Where Rails would win', 'Relational data, admin screens, server-rendered public pages for SEO', 'Firestore is weak at joins and full-text search'],
];

function Why() {
  return (
    <div className="space-y-6">
      <p className="text-white/70">
        React + Vite in the browser, Firebase for accounts and live data, and a small Flask service for AI. Not Rails — here is why, and where Rails would have been the better call.
      </p>
      <ul className="space-y-4">
        {WHY.map(([t, b]) => (
          <li key={t}>
            <p className="font-medium text-white/90">{t}</p>
            <p className="mt-1 text-white/65">{b}</p>
          </li>
        ))}
      </ul>
      <div>
        <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/50">Compared with a Rails monolith</p>
        <div className="overflow-hidden rounded-lg border border-white/10 text-xs">
          <div className="grid grid-cols-[6.5rem_1fr_1fr] gap-2 border-b border-white/10 bg-white/5 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-white/50">
            <span />
            <span>Rails</span>
            <span className="text-[#7FD1E0]">This stack</span>
          </div>
          {TABLE.map(([k, a, b]) => (
            <div key={k} className="grid grid-cols-[6.5rem_1fr_1fr] gap-2 border-b border-white/10 px-3 py-2 last:border-0">
              <span className="text-white/45">{k}</span>
              <span className="text-white/65">{a}</span>
              <span className="text-white/90">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
