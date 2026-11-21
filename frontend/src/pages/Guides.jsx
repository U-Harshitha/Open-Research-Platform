import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { GUIDES, guideBySlug } from '../data/guides.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import NotFound from './NotFound.jsx';

export default function Guides() {
  const [first, ...rest] = GUIDES;
  return (
    <>
      <PageHeader
        eyebrow="Guides"
        title="Learn to write research"
        intro="Short, practical guides for students, independent researchers and anyone writing their first paper. Five minutes each, no jargon you can avoid."
      />
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6">
        <Link to={`/guides/${first.slug}`} className="group grid gap-6 rounded-2xl border border-rule bg-surface p-7 transition-shadow hover:shadow-lift sm:p-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">{first.level} · {first.minutes} min</p>
            <h2 className="display mt-3 text-3xl leading-tight group-hover:text-accent sm:text-4xl">{first.title}</h2>
            <p className="mt-3 max-w-xl text-ink-2">{first.summary}</p>
          </div>
          <span className="btn-primary self-start md:self-end">Read <ArrowRight className="h-4 w-4" /></span>
        </Link>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="group flex flex-col rounded-xl border border-rule bg-surface p-6 transition-shadow hover:shadow-lift">
              <p className="eyebrow">{g.level} · {g.minutes} min</p>
              <h3 className="display mt-3 text-xl leading-snug group-hover:text-accent">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{g.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export function Guide() {
  const { slug } = useParams();
  const guide = guideBySlug[slug];
  if (!guide) return <NotFound />;
  const i = GUIDES.indexOf(guide);
  const next = GUIDES[(i + 1) % GUIDES.length];
  return (
    <article className="mx-auto max-w-page px-4 pb-10 pt-10 sm:px-6 lg:pt-14">
      <Link to="/guides" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All guides
      </Link>
      <div className="mx-auto mt-10 max-w-measure">
        <p className="eyebrow">{guide.level} · {guide.minutes} min read</p>
        <h1 className="display mt-4 text-4xl leading-[1.08] sm:text-5xl">{guide.title}</h1>
        <p className="mt-4 font-serif text-xl italic leading-relaxed text-ink-2">{guide.summary}</p>
        <hr className="my-10 border-rule" />
        <div className="prose-paper" dangerouslySetInnerHTML={{ __html: guide.body }} />
        <Link to={`/guides/${next.slug}`} className="group mt-16 block rounded-xl border border-rule bg-surface p-6">
          <p className="eyebrow">Next guide</p>
          <p className="display mt-2 flex items-center justify-between text-2xl group-hover:text-accent">
            {next.title} <ArrowRight className="h-5 w-5" />
          </p>
        </Link>
      </div>
    </article>
  );
}
