import React from 'react';
import { Check, Circle } from 'lucide-react';
import { manuscriptStats, stripHtml } from '../../lib/format.js';
import { TEMPLATES } from '../../data/catalog.js';
import { STORY_TEMPLATES } from '../../data/stories.js';
import { modeOfProject } from '../../data/modes.js';

const templateById = Object.fromEntries([...TEMPLATES, ...STORY_TEMPLATES].map((t) => [t.id, t]));

// Everything here is computed from the manuscript — no invented metrics.
export default function InsightsPanel({ project, content }) {
  const s = manuscriptStats(content);
  const text = stripHtml(content).toLowerCase();
  const sections = templateById[project.template]?.sections?.length
    ? templateById[project.template].sections
    : ['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'References'];
  const headings = [...content.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/g)].map((m) => stripHtml(m[1]).toLowerCase());
  const checks = [
    ...sections.map((sec) => {
      const has = headings.some((h) => h.includes(sec.toLowerCase().split(' ')[0]));
      return [`${sec} section`, has];
    }),
    modeOfProject(project) === 'stories' ? ['Past 1,000 words', s.words >= 1000] : ['At least one citation like [1]', s.citations > 0],
    [modeOfProject(project) === 'stories' ? 'A one-line premise' : 'A one-sentence question on Explore', !!project.question],
    ['Fields chosen', (project.disciplines || []).length > 0],
    [modeOfProject(project) === 'stories' ? 'Notes or world linked' : 'Data or code linked', (project.assets || []).length > 0],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  const placeholders = (text.match(/working title|in 150–250 words|what is known/g) || []).length;

  return (
    <div className="h-full space-y-6 overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-rule bg-rule">
        {[
          ['Words', s.words.toLocaleString()],
          ['Min read', s.minutes],
          ['Sections', s.sections],
          ['Citations', s.citations],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface p-3">
            <p className="display text-2xl">{v}</p>
            <p className="text-2xs text-ink-3">{k}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="eyebrow">Readiness</p>
          <span className="font-mono text-2xs text-ink-3">{done}/{checks.length}</span>
        </div>
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-sunken">
          <div className="h-full bg-ink transition-all" style={{ width: `${(done / checks.length) * 100}%` }} />
        </div>
        <ul className="space-y-1.5">
          {checks.map(([label, ok]) => (
            <li key={label} className={`flex items-center gap-2 text-sm ${ok ? 'text-ink' : 'text-ink-3'}`}>
              {ok ? <Check className="h-3.5 w-3.5 text-[#2F7D5B]" /> : <Circle className="h-3.5 w-3.5" />}
              {label}
            </li>
          ))}
        </ul>
      </div>

      {placeholders > 0 && (
        <p className="rounded-lg bg-mark/30 p-3 text-xs text-ink-2">
          {placeholders} template prompt{placeholders > 1 ? 's' : ''} still in the text. Replace them before sharing a preprint.
        </p>
      )}
    </div>
  );
}
