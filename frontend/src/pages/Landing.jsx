import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, GitFork, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { CREDIT_ROLES, DISCIPLINES, PARALLELS, STAGES, TEMPLATES } from '../data/catalog.js';
import { CALLS, PROJECTS, projectBySlug } from '../data/samples.js';
import ProjectCard from '../components/ui/ProjectCard.jsx';
import DisciplineTag, { Bridge, DisciplineDot } from '../components/ui/DisciplineTag.jsx';
import SampleNotice from '../components/ui/SampleNotice.jsx';

function useStart() {
  const { user, openAuth } = useAuth();
  const navigate = useNavigate();
  return () => (user ? navigate('/new') : openAuth({ mode: 'signup', reason: 'Create a free account to start your first project.' }));
}

export default function Landing() {
  const start = useStart();
  return (
    <>
      <Hero onStart={start} />
      <Parallels />
      <Lifecycle />
      <Bridges />
      <Featured />
      <StartWriting onStart={start} />
      <Credit />
      <Closing onStart={start} />
    </>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero({ onStart }) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--rule)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--rule)) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 70% 40%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 70% 40%, black, transparent)',
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-page items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
        <div className="animate-rise">
          <p className="eyebrow mb-6 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            Open research, across every discipline
          </p>
          <h1 className="display text-[2.75rem] leading-[1.03] sm:text-6xl lg:text-[4.4rem]">
            Research is better <span className="italic">written</span> <span className="marker">together.</span>
          </h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-ink-2">
            Draft papers with collaborators, publish your data and methods alongside them, take open peer review,
            and let others build on your work — the way open source builds on code.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button onClick={onStart} className="btn-primary px-5 py-3 text-[0.95rem]">
              Start a project <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/explore" className="btn-secondary px-5 py-3 text-[0.95rem]">
              Explore research
            </Link>
          </div>
          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            {['Free and open source', 'Every version kept', 'Credit by contributor role'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <ManuscriptPreview />
      </div>
    </section>
  );
}

// A live-looking manuscript: versioned, multi-author, annotated by someone
// from another field. It is the product in one picture.
function ManuscriptPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[34rem] animate-rise [animation-delay:120ms] lg:mr-0">
      <div className="absolute -right-3 -top-3 hidden h-full w-full rotate-[2.2deg] rounded-[6px] border border-rule bg-surface/70 sm:block" aria-hidden="true" />
      <div className="relative rounded-[6px] border border-rule bg-surface shadow-sheet">
        <div className="flex items-center justify-between border-b border-rule px-5 py-2.5 font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2F7D5B]" /> v0.6 · saved just now
          </span>
          <span className="hidden normal-case tracking-normal text-signal sm:inline">● Seeking a GIS analyst</span>
        </div>
        <div className="px-6 pb-7 pt-6 sm:px-8">
          <Bridge ids={['health', 'earth']} />
          <h2 className="display mt-3 text-[1.55rem] leading-tight sm:text-[1.75rem]">
            Urban heat islands and childhood asthma admissions
          </h2>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-2">
            A. Okafor<sup className="text-accent">1,4</sup>, R. Iyer<sup className="text-accent">2,3</sup>, M. Chen<sup className="text-accent">5</sup>
            <span className="ml-2 font-mono text-[0.65rem] text-ink-3">¹Conceptualization ²Methodology ³Formal analysis ⁴Writing ⁵Visualization</span>
          </p>
          <div className="mt-5 border-t border-rule pt-4">
            <p className="eyebrow mb-2">Abstract</p>
            <p className="font-serif text-[0.98rem] leading-relaxed text-ink">
              Cities warm unevenly. Blocks with little tree cover can run several degrees hotter than parks a kilometre
              away, and{' '}
              <span className="rounded-sm bg-mark/60 px-0.5">those same blocks often carry more traffic pollution</span>.
              We link five years of paediatric admissions to satellite land-surface temperature…
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-rule bg-paper/60 px-5 py-3 text-xs text-ink-2">
          <span className="chip"><GitFork className="h-3 w-3" /> Built on by 2</span>
          <span className="chip"><MessageSquareQuote className="h-3 w-3" /> 3 open questions</span>
          <span className="chip border-signal/30 bg-signal-soft text-signal sm:hidden">● Seeking a GIS analyst</span>
        </div>
      </div>

      {/* Margin note from another discipline */}
      <div className="relative z-10 -mt-8 ml-auto w-[78%] rounded-lg border border-rule bg-surface p-3.5 shadow-lift sm:absolute sm:-bottom-[5.5rem] sm:-right-6 sm:mt-0 sm:w-60 lg:-right-10">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1F7A80] text-[0.6rem] font-medium text-white">MC</span>
          <div className="leading-tight">
            <p className="text-xs font-medium">M. Chen</p>
            <p className="text-[0.65rem] text-ink-3">Remote sensing · joined via open call</p>
          </div>
        </div>
        <p className="mt-2 text-[0.8rem] leading-snug text-ink-2">
          <span className="mb-1 block border-l-2 border-mark pl-2 font-serif text-[0.72rem] italic text-ink-3">on “those same blocks…”</span>
          Land-surface temp ≠ air temp at child height. I can add a downscaled air-temperature layer — want a proposed revision?
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Parallels */

function Section({ eyebrow, title, intro, children, className = '', id }) {
  return (
    <section id={id} className={`mx-auto max-w-page px-4 py-20 sm:px-6 lg:py-24 ${className}`}>
      <div className="mb-12 grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
        <div>
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h2 className="display text-[2rem] leading-[1.1] sm:text-[2.6rem]">{title}</h2>
        </div>
        {intro && <p className="max-w-lg text-base leading-relaxed text-ink-2 lg:justify-self-end">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

function Parallels() {
  return (
    <div className="border-y border-rule bg-surface">
      <Section
        eyebrow="§1 · The model"
        title={<>If you know open source, you already know how this works.</>}
        intro="Open source changed software by making work visible, forkable and creditable. Research deserves the same tools — named for how researchers actually work."
      >
        <div className="grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
          {PARALLELS.map((p, i) => (
            <div key={p.code} className="border-b border-r border-rule p-6 sm:p-7">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-ink-3 line-through decoration-ink-3/40">{p.code}</span>
                <span className="font-mono text-2xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="display mt-3 text-2xl">{p.research}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.note}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------- Lifecycle */

function Lifecycle() {
  return (
    <Section
      eyebrow="§2 · The lifecycle"
      title={<>Share at the stage when feedback still changes the work.</>}
      intro="Traditional publishing only sees the last step, when it is too late to fix the design. Here a project is public from the first idea — and every stage leaves a citable record."
    >
      <ol className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-6">
        {STAGES.map((s, i) => (
          <li key={s.id} className={`relative flex flex-col bg-surface p-5 ${s.id === 'published' ? 'bg-sunken' : ''}`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-2xs ${s.id === 'published' ? 'bg-sunken text-ink-3 ring-1 ring-rule' : 'bg-ink text-paper'}`}>
                {i + 1}
              </span>
              <span className="h-px flex-1 bg-rule" />
            </div>
            <p className="display mt-4 text-xl">{s.label}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.blurb}</p>
            {s.id === 'published' && (
              <p className="mt-4 font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">← Where journals start</p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* --------------------------------------------------------------- Bridges */

function Bridges() {
  return (
    <div className="border-y border-rule bg-surface">
      <Section
        eyebrow="§3 · Across disciplines"
        title={<>Find the collaborator your question is missing.</>}
        intro="The most interesting questions sit between fields. Projects post open calls for the expertise they lack — a statistician, an archivist, someone with lake sensor data — and anyone can answer."
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow mb-4">Browse by field</p>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map((d) => (
                <DisciplineTag key={d.id} id={d.id} as={Link} to={`/explore?field=${d.id}`} />
              ))}
            </div>
            <Link to="/collaborate" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              See all open calls <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {CALLS.slice(0, 3).map((c) => {
              const p = projectBySlug[c.project];
              return (
                <Link key={c.id} to={`/p/${p.slug}`} className="group grid gap-3 rounded-xl border border-rule bg-paper/50 p-5 transition-colors hover:border-ink-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs">
                      <DisciplineDot id={c.from} /> <span className="text-ink-3">{p.disciplines.length > 1 ? 'needs' : 'seeks'}</span>
                      <ArrowRight className="h-3 w-3 text-ink-3" /> <DisciplineDot id={c.toward} />
                    </p>
                    <p className="display mt-2 text-lg leading-snug group-hover:text-accent">{c.role}</p>
                    <p className="mt-1 truncate text-sm text-ink-2">for “{p.title}”</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:max-w-[13rem] sm:justify-end">
                    {c.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full bg-sunken px-2 py-0.5 text-2xs text-ink-2">{s}</span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------- Featured */

function Featured() {
  return (
    <Section
      eyebrow="§4 · In the open"
      title="Recently updated"
      intro={<SampleNotice />}
    >
      <div>
        {PROJECTS.slice(0, 4).map((p) => (
          <ProjectCard key={p.slug} project={p} variant="row" />
        ))}
      </div>
      <Link to="/explore" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
        Explore all projects <ArrowRight className="h-4 w-4" />
      </Link>
    </Section>
  );
}

/* --------------------------------------------------------- Start writing */

function StartWriting({ onStart }) {
  return (
    <div className="border-y border-rule bg-surface">
      <Section
        eyebrow="§5 · For first-time researchers"
        title={<>Never written a paper? Start from a structure that works.</>}
        intro="Every template explains what each section is for. Pair it with our short guides, and share a draft early — the community is here to help, not to gatekeep."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={onStart}
              className="group flex flex-col rounded-xl border border-rule bg-paper/50 p-5 text-left transition-colors hover:border-ink-3 hover:bg-surface"
            >
              <span className="font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">{t.kind}</span>
              <span className="display mt-2 text-xl group-hover:text-accent">{t.name}</span>
              <span className="mt-1.5 text-sm leading-relaxed text-ink-2">{t.blurb}</span>
              {t.sections.length > 0 && (
                <span className="mt-4 flex flex-wrap gap-1">
                  {t.sections.map((s) => (
                    <span key={s} className="rounded border border-rule px-1.5 py-0.5 font-mono text-[0.6rem] text-ink-3">{s}</span>
                  ))}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-ink-3">Short guides:</span>
          <Link to="/guides/first-paper" className="text-ink-2 hover:text-accent">Your first paper</Link>
          <Link to="/guides/abstracts" className="text-ink-2 hover:text-accent">Writing an abstract</Link>
          <Link to="/guides/preregistration" className="text-ink-2 hover:text-accent">Preregistration</Link>
          <Link to="/guides" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">All guides <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </Section>
    </div>
  );
}

/* ---------------------------------------------------------------- Credit */

function Credit() {
  const points = [
    ['Contributor roles, not just author order', 'Every project lists who did what using CRediT, the 14-role taxonomy many journals already require.'],
    ['Reviews are contributions too', 'Signed open reviews appear on the reviewer’s profile, so careful reviewing builds a reputation.'],
    ['Building on work cites it', 'Replications and extensions stay linked to the original, so credit flows both ways.'],
  ];
  return (
    <Section
      eyebrow="§6 · Credit"
      title={<>Credit for the work, not just the byline.</>}
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-8">
          {points.map(([t, d]) => (
            <div key={t} className="grid grid-cols-[auto_1fr] gap-4">
              <span className="mt-2 h-px w-6 bg-ink" />
              <div>
                <p className="font-serif text-xl">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-rule bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">CRediT · Contributor Roles Taxonomy</p>
            <a href="https://credit.niso.org" target="_blank" rel="noreferrer" className="text-ink-3 hover:text-ink" aria-label="About CRediT">
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {CREDIT_ROLES.map((r, i) => (
              <span
                key={r}
                className={`rounded-full border px-3 py-1 text-sm ${[0, 5, 7, 12].includes(i) ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-2'}`}
              >
                {r}
              </span>
            ))}
          </div>
          <p className="mt-5 border-t border-rule pt-4 text-xs text-ink-3">
            Highlighted: the roles one contributor claimed on a sample project.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- Closing */

function Closing({ onStart }) {
  return (
    <section className="mx-auto max-w-page px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-ink px-6 py-14 text-paper sm:px-12 sm:py-16">
        <div className="relative max-w-2xl">
          <h2 className="font-serif text-[2rem] font-medium leading-[1.1] tracking-tight sm:text-5xl">
            Your question might be someone else’s missing piece.
          </h2>
          <p className="mt-5 max-w-lg text-paper/70">
            Post an idea, a half-written draft, or a dataset nobody has looked at yet. Research moves faster when it moves in the open.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={onStart} className="btn bg-paper px-5 py-3 text-ink hover:bg-mark">
              Start a project <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/collaborate" className="btn border border-paper/25 px-5 py-3 text-paper hover:border-paper/60">
              Answer an open call
            </Link>
          </div>
        </div>
        <svg className="pointer-events-none absolute -right-10 -top-10 hidden h-[26rem] w-[26rem] text-paper/10 md:block" viewBox="0 0 200 200" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="0.8">
            <path d="M40 150 L100 40 L160 150 Z" />
            <path d="M100 40 L100 150 M40 150 L130 95 M160 150 L70 95" />
          </g>
          <circle cx="100" cy="40" r="7" fill="rgb(var(--mark))" />
          <g fill="currentColor"><circle cx="40" cy="150" r="5" /><circle cx="160" cy="150" r="5" /><circle cx="100" cy="150" r="3" /><circle cx="130" cy="95" r="3" /><circle cx="70" cy="95" r="3" /></g>
        </svg>
      </div>
    </section>
  );
}
