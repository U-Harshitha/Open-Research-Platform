import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// Hand-drawn style stickers for Stories mode. Purely decorative.
const PATHS = {
  star: <path d="M24 3l5.6 13.4L44 17.5l-11 9.6 3.4 14.4L24 33.8 11.6 41.5 15 27.1 4 17.5l14.4-1.1z" />,
  heart: <path d="M24 42S5 30.5 5 17.5C5 11 10 6 16 6c3.8 0 6.6 2 8 4.8C25.4 8 28.2 6 32 6c6 0 11 5 11 11.5C43 30.5 24 42 24 42z" />,
  moon: <path d="M30 4a20 20 0 1 0 14 30A16 16 0 0 1 30 4z" />,
  bolt: <path d="M27 2L8 27h13l-4 19 21-27H25z" />,
  sparkle: <path d="M24 2c2 11 6 16 20 22-14 6-18 11-20 22-2-11-6-16-20-22C18 18 22 13 24 2z" />,
  quill: <path d="M42 4C24 6 12 18 8 38l-3 6 6-3c4-1 8-3 11-6l-6-1 9-3c6-4 13-12 17-27z" />,
};

export function Sticker({ kind = 'star', color = 'rgb(var(--mark))', size = 44, rotate = 0, className = '', label }) {
  return (
    <span className={`sticker ${className}`} style={{ '--rot': `${rotate}deg` }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width={size} height={size} fill={color} stroke="rgb(var(--ink))" strokeWidth="2" strokeLinejoin="round">
        {PATHS[kind]}
      </svg>
      {label && <span className="sticker-label">{label}</span>}
    </span>
  );
}

export function Tape({ className = '', rotate = -4 }) {
  return <span className={`tape ${className}`} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true" />;
}

// A sticky note that pops in once per browser.
export function PsstNote({ id, children, delay = 2200 }) {
  const key = `orn:psst:${id}`;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(key) === '1';
    } catch {
      /* ignore */
    }
    if (seen) return undefined;
    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [key, delay]);
  if (!open) return null;
  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="psst fixed bottom-14 right-4 z-30 w-64 sm:bottom-6 sm:right-6" role="status">
      <Tape className="left-1/2 -top-3 -translate-x-1/2" rotate={-3} />
      <button onClick={close} className="absolute right-2 top-2 text-ink-3 hover:text-ink" aria-label="Dismiss note"><X className="h-3.5 w-3.5" /></button>
      <div className="font-hand text-xl leading-snug text-ink">{children}</div>
    </div>
  );
}
