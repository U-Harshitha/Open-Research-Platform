import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, FileSearch, Loader2, PenLine, Search, ShieldCheck } from 'lucide-react';
import { API_CONFIG } from '../../lib/config.js';
import { stripHtml } from '../../lib/format.js';

const MODES = [
  { id: 'search', label: 'Find', icon: Search, hint: 'Ask a question; get a grounded answer with sources.' },
  { id: 'complete', label: 'Draft', icon: PenLine, hint: 'Describe a paragraph; review it before inserting.' },
  { id: 'analyze', label: 'Review', icon: FileSearch, hint: 'Get structural feedback on the current draft.' },
  { id: 'plagiarism', label: 'Integrity', icon: ShieldCheck, hint: 'Flag passages that may need a citation.' },
];

async function call(endpoint, body) {
  if (!API_CONFIG.BASE_URL && import.meta.env.PROD) throw new Error('NO_BACKEND');
  let res;
  try {
    res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('NO_BACKEND');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export default function AssistantPanel({ content, onInsert }) {
  const [mode, setMode] = useState('search');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const hasText = stripHtml(content).length > 40;

  const run = async () => {
    setError(null);
    setLoading(true);
    try {
      let data;
      if (mode === 'search') data = await call(API_CONFIG.ENDPOINTS.SEARCH, { query: input, context: stripHtml(content).slice(0, 4000) });
      if (mode === 'complete') data = await call(API_CONFIG.ENDPOINTS.COMPLETE, { content, prompt: input, style: 'academic' });
      if (mode === 'analyze') data = await call(API_CONFIG.ENDPOINTS.ANALYZE, { content, type: 'comprehensive' });
      if (mode === 'plagiarism') data = await call(API_CONFIG.ENDPOINTS.PLAGIARISM, { content });
      setResults((r) => ({ ...r, [mode]: data }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const current = MODES.find((m) => m.id === mode);
  const needsInput = mode === 'search' || mode === 'complete';
  const disabled = loading || (needsInput ? !input.trim() : !hasText);
  const r = results[mode];

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-4 gap-1 border-b border-rule p-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              setError(null);
            }}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-2xs font-medium transition-colors ${mode === m.id ? 'bg-sunken text-ink' : 'text-ink-3 hover:text-ink'}`}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-xs text-ink-3">{current.hint}</p>

        {needsInput ? (
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && !disabled && run()}
              rows={mode === 'complete' ? 4 : 2}
              className="input-field resize-none"
              placeholder={mode === 'search' ? 'e.g. What is known about heat and paediatric asthma?' : 'e.g. A paragraph on limitations of satellite temperature data'}
            />
            <button onClick={run} disabled={disabled} className="btn-primary btn-sm mt-2 w-full">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              {mode === 'search' ? 'Search' : 'Draft paragraph'}
            </button>
          </div>
        ) : (
          <button onClick={run} disabled={disabled} className="btn-primary btn-sm w-full">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === 'analyze' ? 'Review my draft' : 'Check citations'}
          </button>
        )}
        {!needsInput && !hasText && <p className="text-xs text-ink-3">Write a little more first.</p>}

        {error && <ErrorNote message={error} />}

        {r && mode === 'search' && (
          <div className="space-y-3">
            <div className="whitespace-pre-wrap rounded-lg border border-rule p-3 text-sm leading-relaxed text-ink-2">{r.answer}</div>
            {r.sources?.length > 0 && (
              <div>
                <p className="eyebrow mb-2">Sources</p>
                <ol className="space-y-1.5">
                  {r.sources.slice(0, 6).map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <span className="font-mono text-ink-3">[{i + 1}]</span>
                      <a href={s} target="_blank" rel="noopener noreferrer" className="truncate text-accent hover:underline">{s}</a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {r && mode === 'complete' && (
          <div className="space-y-2">
            <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-rule bg-paper p-3 font-serif text-[0.95rem] leading-relaxed">{r.completion}</div>
            <button
              onClick={() => onInsert(`<p>${String(r.completion).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>')}</p>`)}
              className="btn-secondary btn-sm w-full"
            >
              Insert at cursor
            </button>
            <p className="text-2xs text-ink-3">AI drafts can be wrong. Check every claim and add your own citations.</p>
          </div>
        )}

        {r && mode === 'analyze' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-rule bg-rule text-center">
              <div className="bg-surface p-3"><p className="display text-xl">{r.metrics?.word_count ?? '—'}</p><p className="text-2xs text-ink-3">words</p></div>
              <div className="bg-surface p-3"><p className="display text-xl">{r.metrics?.estimated_reading_time ?? '—'}</p><p className="text-2xs text-ink-3">min read</p></div>
            </div>
            <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-rule p-3 text-sm leading-relaxed text-ink-2">{r.analysis}</div>
          </div>
        )}

        {r && mode === 'plagiarism' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-rule p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-ink-2">Similarity estimate</span>
                <span className="display text-xl">{r.similarity_score}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken">
                <div className={`h-full ${r.risk_level === 'low' ? 'bg-[#2F7D5B]' : r.risk_level === 'medium' ? 'bg-[#B7791F]' : 'bg-signal'}`} style={{ width: `${Math.min(100, r.similarity_score)}%` }} />
              </div>
              <p className="mt-2 font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">Risk: {r.risk_level}</p>
            </div>
            <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{r.analysis}</div>
            {r.disclaimer && <p className="text-2xs text-ink-3">{r.disclaimer}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorNote({ message }) {
  const offline = message === 'NO_BACKEND';
  return (
    <div className="flex gap-2 rounded-lg border border-signal/25 bg-signal-soft/60 p-3 text-xs text-ink-2">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
      <div>
        {offline ? (
          <>
            <p className="font-medium text-ink">The AI service isn’t reachable.</p>
            <p className="mt-1">
              Run <code className="rounded bg-surface px-1 font-mono">python ai_service_api.py</code> in <code className="font-mono">backend/</code>, or set <code className="font-mono">VITE_API_URL</code> to the deployed service.
            </p>
          </>
        ) : (
          message
        )}
      </div>
    </div>
  );
}
