import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Code2,
  Copy,
  Database,
  FileText,
  GitFork,
  Image as ImageIcon,
  Lock,
  Map as MapIcon,
  MessageSquare,
  Mic,
  Palette,
  User,
  Plus,
  Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  FIELD_BY_ID as disciplineById, LICENSES, MATERIALS_ALL as MATERIAL_TYPES, MODES, PEOPLE_BY_HANDLE as researcherByHandle,
  PROJECT_BY_SLUG as projectBySlug, modeOfProject, stageInfo,
} from '../data/modes.js';
import { useMode } from '../context/ModeContext.jsx';
import Cover from '../components/ui/Cover.jsx';
import DisciplineTag from '../components/ui/DisciplineTag.jsx';
import StageMeter from '../components/ui/StageMeter.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import SampleNotice from '../components/ui/SampleNotice.jsx';
import { bibtexFor, compact, relativeDate } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import NotFound from './NotFound.jsx';

const MATERIAL_ICON = {
  dataset: Database, code: Code2, protocol: FileText, paper: BookOpen, figure: ImageIcon, preregistration: Lock,
  character: User, map: MapIcon, outline: FileText, moodboard: Palette, research: BookOpen, audio: Mic,
};
const stageById = new Proxy({}, { get: (_, id) => stageInfo(id) });

export default function Project() {
  const { slug } = useParams();
  const project = projectBySlug[slug];
  const [tab, setTab] = useState('overview');
  const [following, setFollowing] = useState(false);
  const { user, openAuth } = useAuth();
  const navigate = useNavigate();
  const { mode, setMode } = useMode();
  const pmode = modeOfProject(project);
  const L = MODES[pmode].labels;

  // Viewing a story switches the site into Stories mode (and vice versa).
  useEffect(() => {
    if (project && pmode !== mode) setMode(pmode);
  }, [project, pmode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!project) return <NotFound />;

  const people = project.contributors.map((c) => ({ ...c, person: researcherByHandle[c.handle] })).filter((c) => c.person);
  const license = LICENSES.find((l) => l.id === project.license);
  const needAuth = (reason, fn) => (user ? fn() : openAuth({ reason }));

  const tabs = [
    ['overview', 'Overview'],
    ['questions', L.questions, project.questions.filter((q) => q.status === 'open').length],
    ['materials', L.materials, project.materials.length],
    ['reviews', L.reviews, project.reviews.length],
    ['versions', L.versions, project.versions.length],
  ];

  return (
    <>
      <div className="border-b border-rule bg-surface">
        <div className="mx-auto max-w-page px-4 pt-10 sm:px-6 lg:pt-14">
          <SampleNotice className="mb-8 max-w-xl" />
          <div className="grid items-end gap-8 md:grid-cols-[auto_1fr]">
          <div className="hidden md:block animate-rise"><Cover project={project} size="md" /></div>
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {project.disciplines.map((d) => (
              <DisciplineTag key={d} id={d} as={Link} to={`/explore?field=${d}`} />
            ))}
          </div>
          <h1 className="display mt-5 max-w-4xl text-[2.2rem] leading-[1.08] sm:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-3xl font-serif text-xl italic leading-relaxed text-ink-2">{project.question}</p>
          </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span className="flex -space-x-2">
                {people.map(({ person }) => (
                  <Link key={person.handle} to={`/u/${person.handle}`}>
                    <Avatar name={person.name} field={person.fields[0]} ring />
                  </Link>
                ))}
              </span>
              <span className="text-ink-2">
                {people.map(({ person }, i) => (
                  <React.Fragment key={person.handle}>
                    {i > 0 && ', '}
                    <Link to={`/u/${person.handle}`} className="text-ink hover:text-accent">{person.name}</Link>
                  </React.Fragment>
                ))}
              </span>
              <StageMeter stage={project.stage} size="lg" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => needAuth('Sign in to follow this project.', () => {
                  setFollowing(!following);
                  toast(following ? 'Unfollowed' : 'Following — you’ll see new versions in your workspace.');
                })}
                className={following ? 'btn-primary' : 'btn-secondary'}
              >
                {following ? <Check className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                {following ? 'Following' : 'Follow'}
                <span className="font-mono text-2xs opacity-70">{compact(project.followers + (following ? 1 : 0))}</span>
              </button>
              <button
                onClick={() => needAuth(`Sign in to ${L.buildOn.toLowerCase()} this ${MODES[pmode].noun}.`, () => navigate(`/new?from=${project.slug}`))}
                className="btn-secondary"
              >
                <GitFork className="h-4 w-4" /> {L.buildOn} <span className="font-mono text-2xs opacity-70">{project.builtOn}</span>
              </button>
            </div>
          </div>

          <nav className="mt-8 flex gap-6 overflow-x-auto border-b-0" aria-label="Project sections">
            {tabs.map(([id, label, count]) => (
              <button key={id} onClick={() => setTab(id)} className={`tab whitespace-nowrap ${tab === id ? 'tab-active' : ''}`}>
                {label}
                {count !== undefined && <span className="rounded-full bg-sunken px-1.5 font-mono text-2xs text-ink-2">{count}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto grid max-w-page gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_19rem]">
        <div className="min-w-0">
          {tab === 'overview' && <Overview project={project} people={people} onTab={setTab} L={L} />}
          {tab === 'questions' && <Questions project={project} L={L} onAsk={() => needAuth(`Sign in to start a ${L.question}.`, () => toast('Public threads are coming next — use the project chat for now.'))} />}
          {tab === 'materials' && <Materials project={project} />}
          {tab === 'reviews' && <Reviews project={project} L={L} onReview={() => needAuth(`Sign in to write a ${L.review}.`, () => toast('Public reviews are coming next.'))} />}
          {tab === 'versions' && <Versions project={project} />}
        </div>
        <Sidebar project={project} people={people} license={license} L={L} />
      </div>
    </>
  );
}

function Overview({ project, people, onTab, L }) {
  return (
    <div className="space-y-12">
      <section>
        <p className="eyebrow mb-4">{L.abstract}</p>
        <div className="prose-paper max-w-measure">
          {project.abstract.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      {project.seeking.length > 0 && (
        <section className="rounded-xl border border-signal/25 bg-signal-soft/60 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-signal">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" /> This project is looking for
          </p>
          <ul className="mt-2 space-y-1 font-serif text-lg">
            {project.seeking.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <Link to="/collaborate" className="mt-3 inline-block text-sm font-medium text-signal underline underline-offset-2">See the open call</Link>
        </section>
      )}

      <section>
        <p className="eyebrow mb-4">{L.contributors}</p>
        <div className="divide-y divide-rule rounded-xl border border-rule bg-surface">
          {people.map(({ person, roles }) => (
            <div key={person.handle} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <Link to={`/u/${person.handle}`} className="flex min-w-[13rem] items-center gap-3">
                <Avatar name={person.name} field={person.fields[0]} />
                <span>
                  <span className="block text-sm font-medium hover:text-accent">{person.name}</span>
                  <span className="block text-xs text-ink-3">{person.role}</span>
                </span>
              </Link>
              <span className="flex flex-wrap gap-1.5">
                {roles.map((r) => (
                  <span key={r} className="rounded-full border border-rule px-2 py-0.5 text-xs text-ink-2">{r}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      {project.questions.length > 0 && (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <p className="eyebrow">{L.questions}</p>
            <button onClick={() => onTab('questions')} className="text-xs text-accent hover:underline">View all</button>
          </div>
          <QuestionList items={project.questions.slice(0, 2)} />
        </section>
      )}
    </div>
  );
}

function QuestionList({ items }) {
  return (
    <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface">
      {items.map((q) => {
        const by = researcherByHandle[q.by];
        return (
          <li key={q.title} className="flex gap-3 p-4">
            {q.status === 'open' ? <Circle className="mt-1 h-4 w-4 shrink-0 text-[#2F7D5B]" /> : <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-ink-3" />}
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg leading-snug">{q.title}</p>
              <p className="mt-1 text-xs text-ink-3">
                {q.status === 'open' ? 'Open' : 'Resolved'} · asked by {by?.name || 'a contributor'}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 self-start text-xs text-ink-3">
              <MessageSquare className="h-3.5 w-3.5" /> {q.replies}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Questions({ project, onAsk, L }) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-sm text-ink-2">{L.question === 'thread' ? 'Plot holes, open questions and “what if…” ideas. Anyone can start one; the writers resolve them.' : 'Doubts, gaps and next experiments — the research equivalent of issues. Anyone can ask; contributors resolve.'}</p>
        <button onClick={onAsk} className="btn-secondary btn-sm"><Plus className="h-3.5 w-3.5" /> New {L.question}</button>
      </div>
      {project.questions.length ? <QuestionList items={project.questions} /> : <Empty text="No questions yet. Be the first to ask one." />}
    </div>
  );
}

function Materials({ project }) {
  if (!project.materials.length) return <Empty text="No materials shared yet. Ideas can start without data." />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {project.materials.map((m) => {
        const Icon = MATERIAL_ICON[m.type] || FileText;
        return (
          <li key={m.title} className="flex gap-4 rounded-xl border border-rule bg-surface p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sunken text-ink-2">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">{MATERIAL_TYPES[m.type]?.label}</span>
              <span className="mt-0.5 block font-medium leading-snug">{m.title}</span>
              <span className="mt-1 block text-xs text-ink-3">{m.meta}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Reviews({ project, onReview, L }) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-sm text-ink-2">{L.review === 'beta note' ? 'Notes from first readers: what landed, what dragged, where they got lost. Signed notes count on the reader’s profile.' : 'Open peer review: reports and author responses are public. Reviewers may sign, and signed reviews count on their profile.'}</p>
        <button onClick={onReview} className="btn-secondary btn-sm"><Plus className="h-3.5 w-3.5" /> Write a {L.review}</button>
      </div>
      {project.reviews.length ? (
        <div className="space-y-4">
          {project.reviews.map((r, i) => (
            <article key={i} className="rounded-xl border border-rule bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{r.by}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs ${['Accept', 'Loved it'].includes(r.verdict) ? 'bg-accent-soft text-accent' : 'bg-sunken text-ink-2'}`}>{r.verdict}</span>
              </div>
              <p className="mt-3 font-serif text-lg leading-relaxed text-ink-2">{r.summary}</p>
            </article>
          ))}
        </div>
      ) : (
        <Empty text={stageById[project.stage].index < 3 ? 'Reviews open once a preprint is posted. Until then, ask questions or comment on the draft.' : 'No reviews yet.'} />
      )}
    </div>
  );
}

function Versions({ project }) {
  return (
    <ol className="relative ml-2 border-l border-rule">
      {project.versions.map((v, i) => (
        <li key={v.v} className="relative pb-8 pl-7 last:pb-0">
          <span className={`absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full ${i === 0 ? 'bg-ink' : 'border border-ink-3 bg-paper'}`} />
          <p className="flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-sm font-medium">{v.v}</span>
            <span className="font-mono text-2xs text-ink-3">{v.date}</span>
            {i === 0 && <span className="rounded-full bg-sunken px-2 py-0.5 text-2xs text-ink-2">Latest</span>}
          </p>
          <p className="mt-1 font-serif text-lg">{v.note}</p>
        </li>
      ))}
    </ol>
  );
}

function Sidebar({ project, people, license, L }) {
  const [copied, setCopied] = useState(false);
  const bib = bibtexFor(project, people.map((p) => p.person.name));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bib);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy');
    }
  };
  const rows = [
    ['Version', `${project.version} · ${relativeDate(project.updated)}`],
    ['Licence', license?.label],
    ['Stage', stageById[project.stage].label],
    [L.builtOn, `${project.builtOn} ${project.builtOn === 1 ? MODES[modeOfProject(project)].noun : MODES[modeOfProject(project)].nouns}`],
  ];
  return (
    <aside className="min-w-0 space-y-8 lg:sticky lg:top-24 lg:self-start">
      <dl className="divide-y divide-rule rounded-xl border border-rule bg-surface text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-ink-3">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="eyebrow mb-3">Keywords</p>
        <div className="flex flex-wrap gap-1.5">
          {project.keywords.map((k) => (
            <Link key={k} to={`/explore?q=${encodeURIComponent(k)}`} className="rounded-full bg-sunken px-2.5 py-0.5 text-xs text-ink-2 hover:text-ink">{k}</Link>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow">Cite this version</p>
          <button onClick={copy} className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'BibTeX'}
          </button>
        </div>
        <pre className="whitespace-pre-wrap break-all rounded-lg border border-rule bg-sunken/60 p-3 font-mono text-[0.68rem] leading-relaxed text-ink-2">{bib}</pre>
      </div>
      <p className="text-xs leading-relaxed text-ink-3">
        Fields: {project.disciplines.map((d) => disciplineById[d].label).join(', ')}.
      </p>
    </aside>
  );
}

const Empty = ({ text }) => (
  <div className="rounded-xl border border-dashed border-rule px-6 py-14 text-center text-sm text-ink-2">{text}</div>
);
