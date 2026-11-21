import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Megaphone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FIELD_BY_ID as disciplineById, PEOPLE_BY_HANDLE as researcherByHandle, PROJECT_BY_SLUG as projectBySlug } from '../data/modes.js';
import { useMode } from '../context/ModeContext.jsx';
import Reveal from '../components/motion/Reveal.jsx';
import { DisciplineDot } from '../components/ui/DisciplineTag.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import SampleNotice from '../components/ui/SampleNotice.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { relativeDate } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Collaborate() {
  const { m } = useMode();
  const DISCIPLINES = m.fields;
  const CALLS = m.calls;
  const RESEARCHERS = m.people;
  const [field, setField] = useState(null);
  const { user, openAuth } = useAuth();
  const navigate = useNavigate();

  const calls = useMemo(
    () => CALLS.filter((c) => !field || c.toward === field || c.from === field),
    [field, CALLS]
  );
  const openPeople = RESEARCHERS.filter((r) => r.open);

  const offer = (call) => {
    if (!user) return openAuth({ reason: 'Sign in to offer your expertise to this project.' });
    toast(`Noted. Messaging project leads is coming next — for now, open the project and ask in its discussion.`, { duration: 5000 });
    navigate(`/p/${call.project}`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Collaborate"
        title={m.copy.collaborateTitle}
        intro={m.copy.collaborateIntro}
        aside={
          <button
            onClick={() => (user ? navigate('/new') : openAuth({ reason: 'Sign in to post a call for collaborators.' }))}
            className="btn-primary"
          >
            <Megaphone className="h-4 w-4" /> Post a call
          </button>
        }
      >
        <div className="mt-8 flex flex-wrap gap-1.5">
          <button onClick={() => setField(null)} className={`rounded-full border px-3 py-1 text-xs ${!field ? 'border-ink bg-ink text-paper' : 'border-rule bg-surface text-ink-2 hover:border-ink-3'}`}>
            All {m.fieldsLabel.toLowerCase()}
          </button>
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              onClick={() => setField(field === d.id ? null : d.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${field === d.id ? 'border-ink bg-ink text-paper' : 'border-rule bg-surface text-ink-2 hover:border-ink-3'}`}
            >
              <DisciplineDot id={d.id} /> {d.short}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto grid max-w-page gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <SampleNotice className="mb-6" />
          <div className="grid gap-4">
            {calls.map((c, i) => {
              const p = projectBySlug[c.project];
              const lead = researcherByHandle[p.lead];
              return (
                <Reveal as="article" delay={i} key={c.id} className="rounded-xl border border-rule bg-surface p-6 transition-shadow hover:shadow-lift">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-2">
                    <span className="inline-flex items-center gap-1.5"><DisciplineDot id={c.from} /> {disciplineById[c.from].short}</span>
                    <ArrowRight className="h-3 w-3 text-ink-3" />
                    <span className="inline-flex items-center gap-1.5"><DisciplineDot id={c.toward} /> {disciplineById[c.toward].short}</span>
                    <span className="ml-auto font-mono text-2xs text-ink-3">posted {relativeDate(c.posted)}</span>
                  </div>
                  <h2 className="display mt-3 text-2xl">{c.role}</h2>
                  <p className="mt-1 text-sm text-ink-2">
                    for <Link to={`/p/${p.slug}`} className="text-ink underline decoration-rule underline-offset-2 hover:decoration-ink">{p.title}</Link>
                  </p>
                  <p className="mt-3 font-serif text-[1.02rem] leading-relaxed text-ink-2">“{p.question}”</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.skills.map((s) => (
                      <span key={s} className="rounded-full bg-sunken px-2.5 py-0.5 text-xs text-ink-2">{s}</span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
                    <span className="flex items-center gap-3 text-xs text-ink-2">
                      {lead && (
                        <Link to={`/u/${lead.handle}`} className="inline-flex items-center gap-2 hover:text-ink">
                          <Avatar name={lead.name} field={lead.fields[0]} size="h-6 w-6 text-[0.6rem]" /> {lead.name}
                        </Link>
                      )}
                      <span className="inline-flex items-center gap-1 text-ink-3"><Clock className="h-3.5 w-3.5" /> {c.commitment}</span>
                    </span>
                    <button onClick={() => offer(c)} className="btn-secondary btn-sm">Offer to help</button>
                  </div>
                </Reveal>
              );
            })}
            {calls.length === 0 && (
              <div className="rounded-xl border border-dashed border-rule py-14 text-center text-sm text-ink-2">
                No open calls here yet.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div>
            <p className="eyebrow mb-4">Open to collaborate</p>
            <ul className="space-y-4">
              {openPeople.slice(0, 6).map((r) => (
                <li key={r.handle}>
                  <Link to={`/u/${r.handle}`} className="group flex items-start gap-3">
                    <Avatar name={r.name} field={r.fields[0]} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium group-hover:text-accent">{r.name}</span>
                      <span className="block truncate text-xs text-ink-3">{r.role}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-rule bg-surface p-5">
            <p className="font-serif text-lg">Writing a good call</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Describe the problem, not just a job title. Say what you already have, what you need, and what the collaborator gets — usually co-authorship with a named CRediT role.
            </p>
            <Link to="/guides/across-disciplines" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              Read the guide <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
