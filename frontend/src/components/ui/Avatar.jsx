import React from 'react';
import { initials } from '../../lib/format.js';
import { FIELD_BY_ID as disciplineById } from '../../data/modes.js';

export default function Avatar({ name, photo, field, size = 'h-8 w-8 text-xs', ring = false }) {
  const bg = disciplineById[field]?.color || 'rgb(var(--ink-2))';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium text-white ${size} ${ring ? 'ring-2 ring-surface' : ''}`}
      style={{ background: photo ? undefined : bg }}
      title={name}
    >
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : initials(name)}
    </span>
  );
}

export function AvatarStack({ people, max = 4 }) {
  return (
    <span className="flex -space-x-2">
      {people.slice(0, max).map((p) => (
        <Avatar key={p.handle || p.name} name={p.name} field={p.fields?.[0]} size="h-6 w-6 text-[0.6rem]" ring />
      ))}
    </span>
  );
}
