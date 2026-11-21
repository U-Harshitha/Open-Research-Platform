import React from 'react';
import { useXray } from '../../context/XrayContext.jsx';

export const ScanIcon = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M3 8V4h4M21 8V4h-4M3 16v4h4M21 16v4h-4M8 12h8M12 8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Small pill pinned to the bottom-left corner of the public pages.
export function XrayCorner() {
  const { open, toggle } = useXray();
  if (open) return null;
  return (
    <button
      onClick={toggle}
      className="fixed bottom-3 left-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface/90 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-3 shadow-sm backdrop-blur transition-colors hover:border-ink-3 hover:text-ink"
      title="See how this site works under the hood"
      aria-label="Open X-ray: how this site works"
    >
      <ScanIcon /> X-ray
    </button>
  );
}

// Compact icon button for the workspace top bar.
export function XrayIconButton() {
  const { open, toggle } = useXray();
  return (
    <button onClick={toggle} className={`icon-btn ${open ? 'bg-sunken text-ink' : ''}`} title="X-ray: how this works" aria-pressed={open} aria-label="Toggle X-ray">
      <ScanIcon className="h-4 w-4" />
    </button>
  );
}
