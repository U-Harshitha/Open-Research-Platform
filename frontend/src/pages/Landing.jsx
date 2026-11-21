import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, GitFork, Library, Mail, MessageCircle, MessageSquareQuote, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMode } from '../context/ModeContext.jsx';
import { PROJECT_BY_SLUG } from '../data/modes.js';
import DisciplineTag, { Bridge, DisciplineDot } from '../components/ui/DisciplineTag.jsx';
import SampleNotice from '../components/ui/SampleNotice.jsx';
import Shelf from '../components/ui/Shelf.jsx';
import Cover from '../components/ui/Cover.jsx';
import { Sticker, Tape } from '../components/ui/Stickers.jsx';
import Reveal from '../components/motion/Reveal.jsx';
import LiveCursors from '../components/motion/LiveCursors.jsx';

const COPY = {
  research: {
    eyebrow: 'Open research, across every discipline',
    title: (
      <>
        Research is better <span className="italic">written</span> <span className="marker">together.</span>
      </>
    ),
    lede: 'Draft papers with collaborators, publish your data and methods alongside them, take open peer review, and let others build on your work — the way open source builds on code.',
    ticks: ['Free and open source', 'Every version kept', 'Credit by contributor role'],
    cta: 'Start a project',
    parallelsTitle: 'If you know open source, you already know how this works.',
    parallelsIntro: 'Open source changed software by making work visible, forkable and creditable. Research deserves the same tools — named for how researchers actually work.',
    stagesTitle: 'Share at the stage when feedback still changes the work.',
    stagesIntro: 'Traditional publishing only sees the last step, when it is too late to fix the design. Here a project is public from the first idea.',
    bridgesTitle: 'Find the collaborator your question is missing.',
    bridgesIntro: 'The most interesting questions sit between fields. Projects post open calls for the expertise they lack — and anyone can answer.',
    shelfTitle: 'On the shelf',
    startTitle: 'Never written a paper? Start from a structure that works.',
    startIntro: 'Every template explains what each section is for. Pair it with a short guide, and share a draft early.',
    closing: 'Your question might be someone else’s missing piece.',
    closingSub: 'Post an idea, a half-written draft, or a dataset nobody has looked at yet.',
    library: 'Search 250M+ papers on OpenAlex: citations per year, references, who cites what, and alerts when new work cites a paper you watch.',
  },
  stories: {
    eyebrow: 'Fiction, poetry & memoir — written with company',
    title: (
      <>
        Every story needs a <span className="italic">first</span> <span className="marker">reader.</span>
      </>
    ),
    lede: 'Draft chapters with a co-writer, share the world bible, gather beta notes line by line, and let readers remix what you set free — with credits on every page.',
    ticks: ['Free to write and share', 'Every draft kept', 'Credits like a film'],
    cta: 'Start a story',
    parallelsTitle: 'Co-writing, borrowed from the way open source works.',
    parallelsIntro: 'Stories have always been collaborative — editors, first readers, illustrators. This gives that process a home and a memory.',
    stagesTitle: 'Show it before it’s finished.',
    stagesIntro: 'The best notes come early. Share a spark, an outline or a messy chapter — and see where readers lean in.',
    bridgesTitle: 'Find your co-writer, illustrator or first reader.',
    bridgesIntro: 'Writers post what they need. Answer a call, or post your own and see who turns up.',
    shelfTitle: 'Fresh off the desk',
    startTitle: 'Blank page? Start with a shape.',
    startIntro: 'Short stories, three-act outlines, character sheets, world bibles. Pick one, then let it go wherever it wants.',
    closing: 'Somebody out there is waiting to read your chapter two.',
    closingSub: 'Post a premise, a poem, or the first page you’ve been too shy to show anyone.',
    library: 'Find comparable titles on Open Library, read public-domain classics from Project Gutenberg, and hunt for the right word.',
  },
};

function useStart() {
  const { user, openAuth } = useAuth();
  const navigate = useNavigate();
  return () => (user ? navigate('/new') : openAuth({ mode: 'signup', reason: 'Create a free account to start writing.' }));
}

export default function Landing() {
  const { mode, m } = useMode();
  const c = COPY[mode];
  const start = useStart();
  return (
    <>
      <Hero c={c} mode={mode} onStart={start} />
      <Parallels c={c} m={m} />
      <Lifecycle c={c} m={m} />
      <Tools c={c} mode={mode} />
      <Bridges c={c} m={m} />
      <OnTheShelf c={c} m={m} />
      <StartWriting c={c} m={m} onStart={start} />
      <Credit m={m} mode={mode} />
      <Closing c={c} onStart={start} mode={mode} />
    </>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero({ c, mode, onStart }) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            mode === 'research'
              ? 'linear-gradient(rgb(var(--rule)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--rule)) 1px, transparent 1px)'
              : 'radial-gradient(rgb(var(--rule)) 1.2px, transparent 1.2px)',
          backgroundSize: mode === 'research' ? '56px 56px' : '22px 22px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 70% 40%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 70% 40%, black, transparent)',
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-page items-center gap-14 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-20">
        <div>
          <p className="eyebrow mb-6 flex items-center gap-2 animate-rise">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            {c.eyebrow}
          </p>
          <h1 className="display text-[2.75rem] leading-[1.03] animate-rise [animation-delay:60ms] sm:text-6xl lg:text-[4.4rem]">{c.title}</h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-ink-2 animate-rise [animation-delay:120ms]">{c.lede}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3 animate-rise [animation-delay:180ms]">
            <button onClick={onStart} className="btn-primary group px-5 py-3 text-[0.95rem]">
              {c.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <Link to="/explore" className="btn-secondary px-5 py-3 text-[0.95rem]">
              Explore
            </Link>
          </div>
          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2 animate-rise [animation-delay:240ms]">
            {c.ticks.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" /> {t}
              </li>
            ))}
          </ul>
        </div>
        {mode === 'research' ? <ManuscriptPreview /> : <StoryPreview />}
      </div>
    </section>
  );
}

const TYPED = 'those same blocks often carry more traffic pollution';

// Typed text and a margin note appearing on a loop.
function useTypingLoop() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setN(TYPED.length + 40);
    const id = setInterval(() => setN((v) => (v > TYPED.length + 90 ? 0 : v + 1)), 55);
    return () => clearInterval(id);
  }, []);
  return n;
}

function ManuscriptPreview() {
  const n = useTypingLoop();
  const typed = TYPED.slice(0, Math.min(n, TYPED.length));
  const done = n >= TYPED.length + 8;
  return (
    <div className="relative mx-auto w-full max-w-[34rem] animate-rise [animation-delay:120ms] lg:mr-0">
      <LiveCursors />
      <div className="absolute -right-3 -top-3 hidden h-full w-full rotate-[2.2deg] rounded-[6px] border border-rule bg-surface/70 sm:block" aria-hidden="true" />
      <div className="relative rounded-[6px] border border-rule bg-surface shadow-sheet">
        <div className="flex items-center justify-between border-b border-rule px-5 py-2.5 font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2F7D5B]" /> 3 editing · v0.6
          </span>
          <span className="hidden normal-case tracking-normal text-signal sm:inline">● Seeking a GIS analyst</span>
        </div>
        <div className="px-6 pb-7 pt-6 sm:px-8">
          <Bridge ids={['health', 'earth']} />
          <h2 className="display mt-3 text-[1.55rem] leading-tight sm:text-[1.75rem]">Urban heat islands and childhood asthma admissions</h2>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-2">
            A. Okafor<sup className="text-accent">1,4</sup>, R. Iyer<sup className="text-accent">2,3</sup>, M. Chen<sup className="text-accent">5</sup>
          </p>
          <div className="mt-5 border-t border-rule pt-4">
            <p className="eyebrow mb-2">Abstract</p>
            <p className="min-h-[7.5rem] font-reading text-[0.98rem] leading-relaxed text-ink">
              Cities warm unevenly. Blocks with little tree cover can run several degrees hotter than parks a kilometre away, and{' '}
              <span className={done ? 'rounded-sm bg-mark/60 px-0.5 transition-colors' : ''}>{typed}</span>
              {!done && <span className="typing-caret" />}
              {done && '. We link five years of paediatric admissions to satellite land-surface temperature…'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-rule bg-paper/60 px-5 py-3 text-xs text-ink-2">
          <span className="chip"><GitFork className="h-3 w-3" /> Built on by 2</span>
          <span className="chip"><MessageSquareQuote className="h-3 w-3" /> 3 open questions</span>
        </div>
      </div>
      {done && (
        <div className="pop-in relative z-10 -mt-6 ml-auto w-[78%] rounded-lg border border-rule bg-surface p-3.5 shadow-lift sm:absolute sm:-bottom-[5.5rem] sm:-right-6 sm:mt-0 sm:w-60 lg:-right-10">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1F7A80] text-[0.6rem] font-medium text-white">MC</span>
            <div className="leading-tight">
              <p className="text-xs font-medium">M. Chen</p>
              <p className="text-[0.65rem] text-ink-3">Remote sensing · joined via open call</p>
            </div>
          </div>
          <p className="mt-2 text-[0.8rem] leading-snug text-ink-2">
            <span className="mb-1 block border-l-2 border-mark pl-2 font-reading text-[0.72rem] italic text-ink-3">on “those same blocks…”</span>
            Land-surface temp ≠ air temp at child height. Want a downscaled layer?
          </p>
        </div>
      )}
    </div>
  );
}

function StoryPreview() {
  const picks = ['salt-and-lanterns', 'the-maintenance-crew', 'small-dragon-big-city'].map((s) => PROJECT_BY_SLUG[s]);
  return (
    <div className="relative mx-auto h-[25rem] w-full max-w-[32rem] animate-rise [animation-delay:120ms] sm:h-[28rem]">
      <div className="absolute left-[2%] top-10 -rotate-[9deg] transition-transform hover:-rotate-[4deg]"><Cover project={picks[1]} size="md" to={`/p/${picks[1].slug}`} /></div>
      <div className="absolute right-[4%] top-12 rotate-[8deg] transition-transform hover:rotate-[3deg]"><Cover project={picks[2]} size="md" to={`/p/${picks[2].slug}`} /></div>
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2"><Cover project={picks[0]} size="lg" to={`/p/${picks[0].slug}`} /></div>
      <Sticker kind="star" rotate={-14} size={54} className="float-slow absolute -left-2 top-0 z-20" />
      <Sticker kind="heart" color="#F28AA6" rotate={12} size={40} className="float-slow absolute right-2 top-2 z-20 [animation-delay:1.2s]" />
      <Sticker kind="sparkle" color="#B9A4F0" rotate={0} size={36} className="float-slow absolute bottom-16 left-6 z-20 [animation-delay:2s]" />
      <div className="pop-in absolute bottom-2 right-0 z-20 w-56 rotate-2 rounded-md border border-rule bg-[#FFF6C8] px-4 pb-3 pt-4 shadow-lift [animation-delay:900ms] sm:-right-4">
        <Tape className="-top-2.5 left-1/2 -translate-x-1/2" />
        <p className="font-hand text-[1.15rem] leading-snug">“Chapter 7 made me miss my stop.” — beta reader</p>
      </div>
      <div className="pop-in absolute bottom-6 left-0 z-20 -rotate-3 rounded-full bg-ink px-3 py-1.5 font-hand text-lg text-paper shadow-lift [animation-delay:1.4s]">
        draft 4 ✎ 3 co-writers
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Sections */

function Section({ eyebrow, title, intro, children, className = '' }) {
  return (
    <section className={`mx-auto max-w-page px-4 py-20 sm:px-6 lg:py-24 ${className}`}>
      <Reveal className="mb-12 grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
        <div>
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h2 className="display text-[2rem] leading-[1.1] sm:text-[2.6rem]">{title}</h2>
        </div>
        {intro && <div className="max-w-lg text-base leading-relaxed text-ink-2 lg:justify-self-end">{intro}</div>}
      </Reveal>
      {children}
    </section>
  );
}

function Parallels({ c, m }) {
  return (
    <div className="border-y border-rule bg-surface">
      <Section eyebrow="§1 · The model" title={c.parallelsTitle} intro={c.parallelsIntro}>
        <div className="grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
          {m.parallels.map((p, i) => (
            <Reveal key={p.code} delay={i} className="group border-b border-r border-rule p-6 transition-colors hover:bg-paper sm:p-7">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-ink-3 line-through decoration-ink-3/40">{p.code}</span>
                <span className="font-mono text-2xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="display mt-3 text-2xl transition-transform duration-300 group-hover:translate-x-1">{p.research}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.note}</p>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Lifecycle({ c, m }) {
  const last = m.stages.length - 1;
  return (
    <Section eyebrow="§2 · The lifecycle" title={c.stagesTitle} intro={c.stagesIntro}>
      <ol className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-6">
        {m.stages.map((s, i) => (
          <Reveal as="li" key={s.id} delay={i} className={`relative flex flex-col p-5 ${i === last ? 'bg-sunken' : 'bg-surface'}`}>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-2xs text-paper">{i + 1}</span>
              <span className="h-px flex-1 bg-rule" />
            </div>
            <p className="display mt-4 text-xl">{s.label}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.blurb}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

// Feature bento: small animated previews of the collaboration tools.
function Tools({ c, mode }) {
  return (
    <div className="border-y border-rule bg-surface">
      <Section
        eyebrow="§3 · The desk"
        title={mode === 'research' ? 'Everything a paper needs, in one room.' : 'Everything a story needs, on one desk.'}
        intro="A shared editor is only the start. Each project gets a library, a chat, an inbox for what changed — and a microphone, for when typing is too slow."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <Reveal className="min-w-0 rounded-2xl border border-rule bg-paper p-6 md:col-span-4">
            <ToolHead icon={Mail} title="Updates, like an inbox" text="Comments, chat mentions and new citations of papers you watch arrive as threads you can read and clear." />
            <InboxMock mode={mode} />
          </Reveal>
          <Reveal delay={1} className="min-w-0 rounded-2xl border border-rule bg-paper p-6 md:col-span-2">
            <ToolHead icon={MessageCircle} title="A chat per project" text="Quick questions stay next to the draft they’re about." />
            <ChatMock mode={mode} />
          </Reveal>
          <Reveal delay={2} className="min-w-0 rounded-2xl border border-rule bg-paper p-6 md:col-span-2">
            <ToolHead icon={Mic} title="Dictate" text="Speak a paragraph; free Whisper transcribes it into the draft." />
            <Waveform />
          </Reveal>
          <Reveal delay={3} className="min-w-0 rounded-2xl border border-rule bg-paper p-6 md:col-span-4">
            <ToolHead icon={Library} title="The Library" text={c.library} />
            <Link to="/library" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              Open the Library <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}

function ToolHead({ icon: Icon, title, text }) {
  return (
    <div>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper"><Icon className="h-4 w-4" /></span>
      <p className="display mt-4 text-xl">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-2">{text}</p>
    </div>
  );
}

function InboxMock({ mode }) {
  const rows =
    mode === 'research'
      ? [
          ['New citation', 'A 2026 study in Water Research cites “Microplastic retention…”', '2m', true],
          ['Ravi in #heat-asthma', '“Pushed the lag sensitivity analysis — take a look?”', '1h', true],
          ['Comment on Methods', 'M. Chen: land-surface vs air temperature', 'Tue', false],
        ]
      : [
          ['Beta note', 'Mae left 6 notes on Chapter 3', '4m', true],
          ['Aria in #salt-and-lanterns', '“Map v3 is up — the lighthouse moved north!”', '2h', true],
          ['Remix', 'Someone remixed Small Dragon into Spanish', 'Mon', false],
        ];
  return (
    <ul className="mt-5 divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-surface">
      {rows.map(([who, text, when, unread], i) => (
        <li key={who} className="flex items-start gap-3 px-4 py-3 animate-rise" style={{ animationDelay: `${300 + i * 180}ms` }}>
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? 'bg-accent' : 'bg-transparent'}`} />
          <span className="min-w-0 flex-1">
            <span className="flex justify-between gap-2 text-sm"><b className="font-medium">{who}</b><span className="font-mono text-2xs text-ink-3">{when}</span></span>
            <span className="block truncate text-xs text-ink-2">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ChatMock({ mode }) {
  const lines = mode === 'research'
    ? [['A', 'is the lag 0–3 days?', false], ['R', 'yes, cumulative', true], ['A', 'perfect, rerunning 🌡️', false]]
    : [['K', 'kill the storm chapter?', false], ['M', 'move it earlier!', true], ['K', 'ooh. yes.', false]];
  return (
    <div className="mt-5 space-y-2">
      {lines.map(([who, text, mine], i) => (
        <div key={i} className={`flex ${mine ? 'justify-end' : ''}`}>
          <span className={`pop-in max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${mine ? 'rounded-br-sm bg-ink text-paper' : 'rounded-bl-sm bg-sunken'}`} style={{ animationDelay: `${400 + i * 350}ms` }}>
            {text}
          </span>
        </div>
      ))}
    </div>
  );
}

function Waveform() {
  return (
    <div className="mt-6 flex h-12 items-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} className="wave-bar w-1.5 rounded-full bg-accent" style={{ animationDelay: `${(i % 7) * 90}ms`, height: `${20 + ((i * 37) % 60)}%` }} />
      ))}
    </div>
  );
}

function Bridges({ c, m }) {
  return (
    <Section eyebrow="§4 · Across disciplines" title={c.bridgesTitle} intro={c.bridgesIntro}>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <p className="eyebrow mb-4">Browse by {m.fieldLabel.toLowerCase()}</p>
          <div className="flex flex-wrap gap-2">
            {m.fields.map((d) => (
              <DisciplineTag key={d.id} id={d.id} as={Link} to={`/explore?field=${d.id}`} />
            ))}
          </div>
          <Link to="/collaborate" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            See all open calls <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="grid gap-3">
          {m.calls.slice(0, 3).map((call, i) => {
            const p = PROJECT_BY_SLUG[call.project];
            return (
              <Reveal key={call.id} delay={i}>
                <Link to={`/p/${p.slug}`} className="group grid gap-3 rounded-xl border border-rule bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-ink-3 hover:shadow-lift sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs">
                      <DisciplineDot id={call.from} /> <span className="text-ink-3">needs</span>
                      <ArrowRight className="h-3 w-3 text-ink-3" /> <DisciplineDot id={call.toward} />
                    </p>
                    <p className="display mt-2 text-lg leading-snug group-hover:text-accent">{call.role}</p>
                    <p className="mt-1 truncate text-sm text-ink-2">for “{p.title}”</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:max-w-[13rem] sm:justify-end">
                    {call.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full bg-sunken px-2 py-0.5 text-2xs text-ink-2">{s}</span>
                    ))}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function OnTheShelf({ c, m }) {
  return (
    <div className="border-y border-rule bg-surface">
      <Section eyebrow="§5 · In the open" title={c.shelfTitle} intro={<SampleNotice />}>
        <Reveal><Shelf projects={m.projects} /></Reveal>
        <Link to="/explore" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
          Explore all {m.nouns} <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>
    </div>
  );
}

function StartWriting({ c, m, onStart }) {
  return (
    <Section eyebrow="§6 · First time?" title={c.startTitle} intro={c.startIntro}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {m.templates.map((t, i) => (
          <Reveal key={t.id} delay={i}>
            <button onClick={onStart} className="group flex h-full w-full flex-col rounded-xl border border-rule bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:border-ink-3 hover:shadow-lift">
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
          </Reveal>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-ink-3">Short guides:</span>
        {m.guides.slice(0, 3).map((g) => (
          <Link key={g.slug} to={`/guides/${g.slug}`} className="text-ink-2 hover:text-accent">{g.title}</Link>
        ))}
      </div>
    </Section>
  );
}

function Credit({ m, mode }) {
  const points =
    mode === 'research'
      ? [
          ['Contributor roles, not just author order', 'Every project lists who did what using CRediT, the 14-role taxonomy many journals already require.'],
          ['Reviews are contributions too', 'Signed open reviews appear on the reviewer’s profile, so careful reviewing builds a reputation.'],
          ['Building on work cites it', 'Replications and extensions stay linked to the original, so credit flows both ways.'],
        ]
      : [
          ['Everyone who helped is named', 'Editors, beta readers, illustrators and translators get credits on the story, like a film.'],
          ['Beta notes count', 'Thoughtful notes show up on the reader’s profile — first readers deserve a byline too.'],
          ['Remixes link home', 'Translations, retellings and fan continuations always point back to the original.'],
        ];
  const highlighted = mode === 'research' ? [0, 5, 7, 12] : [0, 2, 6];
  return (
    <div className="border-t border-rule bg-surface">
      <Section eyebrow="§7 · Credit" title={mode === 'research' ? 'Credit for the work, not just the byline.' : 'Credits roll for everyone.'}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-8">
            {points.map(([t, d], i) => (
              <Reveal key={t} delay={i} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="mt-2 h-px w-6 bg-ink" />
                <div>
                  <p className="font-serif text-xl">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={1} className="rounded-xl border border-rule bg-paper p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{m.rolesLabel}</p>
              {mode === 'research' && (
                <a href="https://credit.niso.org" target="_blank" rel="noreferrer" className="text-ink-3 hover:text-ink" aria-label="About CRediT">
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {m.roles.map((r, i) => (
                <span key={r} className={`rounded-full border px-3 py-1 text-sm transition-colors ${highlighted.includes(i) ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-2'}`}>
                  {r}
                </span>
              ))}
            </div>
            <p className="mt-5 border-t border-rule pt-4 text-xs text-ink-3">Highlighted: the roles one contributor claimed on a sample {m.noun}.</p>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}

function Closing({ c, onStart, mode }) {
  return (
    <section className="mx-auto mt-20 max-w-page px-4 sm:px-6">
      <Reveal className="relative overflow-hidden rounded-2xl bg-ink px-6 py-14 text-paper sm:px-12 sm:py-16">
        <div className="relative max-w-2xl">
          <h2 className="font-serif text-[2rem] font-medium leading-[1.1] tracking-tight sm:text-5xl">{c.closing}</h2>
          <p className="mt-5 max-w-lg text-paper/70">{c.closingSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={onStart} className="btn bg-paper px-5 py-3 text-ink hover:bg-mark">
              {c.cta} <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/collaborate" className="btn border border-paper/25 px-5 py-3 text-paper hover:border-paper/60">
              Answer an open call
            </Link>
          </div>
        </div>
        {mode === 'research' ? (
          <svg className="pointer-events-none absolute -right-10 -top-10 hidden h-[26rem] w-[26rem] text-paper/10 md:block" viewBox="0 0 200 200" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="0.8">
              <path d="M40 150 L100 40 L160 150 Z" />
              <path d="M100 40 L100 150 M40 150 L130 95 M160 150 L70 95" />
            </g>
            <circle cx="100" cy="40" r="7" fill="rgb(var(--mark))" />
          </svg>
        ) : (
          <>
            <Sticker kind="moon" rotate={-10} size={90} className="float-slow absolute right-16 top-10 hidden md:inline-flex" />
            <Sticker kind="star" rotate={14} size={46} className="float-slow absolute bottom-10 right-44 hidden md:inline-flex [animation-delay:1s]" />
          </>
        )}
      </Reveal>
    </section>
  );
}
