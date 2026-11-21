import React from 'react';
import { disciplineById } from '../../data/catalog.js';

export function DisciplineDot({ id, className = 'h-2 w-2' }) {
  const d = disciplineById[id];
  return <span className={`inline-block shrink-0 rounded-[2px] ${className}`} style={{ background: d?.color || '#999' }} aria-hidden="true" />;
}

export default function DisciplineTag({ id, short = false, as: As = 'span', active, ...rest }) {
  const d = disciplineById[id];
  if (!d) return null;
  return (
    <As
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
        active ? 'border-ink bg-ink text-paper' : 'border-rule bg-surface text-ink-2 hover:border-ink-3'
      }`}
      {...rest}
    >
      <DisciplineDot id={id} />
      {short ? d.short : d.label}
    </As>
  );
}

// "Health × Earth" — the bridge a project or call spans.
export function Bridge({ ids }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-ink-2">
      {ids.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && <span className="text-ink-3">×</span>}
          <span className="inline-flex items-center gap-1.5">
            <DisciplineDot id={id} />
            {disciplineById[id]?.short}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}
