import React from 'react';

// Collaborators' cursors drifting over the page, each on its own looping path.
const PEOPLE = [
  { name: 'Amara', color: '#B23A3A', path: 'cursor-a' },
  { name: 'Ravi', color: '#4B5567', path: 'cursor-b' },
  { name: 'Mei · remote sensing', color: '#1F7A80', path: 'cursor-c' },
];

export default function LiveCursors({ people = PEOPLE }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden sm:block" aria-hidden="true">
      {people.map((p) => (
        <div key={p.name} className={`live-cursor ${p.path}`}>
          <svg width="18" height="20" viewBox="0 0 18 20">
            <path d="M1 1l15 8-6.5 1.8L6.5 18z" fill={p.color} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span className="ml-3 -mt-1 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[0.65rem] font-medium text-white shadow-sm" style={{ background: p.color }}>
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
}
