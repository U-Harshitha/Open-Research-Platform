import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Globe2, Lock, LogOut, Menu, Paperclip, Plus, Sparkles, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth, displayNameOf } from '../context/AuthContext.jsx';
import { STAGES, TEMPLATES } from '../data/catalog.js';
import { subscribeToProjects, updateProject, isLocalId, createProject } from '../lib/projects.js';
import { relativeDate } from '../lib/format.js';
import CollaborativeEditor from '../components/CollaborativeEditor.jsx';
import DocumentUpload from '../components/DocumentUpload.jsx';
import AssistantPanel from '../components/workspace/AssistantPanel.jsx';
import MaterialsPanel from '../components/workspace/MaterialsPanel.jsx';
import InsightsPanel from '../components/workspace/InsightsPanel.jsx';
import Logo, { LogoMark } from '../components/ui/Logo.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import StageMeter from '../components/ui/StageMeter.jsx';
import { DisciplineDot } from '../components/ui/DisciplineTag.jsx';

const PANELS = [
  { id: 'assistant', label: 'Assistant', icon: Sparkles },
  { id: 'materials', label: 'Materials', icon: Paperclip },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
];

export default function Workspace() {
  const { docId } = useParams();
  const { user, loading, openAuth, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState(null);
  const [panel, setPanel] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [liveContent, setLiveContent] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;
    setProjects(null);
    return subscribeToProjects(user, setProjects);
  }, [user]);

  useEffect(() => {
    setDrawer(false);
  }, [docId]);

  const active = useMemo(() => projects?.find((p) => p.id === docId) || null, [projects, docId]);

  useEffect(() => {
    if (active) setLiveContent(active.content || '');
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = active ? `${active.title} · Workspace` : 'Workspace · Research Nexus';
    return () => {
      document.title = 'Open Research Nexus · Research, written in the open';
    };
  }, [active?.title]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Splash />;
  if (!user) return <SignInGate onSignIn={() => openAuth({ reason: 'Sign in to open your workspace.' })} />;

  const setMeta = async (updates) => {
    try {
      await updateProject(user, active.id, updates);
    } catch (e) {
      console.error(e);
      toast.error('Could not update project');
    }
  };

  const togglePanel = (id) => setPanel((p) => (p === id ? null : id));

  return (
    <div className="flex h-[100dvh] flex-col bg-paper">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-rule bg-surface px-3 sm:px-4">
        <button className="icon-btn lg:hidden" onClick={() => setDrawer(true)} aria-label="Projects">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="hidden sm:block" aria-label="Back to site"><Logo compact /></Link>
        <Link to="/" className="sm:hidden" aria-label="Back to site"><LogoMark /></Link>
        <span className="hidden h-5 w-px bg-rule sm:block" />
        <span className="truncate text-sm text-ink-2">
          <Link to="/workspace" className="hover:text-ink">Workspace</Link>
          {active && <span className="text-ink-3"> / </span>}
          {active && <span className="text-ink">{active.title}</span>}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {active &&
            PANELS.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePanel(p.id)}
                className={`btn-ghost btn-sm ${panel === p.id ? 'bg-sunken text-ink' : ''}`}
                aria-pressed={panel === p.id}
                title={p.label}
              >
                <p.icon className="h-4 w-4" />
                <span className="hidden md:inline">{p.label}</span>
              </button>
            ))}
          <span className="ml-2"><Avatar name={displayNameOf(user)} photo={user.photoURL} size="h-8 w-8 text-xs" /></span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Projects rail */}
        {drawer && <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setDrawer(false)} />}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-rule bg-surface transition-transform lg:static lg:z-0 lg:w-64 lg:translate-x-0 ${drawer ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <p className="eyebrow">Your projects</p>
            <span className="flex gap-1">
              <Link to="/new" className="icon-btn h-7 w-7" title="New project"><Plus className="h-4 w-4" /></Link>
              <button className="icon-btn h-7 w-7 lg:hidden" onClick={() => setDrawer(false)} aria-label="Close"><X className="h-4 w-4" /></button>
            </span>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            {projects === null && <p className="px-2 py-6 text-sm text-ink-3">Loading…</p>}
            {projects?.length === 0 && <p className="px-2 py-6 text-sm text-ink-3">No projects yet.</p>}
            {projects?.map((p) => (
              <Link
                key={p.id}
                to={`/workspace/${p.id}`}
                className={`mb-0.5 block rounded-lg px-3 py-2.5 transition-colors ${p.id === docId ? 'bg-sunken' : 'hover:bg-sunken/60'}`}
              >
                <span className="flex items-center gap-1.5">
                  {(p.disciplines || []).slice(0, 3).map((d) => <DisciplineDot key={d} id={d} className="h-1.5 w-1.5" />)}
                  <span className="truncate text-sm font-medium">{p.title || 'Untitled'}</span>
                </span>
                <span className="mt-1 flex items-center justify-between">
                  <StageMeter stage={p.stage || 'idea'} showLabel={false} />
                  <span className="font-mono text-[0.6rem] text-ink-3">{relativeDate(p.updatedAt)}</span>
                </span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-rule p-3 text-sm">
            <p className="truncate px-1 font-medium">{displayNameOf(user)}</p>
            <p className="truncate px-1 text-xs text-ink-3">
              {user.isDemo ? 'Local demo — saved in this browser' : user.isAnonymous ? 'Guest — create an account to keep work' : user.email}
            </p>
            <div className="mt-2 flex gap-1">
              <Link to="/" className="btn-ghost btn-sm flex-1"><ArrowLeft className="h-3.5 w-3.5" /> Site</Link>
              <button onClick={signOut} className="btn-ghost btn-sm flex-1"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {!docId && <Dashboard user={user} projects={projects} />}
          {docId && projects !== null && !active && (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="display text-2xl">Project not found</p>
              <p className="mt-2 text-sm text-ink-2">It may have been deleted, or you may not have access.</p>
              <Link to="/workspace" className="btn-secondary mt-6">Back to workspace</Link>
            </div>
          )}
          {active && (
            <CollaborativeEditor
              key={active.id}
              ref={editorRef}
              documentId={active.id}
              user={user}
              initialContent={active.content || ''}
              title={active.title}
              onContentChange={setLiveContent}
              showComments={panel === 'comments'}
              onToggleComments={() => togglePanel('comments')}
              toolbarSlot={<MetaControls project={active} onChange={setMeta} />}
            />
          )}
        </main>

        {/* Right panel */}
        {active && panel && panel !== 'comments' && (
          <aside className="flex w-full max-w-[22rem] shrink-0 flex-col border-l border-rule bg-surface max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-40 max-lg:shadow-lift">
            <div className="flex h-12 items-center justify-between border-b border-rule px-4">
              <p className="text-sm font-medium">{PANELS.find((p) => p.id === panel)?.label}</p>
              <button onClick={() => setPanel(null)} className="icon-btn h-7 w-7" aria-label="Close panel"><X className="h-4 w-4" /></button>
            </div>
            <div className="min-h-0 flex-1">
              {panel === 'assistant' && <AssistantPanel content={liveContent} onInsert={(html) => editorRef.current?.insertHtml(html)} />}
              {panel === 'materials' && <MaterialsPanel project={active} user={user} onUpload={() => setUploadOpen(true)} />}
              {panel === 'insights' && <InsightsPanel project={active} content={liveContent} />}
            </div>
          </aside>
        )}
      </div>

      {uploadOpen && active && !isLocalId(active.id) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && setUploadOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-rule bg-surface shadow-lift">
            <div className="flex items-center justify-between border-b border-rule px-6 py-4">
              <p className="display text-xl">Upload files</p>
              <button onClick={() => setUploadOpen(false)} className="icon-btn" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[calc(90vh-4.5rem)] overflow-y-auto p-6">
              <DocumentUpload documentId={active.id} user={user} onUploadComplete={(f) => toast.success(`${f.name} uploaded`)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaControls({ project, onChange }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="stage-select">Stage</label>
      <select
        id="stage-select"
        value={project.stage || 'idea'}
        onChange={(e) => onChange({ stage: e.target.value })}
        className="rounded-full border border-rule bg-surface py-0.5 pl-2.5 pr-7 text-xs text-ink-2 focus:border-accent focus:outline-none"
      >
        {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
      <button
        onClick={() => onChange({ isPublic: !project.isPublic })}
        className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-2.5 py-0.5 text-xs text-ink-2 hover:border-ink-3"
        title={project.isPublic ? 'Public: listed on Explore' : 'Private: only collaborators'}
      >
        {project.isPublic ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
        {project.isPublic ? 'Public' : 'Private'}
      </button>
      {isLocalId(project.id) && <span className="rounded-full bg-mark/40 px-2.5 py-0.5 text-xs text-ink-2">Saved in this browser</span>}
    </span>
  );
}

function Dashboard({ user, projects }) {
  const navigate = useNavigate();
  const recent = (projects || []).slice(0, 5);
  const quickStart = async (t) => {
    const { id } = await createProject(user, { title: t.name === 'Blank page' ? 'Untitled' : `New ${t.name.toLowerCase()}`, template: t.id, content: t.content });
    navigate(`/workspace/${id}`);
  };
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="eyebrow">Workspace</p>
        <h1 className="display mt-3 text-4xl">Good to see you, {displayNameOf(user).split(' ')[0]}.</h1>
        <p className="mt-2 text-ink-2">Pick up a draft, or start something new.</p>

        <section className="mt-10">
          <p className="eyebrow mb-3">Recent</p>
          {recent.length ? (
            <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link to={`/workspace/${p.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-sunken/50">
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-lg">{p.title || 'Untitled'}</span>
                      <span className="mt-1 block"><StageMeter stage={p.stage || 'idea'} /></span>
                    </span>
                    <span className="shrink-0 font-mono text-2xs text-ink-3">{relativeDate(p.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-rule px-6 py-10 text-center">
              <p className="font-serif text-xl">Your first project starts with a question.</p>
              <Link to="/new" className="btn-primary mt-5"><Plus className="h-4 w-4" /> Start a project</Link>
            </div>
          )}
        </section>

        <section className="mt-10">
          <p className="eyebrow mb-3">Quick start from a template</p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => quickStart(t)} className="rounded-xl border border-rule bg-surface p-4 text-left transition-colors hover:border-ink-3">
                <span className="font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">{t.kind}</span>
                <span className="display mt-1 block text-lg">{t.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-3">
            Want to set fields, licence and visibility first? <Link to="/new" className="text-accent hover:underline">Use the full setup</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

function SignInGate({ onSignIn }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <LogoMark className="h-10 w-10" />
      <h1 className="display mt-6 text-4xl">Your workspace</h1>
      <p className="mt-3 max-w-sm text-ink-2">Drafts, materials and collaborators live here. Sign in to open it — or try it as a guest.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={onSignIn} className="btn-primary">Sign in</button>
        <Link to="/" className="btn-secondary">Back to site</Link>
      </div>
    </div>
  );
}

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <LogoMark className="h-10 w-10 animate-pulse" />
    </div>
  );
}
