import React from 'react';

export function LogoMark({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="rgb(var(--ink))" />
      <path d="M9 22 L16 9 L23 22 Z" fill="none" stroke="rgb(var(--paper))" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="16" cy="9" r="3.2" fill="rgb(var(--mark))" />
      <circle cx="9" cy="22" r="3.2" fill="rgb(var(--paper))" />
      <circle cx="23" cy="22" r="3.2" fill="rgb(var(--paper))" />
    </svg>
  );
}

export default function Logo({ compact = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className="block font-serif text-[1.15rem] font-medium tracking-tight text-ink">
          Research Nexus
        </span>
        {!compact && (
          <span className="mt-0.5 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-3">
            Open · Versioned · Shared
          </span>
        )}
      </span>
    </span>
  );
}
