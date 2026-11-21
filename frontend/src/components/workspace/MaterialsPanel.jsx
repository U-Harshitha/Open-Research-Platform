import React, { useState } from 'react';
import { ExternalLink, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MATERIAL_TYPES } from '../../data/catalog.js';
import { isLocalId, updateProject } from '../../lib/projects.js';

const empty = { type: '', title: '', url: '', description: '' };

export default function MaterialsPanel({ project, user, onUpload, types = MATERIAL_TYPES }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(empty);
  const assets = project.assets || [];

  const save = async (next) => {
    try {
      await updateProject(user, project.id, { assets: next });
    } catch (e) {
      console.error(e);
      toast.error('Could not update materials');
    }
  };

  const add = async (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return toast.error('Give it a title');
    if (draft.url && !/^https?:\/\//i.test(draft.url)) return toast.error('Links must start with http(s)://');
    await save([...assets, { ...draft, type: draft.type || Object.keys(types)[0], id: Date.now().toString(), addedAt: new Date().toISOString(), addedBy: user.uid }]);
    setDraft(empty);
    setAdding(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 border-b border-rule p-4">
        <p className="text-xs text-ink-3">{types === MATERIAL_TYPES ? 'Datasets, code, protocols and figures that make the work reproducible. They appear on the public project page.' : 'Character sheets, maps, outlines and research notes — the world behind the story.'}</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setAdding(!adding)} className="btn-secondary btn-sm"><Plus className="h-3.5 w-3.5" /> Link</button>
          <button
            onClick={onUpload}
            disabled={isLocalId(project.id) || user?.isDemo}
            className="btn-secondary btn-sm"
            title={isLocalId(project.id) ? 'Uploads need a synced project' : 'Upload files'}
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={add} className="space-y-2.5 border-b border-rule bg-paper p-4">
          <select value={draft.type || Object.keys(types)[0]} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="input-field">
            {Object.entries(types).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="input-field" placeholder="Title" />
          <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} className="input-field" placeholder="https://… (DOI, repo, OSF, Zenodo)" />
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="input-field h-16 resize-none" placeholder="What is it, and how was it made?" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost btn-sm flex-1">Cancel</button>
            <button type="submit" className="btn-primary btn-sm flex-1">Add</button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {assets.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-3">Nothing linked yet.</p>
        ) : (
          <ul className="space-y-2">
            {assets.map((a) => (
              <li key={a.id} className="group rounded-lg border border-rule p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">{(types[a.type] || MATERIAL_TYPES[a.type])?.label || a.type}</p>
                    <p className="mt-0.5 text-sm font-medium leading-snug">{a.title}</p>
                    {a.description && <p className="mt-1 text-xs text-ink-2">{a.description}</p>}
                  </div>
                  <span className="flex shrink-0 gap-0.5">
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="icon-btn h-7 w-7" aria-label="Open">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button onClick={() => save(assets.filter((x) => x.id !== a.id))} className="icon-btn h-7 w-7 hover:text-signal" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
