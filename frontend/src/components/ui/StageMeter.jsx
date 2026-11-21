import React from 'react';
import { stageInfo } from '../../data/modes.js';

// Six ticks, filled up to the current stage (research or stories lifecycle).
export default function StageMeter({ stage, showLabel = true, size = 'sm' }) {
  const info = stageInfo(stage);
  const last = info.index === info.list.length - 1;
  const tick = size === 'lg' ? 'h-1.5 w-6' : 'h-1 w-3';
  return (
    <span className="inline-flex items-center gap-2" title={`Stage: ${info.label}`}>
      <span className="inline-flex gap-[3px]" aria-hidden="true">
        {info.list.map((s, i) => (
          <span
            key={s.id}
            className={`${tick} rounded-full transition-colors duration-500 ${i <= info.index ? (last ? 'bg-accent' : 'bg-ink') : 'bg-rule'}`}
            style={{ transitionDelay: `${i * 60}ms` }}
          />
        ))}
      </span>
      {showLabel && <span className="font-mono text-2xs uppercase tracking-[0.12em] text-ink-2">{info.label}</span>}
    </span>
  );
}
