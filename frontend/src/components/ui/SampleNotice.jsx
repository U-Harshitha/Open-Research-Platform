import React from 'react';
import { Info } from 'lucide-react';
import { useMode } from '../../context/ModeContext.jsx';

export default function SampleNotice({ className = '' }) {
  const { m } = useMode();
  return (
    <p className={`flex items-start gap-2 rounded-lg border border-dashed border-rule bg-surface/60 px-3 py-2 text-xs text-ink-2 ${className}`}>
      <Info className="mt-px h-3.5 w-3.5 shrink-0 text-ink-3" />
      Sample {m.nouns} and {m.peopleLabel}, shown so you can see how the platform works. The public index fills as people publish.
    </p>
  );
}
