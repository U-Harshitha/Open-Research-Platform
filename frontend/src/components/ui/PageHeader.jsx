import React from 'react';

export default function PageHeader({ eyebrow, title, intro, children, aside }) {
  return (
    <div className="border-b border-rule bg-surface">
      <div className="mx-auto max-w-page px-4 pb-10 pt-12 sm:px-6 lg:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{title}</h1>
            {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">{intro}</p>}
          </div>
          {aside}
        </div>
        {children}
      </div>
    </div>
  );
}
