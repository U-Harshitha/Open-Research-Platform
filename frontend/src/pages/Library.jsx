import React, { useEffect, useState } from 'react';
import { ArrowLeft, BellRing, BookOpen, Check, Copy, ExternalLink, FileDown, Loader2, Plus, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMode } from '../context/ModeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getSource, sourceErrorText } from '../lib/sources.js';
import { isWatching, toggleWatch } from '../lib/watchlist.js';
import { subscribeToProjects, updateProject } from '../lib/projects.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import BarChart from '../components/ui/BarChart.jsx';
import { CoverArt } from '../components/ui/Cover.jsx';
import Reveal from '../components/motion/Reveal.jsx';

export default function Library() {
  const { mode } = useMode();
  return mode === 'research' ? <ResearchLibrary /> : <StoriesLibrary />;
}

/* ------------------------------------------------------------- shared */

function Tabs({ tabs, value, onChange }) {
  return (
    <nav className="mt-8 flex gap-6 overflow-x-auto" aria-label="Library sections">
      {tabs.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)} className={`tab whitespace-nowrap ${value === id ? 'tab-active' : ''}`}>
          {label}
        </button>
      ))}
    </nav>
  );
}

function SearchBox({ value, onChange, onSubmit, placeholder, children }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-wrap items-center gap-2"
      role="search"
    >
      <div className="relative min-w-[14rem] flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-field rounded-full py-2.5 pl-11 pr-4 text-[0.95rem]" aria-label={placeholder} />
      </div>
      <button type="submit" className="btn-primary py-2.5">Search</button>
      {children}
    </form>
  );
}

function Status({ loading, error, empty }) {
  if (loading)
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-ink-3">
        <Loader2 className="h-4 w-4 animate-spin" /> Searching…
      </div>
    );
  if (error) return <p className="rounded-lg border border-signal/25 bg-signal-soft/60 px-4 py-3 text-sm text-ink-2">{error}</p>;
  if (empty) return <p className="py-10 text-sm text-ink-3">{empty}</p>;
  return null;
}

function Suggestions({ items, onPick, label = 'Try' }) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-3">
      {label}:
      {items.map((s) => (
        <button key={s} onClick={() => onPick(s)} className="rounded-full border border-rule bg-surface px-2.5 py-0.5 text-ink-2 hover:border-ink-3">
          {s}
        </button>
      ))}
    </p>
  );
}

function useQuery(fetcher) {
  const [state, setState] = useState({ loading: false, error: null, data: null });
  const run = async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      setState({ loading: false, error: null, data: await fetcher(...args) });
    } catch (e) {
      setState({ loading: false, error: sourceErrorText(e), data: null });
    }
  };
  return [state, run];
}

/* ----------------------------------------------------------- research */

function ResearchLibrary() {
  const [tab, setTab] = useState('papers');
  const [work, setWork] = useState(null); // drawer stack
  const [author, setAuthor] = useState(null);

  return (
    <>
      <PageHeader
        eyebrow="Library · powered by OpenAlex"
        title="250 million papers, one search away"
        intro="Find work, follow its citations forward and backward, see how a topic grows, and watch papers so you hear when new work cites them."
      >
        <Tabs tabs={[['papers', 'Papers'], ['authors', 'Authors'], ['trends', 'Trends']]} value={tab} onChange={setTab} />
      </PageHeader>
      <div className="mx-auto max-w-page px-4 py-10 sm:px-6">
        {tab === 'papers' && <Papers onOpen={(id) => setWork([id])} />}
        {tab === 'authors' && <Authors selected={author} onSelect={setAuthor} onOpenWork={(id) => setWork([id])} />}
        {tab === 'trends' && <Trends />}
      </div>
      {work && (
        <WorkDrawer
          id={work[work.length - 1]}
          canGoBack={work.length > 1}
          onBack={() => setWork(work.slice(0, -1))}
          onClose={() => setWork(null)}
          onOpenWork={(id) => setWork([...work, id])}
          onOpenAuthor={(id) => {
            setWork(null);
            setAuthor(id);
            setTab('authors');
          }}
        />
      )}
    </>
  );
}

const authorLine = (w) =>
  [w.authors?.slice(0, 3).map((a) => a.name || a).join(', ') + (w.author_count > 3 ? ' et al.' : ''), w.year, w.venue].filter(Boolean).join(' · ');

function WorkRow({ w, onOpen, i = 0 }) {
  return (
    <Reveal as="li" delay={i % 6}>
      <button onClick={() => onOpen(w.id)} className="group w-full border-b border-rule py-5 text-left first:border-t">
        <span className="flex flex-wrap items-center gap-2 text-2xs">
          {w.is_oa && <span className="rounded-full bg-[#2F7D5B]/10 px-2 py-0.5 font-medium text-[#2F7D5B]">Open access</span>}
          {w.type && <span className="font-mono uppercase tracking-[0.12em] text-ink-3">{w.type}</span>}
          {w.topic && <span className="text-ink-3">· {w.topic}</span>}
        </span>
        <span className="display mt-1.5 block text-lg leading-snug group-hover:text-accent sm:text-xl">{w.title}</span>
        <span className="mt-1 block text-xs text-ink-2">{authorLine(w)}</span>
        {w.abstract && <span className="mt-2 line-clamp-2 block max-w-measure text-sm leading-relaxed text-ink-2">{w.abstract}</span>}
        <span className="mt-2 block font-mono text-2xs text-ink-3">cited {w.cited_by?.toLocaleString()}×</span>
      </button>
    </Reveal>
  );
}

function Papers({ onOpen }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState({ from: '', to: '', oa: false, type: '', sort: '' });
  const [page, setPage] = useState(1);
  const [state, run] = useQuery((query, filters, p) =>
    getSource('/api/scholar/works', { q: query, from: filters.from, to: filters.to, oa: filters.oa ? 1 : '', type: filters.type, sort: filters.sort, page: p })
  );
  const go = (query = q, p = 1) => {
    if (!query.trim()) return;
    setQ(query);
    setPage(p);
    run(query, f, p);
  };
  const data = state.data;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
      <div className="min-w-0">
        <SearchBox value={q} onChange={setQ} onSubmit={() => go()} placeholder="Search papers by topic, method or title…" />
        {!data && !state.loading && !state.error && (
          <Suggestions items={['microplastics sediment', 'urban heat health', 'code-mixed sarcasm', 'registered reports replication']} onPick={(s) => go(s)} />
        )}
        <div className="mt-6">
          <Status loading={state.loading} error={state.error} empty={data && !data.results.length ? 'No papers match. Loosen a filter or try other words.' : null} />
          {data && !state.loading && data.results.length > 0 && (
            <>
              <p className="mb-3 text-sm text-ink-2"><b className="font-medium text-ink">{data.count.toLocaleString()}</b> works</p>
              <ul>{data.results.map((w, i) => <WorkRow key={w.id} w={w} i={i} onOpen={onOpen} />)}</ul>
              <div className="mt-6 flex items-center justify-between">
                <button disabled={page <= 1} onClick={() => go(q, page - 1)} className="btn-secondary btn-sm">Previous</button>
                <span className="font-mono text-2xs text-ink-3">page {page}</span>
                <button disabled={data.results.length < 15} onClick={() => go(q, page + 1)} className="btn-secondary btn-sm">Next</button>
              </div>
            </>
          )}
        </div>
      </div>
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <p className="eyebrow">Filters</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-ink-2">From<input type="number" min="1900" max="2100" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} className="input-field mt-1" placeholder="2015" /></label>
          <label className="text-xs text-ink-2">To<input type="number" min="1900" max="2100" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} className="input-field mt-1" placeholder="2026" /></label>
        </div>
        <label className="block text-xs text-ink-2">Type
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="input-field mt-1">
            <option value="">Any</option><option value="article">Article</option><option value="review">Review</option><option value="preprint">Preprint</option><option value="book">Book</option><option value="dataset">Dataset</option>
          </select>
        </label>
        <label className="block text-xs text-ink-2">Sort
          <select value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })} className="input-field mt-1">
            <option value="">Most relevant</option><option value="cited">Most cited</option><option value="newest">Newest</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={f.oa} onChange={(e) => setF({ ...f, oa: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--accent))]" />
          Open access only
        </label>
        <button onClick={() => go()} disabled={!q.trim()} className="btn-secondary btn-sm w-full">Apply filters</button>
      </aside>
    </div>
  );
}

function WorkDrawer({ id, onClose, onOpenWork, onOpenAuthor, canGoBack, onBack }) {
  const [state, run] = useQuery((wid) => getSource(`/api/scholar/works/${wid}`));
  const [tab, setTab] = useState('references');
  const [cited, runCited] = useQuery((wid) => getSource(`/api/scholar/works/${wid}/cited-by`));
  const { user, openAuth } = useAuth();
  const [watching, setWatching] = useState(false);
  const [projects, setProjects] = useState([]);
  const [target, setTarget] = useState('');

  useEffect(() => {
    run(id);
    setTab('references');
    setWatching(isWatching(user?.uid, id));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tab === 'cited') runCited(id);
  }, [tab, id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) return undefined;
    return subscribeToProjects(user, setProjects);
  }, [user]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const w = state.data?.work;
  const watch = () => {
    if (!user) return openAuth({ reason: 'Sign in to get alerts when new work cites this paper.' });
    const on = toggleWatch(user.uid, w);
    setWatching(on);
    toast(on ? 'Watching — new citations will appear in Updates.' : 'Stopped watching.');
  };
  const addToProject = async () => {
    const p = projects.find((x) => x.id === target);
    if (!p) return;
    const asset = { id: Date.now().toString(), type: 'paper', title: w.title, url: w.url, description: authorLine(w), addedAt: new Date().toISOString(), addedBy: user.uid };
    try {
      await updateProject(user, p.id, { assets: [...(p.assets || []), asset] });
      toast.success(`Added to “${p.title}”`);
    } catch {
      toast.error('Could not add it');
    }
  };

  const list = tab === 'references' ? w?.references : tab === 'related' ? w?.related : cited.data?.results;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 animate-fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer flex h-full w-full max-w-2xl flex-col bg-surface shadow-2xl" role="dialog" aria-label="Paper details">
        <div className="flex items-center justify-between border-b border-rule px-5 py-3">
          {canGoBack ? (
            <button onClick={onBack} className="btn-ghost btn-sm"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
          ) : (
            <span className="eyebrow">Paper</span>
          )}
          <button onClick={onClose} className="icon-btn" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Status loading={state.loading} error={state.error} />
          {w && !state.loading && (
            <div className="space-y-6">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-2xs">
                  {w.is_oa && <span className="rounded-full bg-[#2F7D5B]/10 px-2 py-0.5 font-medium text-[#2F7D5B]">Open access</span>}
                  <span className="font-mono uppercase tracking-[0.12em] text-ink-3">{w.type} · {w.year}</span>
                </p>
                <h2 className="display mt-2 text-2xl leading-tight sm:text-3xl">{w.title}</h2>
                <p className="mt-2 flex flex-wrap gap-x-1 text-sm text-ink-2">
                  {w.authors.map((a, i) => (
                    <span key={a.id || a.name}>
                      <button onClick={() => a.id && onOpenAuthor(a.id)} className="hover:text-accent hover:underline">{a.name}</button>
                      {i < w.authors.length - 1 ? ',' : ''}
                    </span>
                  ))}
                  {w.author_count > w.authors.length && <span>and {w.author_count - w.authors.length} more</span>}
                </p>
                {w.venue && <p className="mt-1 text-sm italic text-ink-3">{w.venue}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                {w.url && <a href={w.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm"><ExternalLink className="h-3.5 w-3.5" /> Open</a>}
                {w.oa_url && <a href={w.oa_url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm"><FileDown className="h-3.5 w-3.5" /> Free PDF</a>}
                <button onClick={watch} className={watching ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} aria-pressed={watching}>
                  {watching ? <Check className="h-3.5 w-3.5" /> : <BellRing className="h-3.5 w-3.5" />} {watching ? 'Watching' : 'Watch citations'}
                </button>
              </div>

              {user ? (
                projects.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg bg-sunken/60 p-3">
                    <select value={target} onChange={(e) => setTarget(e.target.value)} className="input-field w-auto min-w-0 flex-1 py-1.5 text-xs" aria-label="Choose a project">
                      <option value="">Add to one of your projects…</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <button onClick={addToProject} disabled={!target} className="btn-primary btn-sm"><Plus className="h-3.5 w-3.5" /> Add</button>
                  </div>
                )
              ) : (
                <button onClick={() => openAuth({ reason: 'Sign in to save papers to your projects.' })} className="text-xs text-accent hover:underline">Sign in to add this to a project</button>
              )}

              {w.abstract && (
                <div>
                  <p className="eyebrow mb-2">Abstract</p>
                  <p className="font-reading text-[1.02rem] leading-relaxed text-ink">{w.abstract}</p>
                </div>
              )}

              {w.counts_by_year?.length > 1 && (
                <BarChart data={w.counts_by_year} title={`Citations per year · ${w.cited_by.toLocaleString()} total`} unit="citations" />
              )}

              {w.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {w.keywords.map((k) => <span key={k} className="rounded-full bg-sunken px-2.5 py-0.5 text-xs text-ink-2">{k}</span>)}
                </div>
              )}

              <div>
                <nav className="flex gap-5 border-b border-rule" aria-label="Connected works">
                  {[['references', `References (${w.reference_count})`], ['cited', `Cited by (${w.cited_by.toLocaleString()})`], ['related', 'Related']].map(([tid, label]) => (
                    <button key={tid} onClick={() => setTab(tid)} className={`tab text-xs ${tab === tid ? 'tab-active' : ''}`}>{label}</button>
                  ))}
                </nav>
                {tab === 'cited' && <Status loading={cited.loading} error={cited.error} />}
                <ul className="mt-2">
                  {(list || []).map((r) => (
                    <li key={r.id}>
                      <button onClick={() => onOpenWork(r.id)} className="group w-full border-b border-rule py-3 text-left">
                        <span className="block text-sm font-medium leading-snug group-hover:text-accent">{r.title}</span>
                        <span className="mt-0.5 block text-xs text-ink-3">{authorLine(r)} · cited {r.cited_by?.toLocaleString()}×</span>
                      </button>
                    </li>
                  ))}
                  {list && list.length === 0 && <li className="py-6 text-sm text-ink-3">Nothing listed.</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Authors({ selected, onSelect, onOpenWork }) {
  const [q, setQ] = useState('');
  const [state, run] = useQuery((query) => getSource('/api/scholar/authors', { q: query }));
  const [profile, runProfile] = useQuery((id) => getSource(`/api/scholar/authors/${id}`));
  useEffect(() => {
    if (selected) runProfile(selected);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  if (selected) {
    const a = profile.data?.author;
    return (
      <div>
        <button onClick={() => onSelect(null)} className="btn-ghost btn-sm mb-6"><ArrowLeft className="h-3.5 w-3.5" /> All authors</button>
        <Status loading={profile.loading} error={profile.error} />
        {a && !profile.loading && (
          <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
            <div>
              <h2 className="display text-3xl">{a.name}</h2>
              {a.institution && <p className="mt-1 text-sm text-ink-2">{a.institution}</p>}
              <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-rule bg-rule text-center">
                {[['Works', a.works], ['Citations', a.cited_by], ['h-index', a.h_index ?? '—']].map(([k, v]) => (
                  <div key={k} className="bg-surface p-3"><dt className="eyebrow">{k}</dt><dd className="display mt-1 text-xl">{typeof v === 'number' ? v.toLocaleString() : v}</dd></div>
                ))}
              </dl>
              <div className="mt-5 flex flex-wrap gap-1.5">{a.topics.map((t) => <span key={t} className="rounded-full bg-sunken px-2.5 py-0.5 text-xs text-ink-2">{t}</span>)}</div>
              {a.orcid && <a href={a.orcid} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs text-accent hover:underline">ORCID profile</a>}
              {a.counts_by_year?.length > 1 && <div className="mt-6"><BarChart data={a.counts_by_year} title="Works per year" unit="works" height={110} /></div>}
            </div>
            <div>
              <p className="eyebrow mb-2">Most cited work</p>
              <ul>{a.top_works.map((w, i) => <WorkRow key={w.id} w={w} i={i} onOpen={onOpenWork} />)}</ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <SearchBox value={q} onChange={setQ} onSubmit={() => q.trim() && run(q)} placeholder="Search researchers by name…" />
      <div className="mt-6">
        <Status loading={state.loading} error={state.error} empty={state.data && !state.data.results.length ? 'No one by that name.' : null} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {(state.data?.results || []).map((a, i) => (
            <Reveal as="li" key={a.id} delay={i}>
              <button onClick={() => onSelect(a.id)} className="w-full rounded-xl border border-rule bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <span className="display block text-lg">{a.name}</span>
                <span className="block truncate text-xs text-ink-3">{a.institution || '—'}</span>
                <span className="mt-2 block font-mono text-2xs text-ink-2">{a.works.toLocaleString()} works · {a.cited_by.toLocaleString()} citations · h {a.h_index ?? '—'}</span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Trends() {
  const [q, setQ] = useState('');
  const [state, run] = useQuery((query) => getSource('/api/scholar/trend', { q: query }).then((d) => ({ ...d, q: query })));
  const years = state.data?.years || [];
  const latest = years[years.length - 2] || years[years.length - 1]; // last full year
  const tenAgo = years.find((y) => latest && y.year === latest.year - 10);
  return (
    <div className="max-w-3xl">
      <SearchBox value={q} onChange={setQ} onSubmit={() => q.trim() && run(q)} placeholder="A topic, e.g. “large language models”" />
      {!state.data && !state.loading && <Suggestions items={['microplastics', 'CRISPR', 'climate migration', 'open peer review']} onPick={(s) => { setQ(s); run(s); }} />}
      <div className="mt-8">
        <Status loading={state.loading} error={state.error} empty={state.data && !years.length ? 'No works found for that topic.' : null} />
        {years.length > 0 && !state.loading && (
          <Reveal className="rounded-2xl border border-rule bg-surface p-6">
            <p className="display text-2xl">“{state.data.q}”</p>
            {latest && (
              <p className="mt-1 text-sm text-ink-2">
                {latest.count.toLocaleString()} works in {latest.year}
                {tenAgo && tenAgo.count > 0 && <> — {(latest.count / tenAgo.count).toFixed(1)}× as many as in {tenAgo.year}</>}
              </p>
            )}
            <div className="mt-6"><BarChart data={years} title="Works published per year" unit="works" height={180} /></div>
            <p className="mt-3 text-2xs text-ink-3">The current year is partial.</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ stories */

const SUBJECTS = [['fantasy', 'Fantasy'], ['science_fiction', 'Sci-fi'], ['mystery_and_detective_stories', 'Mystery'], ['romance', 'Romance'], ['horror', 'Horror'], ['historical_fiction', 'Historical'], ['poetry', 'Poetry'], ['young_adult_fiction', 'YA']];

function StoriesLibrary() {
  const [tab, setTab] = useState('books');
  return (
    <>
      <PageHeader
        eyebrow="Library · Open Library, Project Gutenberg, Datamuse"
        title="Read widely, find your comps, find the word"
        intro="Comparable titles for your query letter, public-domain classics to learn from, and a word-finder for the sentence that won’t sit right."
      >
        <Tabs tabs={[['books', 'Comparable titles'], ['classics', 'Classics'], ['words', 'Words']]} value={tab} onChange={setTab} />
      </PageHeader>
      <div className="mx-auto max-w-page px-4 py-10 sm:px-6">
        {tab === 'books' && <Books />}
        {tab === 'classics' && <Classics />}
        {tab === 'words' && <Words />}
      </div>
    </>
  );
}

function Books() {
  const [q, setQ] = useState('');
  const [state, run] = useQuery((params) => getSource('/api/stories/books', params));
  return (
    <div>
      <SearchBox value={q} onChange={setQ} onSubmit={() => q.trim() && run({ q })} placeholder="A theme, premise or title — e.g. “lighthouse ghosts”" />
      <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-3">
        Browse:
        {SUBJECTS.map(([id, label]) => (
          <button key={id} onClick={() => run({ subject: id })} className="rounded-full border border-rule bg-surface px-2.5 py-0.5 text-ink-2 hover:border-ink-3">{label}</button>
        ))}
      </p>
      <div className="mt-8">
        <Status loading={state.loading} error={state.error} empty={state.data && !state.data.results.length ? 'Nothing found. Try a broader theme.' : null} />
        {state.data && !state.loading && (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {state.data.results.map((b, i) => (
              <Reveal as="li" key={b.id || b.title} delay={i % 5}>
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="cover w-full max-w-[10rem]">
                    <div className="cover-inner aspect-[2/3] bg-sunken">
                      {b.cover ? (
                        <img src={b.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <CoverArt project={{ slug: b.title || 'book', title: b.title, disciplines: ['fantasy'], stage: 'released', mode: 'stories' }} className="h-full w-full" />
                      )}
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent">{b.title}</p>
                  <p className="text-xs text-ink-3">{[b.authors?.[0], b.year].filter(Boolean).join(' · ')}</p>
                </a>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Classics() {
  const [q, setQ] = useState('');
  const [state, run] = useQuery((query) => getSource('/api/stories/classics', { q: query }));
  return (
    <div className="max-w-3xl">
      <SearchBox value={q} onChange={setQ} onSubmit={() => q.trim() && run(q)} placeholder="Author or title — e.g. “Mary Shelley”" />
      {!state.data && !state.loading && <Suggestions items={['Jane Austen', 'Frankenstein', 'ghost stories', 'Rabindranath Tagore']} onPick={(s) => { setQ(s); run(s); }} />}
      <div className="mt-6">
        <Status loading={state.loading} error={state.error} empty={state.data && !state.data.results.length ? 'No public-domain matches.' : null} />
        <ul>
          {(state.data?.results || []).map((b, i) => (
            <Reveal as="li" key={b.id} delay={i % 6} className="flex gap-4 border-b border-rule py-4 first:border-t">
              {b.cover ? <img src={b.cover} alt="" loading="lazy" className="h-20 w-14 shrink-0 rounded-sm object-cover shadow-sm" /> : <span className="flex h-20 w-14 shrink-0 items-center justify-center rounded-sm bg-sunken"><BookOpen className="h-5 w-5 text-ink-3" /></span>}
              <div className="min-w-0">
                <p className="display text-lg leading-snug">{b.title}</p>
                <p className="text-xs text-ink-3">{b.authors.join(', ')} · {b.downloads.toLocaleString()} downloads</p>
                <div className="mt-2 flex gap-3 text-xs">
                  {b.read_url && <a href={b.read_url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">Read it free</a>}
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:underline">Project Gutenberg</a>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const WORD_MODES = [['syn', 'Synonyms'], ['rhyme', 'Rhymes'], ['adj', 'Describing words'], ['assoc', 'Associated'], ['means', 'Means like']];

export function Words({ compact = false }) {
  const [w, setW] = useState('');
  const [wmode, setWmode] = useState('syn');
  const [state, run] = useQuery((word, m) => getSource('/api/words', { w: word, mode: m }));
  const [copied, setCopied] = useState(null);
  const go = (m = wmode) => {
    setWmode(m);
    if (w.trim()) run(w.trim(), m);
  };
  const copy = async (word) => {
    try {
      await navigator.clipboard.writeText(word);
      setCopied(word);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className={compact ? '' : 'max-w-3xl'}>
      <SearchBox value={w} onChange={setW} onSubmit={() => go()} placeholder={compact ? 'A word…' : 'A word — e.g. “bright”, or a phrase for “means like”'} />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {WORD_MODES.map(([id, label]) => (
          <button key={id} onClick={() => go(id)} aria-pressed={wmode === id} className={`rounded-full border px-2.5 py-0.5 text-xs ${wmode === id ? 'border-ink bg-ink text-paper' : 'border-rule bg-surface text-ink-2 hover:border-ink-3'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <Status loading={state.loading} error={state.error} empty={state.data && !state.data.results.length ? 'No suggestions — try another mode.' : null} />
        <div className="flex flex-wrap gap-2">
          {(state.data?.results || []).map((word, i) => (
            <button
              key={word}
              onClick={() => copy(word)}
              className="pop-in inline-flex items-center gap-1 rounded-full border border-rule bg-surface px-3 py-1 font-reading text-[0.95rem] hover:border-accent hover:text-accent"
              style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
              title="Copy"
            >
              {word}
              {copied === word ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />}
            </button>
          ))}
        </div>
        {state.data?.results?.length > 0 && <p className="mt-3 text-2xs text-ink-3">Click a word to copy it.</p>}
      </div>
    </div>
  );
}
