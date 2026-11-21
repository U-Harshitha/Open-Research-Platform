import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { DISCIPLINES, STAGES } from '../data/catalog.js';
import { PROJECTS } from '../data/samples.js';
import ProjectCard from '../components/ui/ProjectCard.jsx';
import DisciplineTag from '../components/ui/DisciplineTag.jsx';
import SampleNotice from '../components/ui/SampleNotice.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

const SORTS = {
  updated: { label: 'Recently updated', fn: (a, b) => b.updated.localeCompare(a.updated) },
  followed: { label: 'Most followed', fn: (a, b) => b.followers - a.followers },
  built: { label: 'Most built on', fn: (a, b) => b.builtOn - a.builtOn },
};

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const field = params.get('field');
  const stage = params.get('stage');
  const seeking = params.get('seeking') === '1';
  const sort = params.get('sort') || 'updated';

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === null || value === undefined || value === '') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      if (field && !p.disciplines.includes(field)) return false;
      if (stage && p.stage !== stage) return false;
      if (seeking && p.seeking.length === 0) return false;
      if (!needle) return true;
      return [p.title, p.question, ...p.keywords, ...p.abstract].join(' ').toLowerCase().includes(needle);
    }).sort(SORTS[sort]?.fn || SORTS.updated.fn);
  }, [q, field, stage, seeking, sort]);

  const active = field || stage || seeking || q;

  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title="Research in the open"
        intro="Projects at every stage, from first questions to published, versioned work. Follow them, ask a question, or build on them."
      >
        <form
          className="relative mt-8 max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            set('q', q);
          }}
          role="search"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions, methods, keywords…"
            className="input-field rounded-full py-3 pl-11 pr-4 text-base"
            aria-label="Search projects"
          />
        </form>
      </PageHeader>

      <div className="mx-auto grid max-w-page gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[15rem_1fr]">
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <FilterGroup title="Field">
            <div className="flex flex-wrap gap-1.5 lg:flex-col lg:items-start">
              {DISCIPLINES.map((d) => (
                <DisciplineTag key={d.id} id={d.id} as="button" active={field === d.id} onClick={() => set('field', field === d.id ? null : d.id)} />
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Stage">
            <div className="flex flex-wrap gap-1.5 lg:flex-col lg:items-start">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => set('stage', stage === s.id ? null : s.id)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${stage === s.id ? 'border-ink bg-ink text-paper' : 'border-rule bg-surface text-ink-2 hover:border-ink-3'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </FilterGroup>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
            <input type="checkbox" checked={seeking} onChange={(e) => set('seeking', e.target.checked ? '1' : null)} className="h-4 w-4 rounded border-rule accent-[rgb(var(--signal))]" />
            Seeking collaborators
          </label>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-2">
              <span className="font-medium text-ink">{results.length}</span> {results.length === 1 ? 'project' : 'projects'}
              {active && (
                <button
                  onClick={() => {
                    setQ('');
                    setParams({}, { replace: true });
                  }}
                  className="ml-3 inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink"
                >
                  <X className="h-3 w-3" /> Clear filters
                </button>
              )}
            </p>
            <select value={sort} onChange={(e) => set('sort', e.target.value)} className="input-field w-auto rounded-full py-1.5 text-xs" aria-label="Sort">
              {Object.entries(SORTS).map(([k, s]) => (
                <option key={k} value={k}>{s.label}</option>
              ))}
            </select>
          </div>
          <SampleNotice className="mb-6" />
          {results.length ? (
            results.map((p) => <ProjectCard key={p.slug} project={p} variant="row" />)
          ) : (
            <div className="rounded-xl border border-dashed border-rule py-16 text-center">
              <p className="display text-xl">Nothing matches — yet.</p>
              <p className="mt-2 text-sm text-ink-2">That might be the gap your project fills.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      {children}
    </div>
  );
}
