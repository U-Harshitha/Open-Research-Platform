import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, GitFork, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LICENSES, TEMPLATES as R_TEMPLATES } from '../data/catalog.js';
import { STORY_TEMPLATES } from '../data/stories.js';
import { PROJECT_BY_SLUG as projectBySlug, modeOfProject } from '../data/modes.js';
import { useMode } from '../context/ModeContext.jsx';

const templateById = Object.fromEntries([...R_TEMPLATES, ...STORY_TEMPLATES].map((t) => [t.id, t]));
import { useAuth } from '../context/AuthContext.jsx';
import { createProject } from '../lib/projects.js';
import { DisciplineDot } from '../components/ui/DisciplineTag.jsx';

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export default function NewProject() {
  const [params] = useSearchParams();
  const from = projectBySlug[params.get('from')];
  const { mode, m } = useMode();
  const DISCIPLINES = m.fields;
  const STAGES = m.stages;
  const TEMPLATES = m.templates;
  const { user, openAuth } = useAuth();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(from ? (modeOfProject(from) === 'stories' ? 'short-story' : 'replication') : m.templates[0].id);
  const [form, setForm] = useState({
    title: from ? `${m.labels.buildOn === 'Remix' ? 'Remix of' : 'Building on'}: ${from.title}` : '',
    question: '',
    disciplines: from ? [...from.disciplines] : [],
    stage: m.stages[0].id,
    license: 'cc-by-4.0',
    isPublic: true,
    seeking: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleField = (id) =>
    set(
      'disciplines',
      form.disciplines.includes(id)
        ? form.disciplines.filter((d) => d !== id)
        : form.disciplines.length < 3
          ? [...form.disciplines, id]
          : form.disciplines
    );

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return openAuth({ mode: 'signup', reason: 'Create a free account to save your project.' });
    if (!form.title.trim()) return toast.error('Give your project a working title.');
    setSaving(true);
    try {
      const t = templateById[template];
      const title = escapeHtml(form.title.trim());
      const content = t.content.replace(/<h1>[^<]*<\/h1>/, `<h1>${title}</h1>`);
      const { id, local } = await createProject(user, {
        ...form,
        title: form.title.trim(),
        seeking: form.seeking.split(',').map((s) => s.trim()).filter(Boolean),
        buildsOn: from?.slug || null,
        mode,
        template,
        content,
      });
      toast.success(local ? 'Project created (saved in this browser)' : 'Project created');
      navigate(`/workspace/${id}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not create the project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-page px-4 py-10 sm:px-6 lg:py-14">
      <p className="eyebrow">New {m.noun}</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">{m.copy.newTitle}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">{m.copy.newIntro} Everything can change later.</p>

      {from && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-rule bg-surface p-4 text-sm">
          <GitFork className="mt-0.5 h-4 w-4 text-ink-3" />
          <p>
            {m.labels.buildOn === 'Remix' ? 'Remixing' : 'Building on'} <Link to={`/p/${from.slug}`} className="font-medium underline decoration-rule underline-offset-2">{from.title}</Link>.
            The original will be linked and credited on your project.
          </p>
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <fieldset>
          <legend className="eyebrow mb-4">1 · Structure</legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {TEMPLATES.map((t) => {
              const on = template === t.id;
              return (
                <label
                  key={t.id}
                  className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-colors ${on ? 'border-ink bg-surface shadow-lift' : 'border-rule bg-surface/60 hover:border-ink-3'}`}
                >
                  <input type="radio" name="template" value={t.id} checked={on} onChange={() => setTemplate(t.id)} className="sr-only" />
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">{t.kind}</span>
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${on ? 'border-ink bg-ink text-paper' : 'border-rule'}`}>
                      {on && <Check className="h-2.5 w-2.5" />}
                    </span>
                  </span>
                  <span className="display mt-2 text-lg">{t.name}</span>
                  <span className="mt-1 text-xs leading-relaxed text-ink-2">{t.blurb}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="eyebrow mb-4">2 · {mode === 'stories' ? 'The premise' : 'The question'}</legend>
            <div>
              <label htmlFor="title" className="label">Working title</label>
              <input id="title" value={form.title} onChange={(e) => set('title', e.target.value)} className="input-field font-serif text-lg" placeholder={m.copy.titleExample} />
            </div>
            <div>
              <label htmlFor="question" className="label">{m.copy.questionLabel}</label>
              <textarea id="question" value={form.question} onChange={(e) => set('question', e.target.value)} rows={2} className="input-field resize-none" placeholder={m.copy.questionPlaceholder} />
            </div>
            <div>
              <p className="label">{m.fieldsLabel} <span className="text-ink-3">({m.copy.fieldsHint})</span></p>
              <div className="flex flex-wrap gap-1.5">
                {DISCIPLINES.map((d) => {
                  const on = form.disciplines.includes(d.id);
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleField(d.id)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${on ? 'border-ink bg-ink text-paper' : 'border-rule bg-surface text-ink-2 hover:border-ink-3'}`}
                    >
                      <DisciplineDot id={d.id} /> {d.short}
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="eyebrow mb-4">3 · Openness</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="stage" className="label">Stage</label>
                <select id="stage" value={form.stage} onChange={(e) => set('stage', e.target.value)} className="input-field">
                  {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="license" className="label">Licence</label>
                <select id="license" value={form.license} onChange={(e) => set('license', e.target.value)} className="input-field">
                  {LICENSES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-ink-3">{LICENSES.find((l) => l.id === form.license)?.blurb}</p>
            <div>
              <label htmlFor="seeking" className="label">Looking for collaborators? <span className="text-ink-3">(optional, comma-separated)</span></label>
              <input id="seeking" value={form.seeking} onChange={(e) => set('seeking', e.target.value)} className="input-field" placeholder={m.copy.seekingExample} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                [true, 'Public', 'Listed on Explore. Anyone can read and comment.'],
                [false, 'Private', 'Only collaborators you invite can see it.'],
              ].map(([val, label, hint]) => (
                <label key={label} className={`cursor-pointer rounded-xl border p-3 ${form.isPublic === val ? 'border-ink bg-surface' : 'border-rule bg-surface/60'}`}>
                  <input type="radio" name="visibility" className="sr-only" checked={form.isPublic === val} onChange={() => set('isPublic', val)} />
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs text-ink-2">{hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-3 border-t border-rule pt-6">
            <button type="submit" disabled={saving} className="btn-primary px-5 py-3">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create and start writing <ArrowRight className="h-4 w-4" />
            </button>
            {!user && <span className="text-xs text-ink-3">You’ll be asked to sign in.</span>}
          </div>
        </div>
      </div>
    </form>
  );
}
