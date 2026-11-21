import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Cover from './Cover.jsx';
import StageMeter from './StageMeter.jsx';

// A horizontally scrolling shelf of covers.
export default function Shelf({ projects }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 pt-2 sm:-mx-6 sm:px-6">
        {projects.map((p) => (
          <div key={p.slug} className="w-44 shrink-0 snap-start">
            <Cover project={p} to={`/p/${p.slug}`} />
            <p className="mt-3 line-clamp-2 text-sm font-medium leading-snug">{p.title}</p>
            <div className="mt-1.5"><StageMeter stage={p.stage} /></div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-end gap-2">
        <button onClick={() => scroll(-1)} className="icon-btn border border-rule" aria-label="Scroll shelf left"><ChevronLeft className="h-4 w-4" /></button>
        <button onClick={() => scroll(1)} className="icon-btn border border-rule" aria-label="Scroll shelf right"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
