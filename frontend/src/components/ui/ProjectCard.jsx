import React from 'react';
import { Link } from 'react-router-dom';
import { GitFork, MessageSquare, Users } from 'lucide-react';
import StageMeter from './StageMeter.jsx';
import { Bridge } from './DisciplineTag.jsx';
import { AvatarStack } from './Avatar.jsx';
import { researcherByHandle } from '../../data/samples.js';
import { compact, relativeDate } from '../../lib/format.js';

export default function ProjectCard({ project, variant = 'card' }) {
  const people = project.contributors.map((c) => researcherByHandle[c.handle]).filter(Boolean);
  const openQs = project.questions.filter((q) => q.status === 'open').length;

  if (variant === 'row') {
    return (
      <Link
        to={`/p/${project.slug}`}
        className="group grid gap-3 border-b border-rule py-6 transition-colors first:border-t sm:grid-cols-[1fr_auto] sm:gap-8"
      >
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Bridge ids={project.disciplines} />
            <StageMeter stage={project.stage} />
          </div>
          <h3 className="display text-xl leading-snug group-hover:text-accent sm:text-[1.4rem]">{project.title}</h3>
          <p className="mt-1.5 max-w-measure text-sm leading-relaxed text-ink-2">{project.question}</p>
          {project.seeking.length > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-signal">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              Seeking: {project.seeking.join(' · ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-5 text-xs text-ink-3 sm:flex-col sm:items-end sm:justify-between sm:gap-2">
          <AvatarStack people={people} />
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1" title="Followers"><Users className="h-3.5 w-3.5" />{compact(project.followers)}</span>
            <span className="inline-flex items-center gap-1" title="Built on"><GitFork className="h-3.5 w-3.5" />{project.builtOn}</span>
            <span className="inline-flex items-center gap-1" title="Open questions"><MessageSquare className="h-3.5 w-3.5" />{openQs}</span>
          </span>
          <span className="font-mono text-2xs">{project.version} · {relativeDate(project.updated)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/p/${project.slug}`}
      className="group flex h-full flex-col rounded-xl border border-rule bg-surface p-5 transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center justify-between gap-3">
        <Bridge ids={project.disciplines} />
        <span className="font-mono text-2xs text-ink-3">{project.version}</span>
      </div>
      <h3 className="display mt-4 text-[1.3rem] leading-snug group-hover:text-accent">{project.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">{project.question}</p>
      <div className="mt-auto pt-5">
        {project.seeking.length > 0 && (
          <p className="mb-3 truncate text-xs font-medium text-signal">● Seeking {project.seeking[0]}</p>
        )}
        <div className="flex items-center justify-between border-t border-rule pt-3">
          <StageMeter stage={project.stage} />
          <AvatarStack people={people} max={3} />
        </div>
      </div>
    </Link>
  );
}
