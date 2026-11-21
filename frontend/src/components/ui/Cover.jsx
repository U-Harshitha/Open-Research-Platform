import React from 'react';
import { Link } from 'react-router-dom';
import { FIELD_BY_ID, PEOPLE_BY_HANDLE, modeOfProject, stageInfo } from '../../data/modes.js';
import useTilt from '../motion/useTilt.js';

// Deterministic pseudo-random numbers from a string, so each cover is stable.
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function ResearchArt({ slug, a, b }) {
  const r = seeded(slug);
  const variant = Math.floor(r() * 3);
  if (variant === 0) {
    // concentric rings
    const cx = 40 + r() * 120, cy = 60 + r() * 120;
    return (
      <g fill="none" stroke={b} strokeWidth="1.2" opacity="0.55">
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={cx} cy={cy} r={14 + i * 16} />)}
        <circle cx={cx} cy={cy} r="7" fill={b} />
      </g>
    );
  }
  if (variant === 1) {
    // dot grid with a highlighted cluster
    const hx = Math.floor(r() * 8), hy = Math.floor(r() * 8);
    return (
      <g>
        {Array.from({ length: 64 }, (_, i) => {
          const x = i % 8, y = Math.floor(i / 8);
          const near = Math.abs(x - hx) + Math.abs(y - hy) < 3;
          return <circle key={i} cx={22 + x * 22} cy={40 + y * 22} r={near ? 5 : 2} fill={near ? b : a} opacity={near ? 0.9 : 0.45} />;
        })}
      </g>
    );
  }
  // diagonal bands
  const off = r() * 60;
  return (
    <g opacity="0.5">
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={-120 + i * 34 + off} y="-40" width="12" height="420" fill={i % 3 === 0 ? b : a} transform="rotate(28 100 150)" />
      ))}
    </g>
  );
}

function StoryArt({ slug, a, b }) {
  const r = seeded(slug);
  const variant = Math.floor(r() * 3);
  if (variant === 1) {
    // sea: rolling waves under a low sun
    const sy = 70 + r() * 50;
    return (
      <g>
        <circle cx={60 + r() * 80} cy={sy} r={30} fill={b} opacity="0.9" />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M-10 ${120 + i * 22} q 25 -14 50 0 t 50 0 t 50 0 t 50 0 t 50 0`} fill="none" stroke={i % 2 ? b : a} strokeWidth={i % 2 ? 2 : 6} opacity={0.35 + i * 0.08} />
        ))}
      </g>
    );
  }
  if (variant === 2) {
    // bloom: petals around a centre, like a pressed flower
    const cx = 100, cy = 105;
    return (
      <g>
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={cx} cy={cy - 46} rx="16" ry="40" fill={i % 2 ? b : a} opacity={i % 2 ? 0.75 : 0.6} transform={`rotate(${i * 36} ${cx} ${cy})`} />
        ))}
        <circle cx={cx} cy={cy} r="15" fill={b} />
      </g>
    );
  }
  const stars = Array.from({ length: 14 }, () => [r() * 200, r() * 170, 0.6 + r() * 1.8]);
  const hill = 190 + r() * 40;
  return (
    <g>
      <circle cx={50 + r() * 100} cy={70 + r() * 40} r={26 + r() * 14} fill={b} opacity="0.85" />
      {stars.map(([x, y, s], i) => (
        <path key={i} d={`M${x} ${y - s * 3} L${x + s} ${y - s} L${x + s * 3} ${y} L${x + s} ${y + s} L${x} ${y + s * 3} L${x - s} ${y + s} L${x - s * 3} ${y} L${x - s} ${y - s} Z`} fill={b} opacity="0.7" />
      ))}
      <path d={`M0 ${hill} Q 50 ${hill - 40} 100 ${hill - 10} T 200 ${hill - 30} V 300 H 0 Z`} fill={a} opacity="0.55" />
      <path d={`M0 ${hill + 30} Q 60 ${hill + 5} 120 ${hill + 25} T 200 ${hill + 15} V 300 H 0 Z`} fill={a} opacity="0.8" />
    </g>
  );
}

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
};

export function CoverArt({ project, className = '' }) {
  const stories = modeOfProject(project) === 'stories';
  const base = FIELD_BY_ID[project.disciplines?.[0]]?.color || '#444';
  const second = FIELD_BY_ID[project.disciplines?.[1]]?.color || shade(base, 60);
  const lead = PEOPLE_BY_HANDLE[project.lead]?.name || '';
  return (
    <svg viewBox="0 0 200 300" className={className} role="img" aria-label={`Cover: ${project.title}`}>
      <rect width="200" height="300" fill={stories ? shade(base, -10) : base} />
      {stories ? <StoryArt slug={project.slug} a={shade(base, -45)} b="#FFE7A8" /> : <ResearchArt slug={project.slug} a={shade(base, 70)} b={second} />}
      <rect x="0" y="0" width="7" height="300" fill="#000" opacity="0.12" />
      <foreignObject x="16" y={stories ? 196 : 16} width="170" height="96">
        <div xmlns="http://www.w3.org/1999/xhtml" className="cover-title">{project.title}</div>
      </foreignObject>
      <text x="16" y="286" className="cover-meta" fill="#fff" opacity="0.8">{lead.toUpperCase()}</text>
      <text x="184" y="286" textAnchor="end" className="cover-meta" fill="#fff" opacity="0.6">{stageInfo(project.stage).label.toUpperCase()}</text>
    </svg>
  );
}

// A book-like cover that tilts under the pointer (inspired by editorial book sites).
export default function Cover({ project, size = 'md', to }) {
  const tilt = useTilt();
  const w = { sm: 'w-32', lg: 'w-56', fluid: 'w-full max-w-[11rem]' }[size] || 'w-44';
  const card = (
    <div {...tilt} className={`cover group ${w}`}>
      <div className="cover-inner">
        <CoverArt project={project} className="block h-auto w-full" />
        <span className="cover-shine" aria-hidden="true" />
      </div>
    </div>
  );
  return to ? <Link to={to} aria-label={project.title} className="inline-block">{card}</Link> : card;
}
