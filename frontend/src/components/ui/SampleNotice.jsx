import React from 'react';
import { Info } from 'lucide-react';
import { SAMPLE_NOTICE } from '../../data/samples.js';

export default function SampleNotice({ className = '' }) {
  return (
    <p className={`flex items-start gap-2 rounded-lg border border-dashed border-rule bg-surface/60 px-3 py-2 text-xs text-ink-2 ${className}`}>
      <Info className="mt-px h-3.5 w-3.5 shrink-0 text-ink-3" />
      {SAMPLE_NOTICE}
    </p>
  );
}
