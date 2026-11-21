import React from 'react';
import { STAGES, stageById } from '../../data/catalog.js';

// Six ticks, filled up to the project's current stage.
export default function StageMeter({ stage, showLabel = true, size = 'sm' }) {
  const current = stageById[stage]?.index ?? 0;
  const tick = size === 'lg' ? 'h-1.5 w-6' : 'h-1 w-3';
  return (
    <span className="inline-flex items-center gap-2" title={`Stage: ${stageById[stage]?.label}`}>
      <span className="inline-flex gap-[3px]" aria-hidden="true">
        {STAGES.map((s, i) => (
          <span
            key={s.id}
            className={`${tick} rounded-full ${i <= current ? (stage === 'published' ? 'bg-accent' : 'bg-ink') : 'bg-rule'}`}
          />
        ))}
      </span>
      {showLabel && <span className="font-mono text-2xs uppercase tracking-[0.12em] text-ink-2">{stageById[stage]?.label}</span>}
    </span>
  );
}
