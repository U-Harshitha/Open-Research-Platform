import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PROJECTS, researcherByHandle } from '../data/samples.js';
import DisciplineTag from '../components/ui/DisciplineTag.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import ProjectCard from '../components/ui/ProjectCard.jsx';
import SampleNotice from '../components/ui/SampleNotice.jsx';
import NotFound from './NotFound.jsx';

export default function Profile() {
  const { handle } = useParams();
  const person = researcherByHandle[handle];
  if (!person) return <NotFound />;

  const projects = PROJECTS.filter((p) => p.contributors.some((c) => c.handle === handle));
  const roleCounts = {};
  projects.forEach((p) =>
    p.contributors.find((c) => c.handle === handle)?.roles.forEach((r) => (roleCounts[r] = (roleCounts[r] || 0) + 1))
  );
  const roles = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-page px-4 py-10 sm:px-6 lg:py-14">
      <SampleNotice className="mb-10 max-w-xl" />
      <div className="grid gap-12 lg:grid-cols-[18rem_1fr]">
        <aside>
          <Avatar name={person.name} field={person.fields[0]} size="h-24 w-24 text-2xl" />
          <h1 className="display mt-5 text-3xl">{person.name}</h1>
          <p className="mt-1 text-ink-2">{person.role}</p>
          <p className="text-sm text-ink-3">{person.affiliation}</p>
          {person.open && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-signal-soft px-3 py-1 text-xs font-medium text-signal">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" /> Open to collaborate
            </p>
          )}
          <p className="mt-5 font-serif text-lg leading-relaxed">{person.bio}</p>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {person.fields.map((f) => <DisciplineTag key={f} id={f} />)}
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule text-center">
            <div className="bg-surface p-4"><dt className="eyebrow">Projects</dt><dd className="display mt-1 text-2xl">{projects.length}</dd></div>
            <div className="bg-surface p-4"><dt className="eyebrow">Roles</dt><dd className="display mt-1 text-2xl">{roles.length}</dd></div>
          </dl>
        </aside>
        <div className="min-w-0 space-y-12">
          <section>
            <p className="eyebrow mb-4">Contributions by CRediT role</p>
            <div className="flex flex-wrap gap-2">
              {roles.map(([r, n]) => (
                <span key={r} className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3 py-1 text-sm">
                  {r} <span className="font-mono text-2xs text-ink-3">×{n}</span>
                </span>
              ))}
            </div>
          </section>
          <section>
            <p className="eyebrow mb-2">Projects</p>
            {projects.map((p) => <ProjectCard key={p.slug} project={p} variant="row" />)}
          </section>
        </div>
      </div>
    </div>
  );
}
