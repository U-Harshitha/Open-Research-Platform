import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Square } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../../lib/config.js';

// Dictation: record → Whisper (free on Groq) via our API. If the API isn't
// reachable, fall back to the browser's own speech recognition where it exists.
const SpeechRec = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const MAX_MS = 120000;

export default function Dictation({ onText }) {
  const [state, setState] = useState('idle'); // idle | recording | transcribing | live
  const [levels, setLevels] = useState(Array(12).fill(0.1));
  const [elapsed, setElapsed] = useState(0);
  const rec = useRef(null);
  const chunks = useRef([]);
  const audio = useRef({});
  const live = useRef(null);

  useEffect(() => () => stopAll(), []); // eslint-disable-line react-hooks/exhaustive-deps

  function stopAll() {
    cancelAnimationFrame(audio.current.raf);
    clearInterval(audio.current.timer);
    audio.current.stream?.getTracks().forEach((t) => t.stop());
    audio.current.ctx?.close?.().catch(() => {});
    live.current?.stop?.();
  }

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return startLive();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        analyser.getByteFrequencyData(buf);
        setLevels(Array.from({ length: 12 }, (_, i) => Math.max(0.1, buf[i + 2] / 255)));
        audio.current.raf = requestAnimationFrame(draw);
      };
      draw();
      const t0 = Date.now();
      audio.current = { ...audio.current, stream, ctx, timer: setInterval(() => {
        const ms = Date.now() - t0;
        setElapsed(ms);
        if (ms > MAX_MS) stop();
      }, 250) };
      chunks.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.onstop = upload;
      rec.current = mr;
      mr.start();
      setElapsed(0);
      setState('recording');
    } catch (e) {
      console.warn(e);
      toast.error('Microphone permission is needed to dictate.');
    }
  }

  function stop() {
    if (rec.current?.state === 'recording') rec.current.stop();
    stopAll();
  }

  // xray:dictation
  async function upload() {
    setState('transcribing');
    const blob = new Blob(chunks.current, { type: rec.current?.mimeType || 'audio/webm' });
    const form = new FormData();
    form.append('audio', blob, `dictation.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`);
    try {
      if (!API_CONFIG.BASE_URL) throw new Error('NO_BACKEND');
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/transcribe`, { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'failed');
      if (data.text) onText(data.text);
      else toast('Didn’t catch anything — try again a little closer to the mic.');
      setState('idle');
    } catch (e) {
      setState('idle');
      if (SpeechRec) toast('Transcription service unavailable — switching to your browser’s live dictation.');
      else toast.error('Transcription service unavailable right now.');
      if (SpeechRec) startLive();
    }
  }
  // xray:end

  function startLive() {
    if (!SpeechRec) return toast.error('Dictation isn’t supported in this browser.');
    const r = new SpeechRec();
    r.continuous = true;
    r.interimResults = false;
    r.lang = navigator.language || 'en-US';
    r.onresult = (e) => {
      const text = Array.from(e.results).slice(e.resultIndex).filter((x) => x.isFinal).map((x) => x[0].transcript).join(' ');
      if (text.trim()) onText(text.trim());
    };
    r.onend = () => setState('idle');
    r.onerror = () => setState('idle');
    live.current = r;
    r.start();
    setState('live');
  }

  const secs = Math.floor(elapsed / 1000);
  if (state === 'recording' || state === 'live') {
    return (
      <button onClick={state === 'live' ? () => live.current?.stop() : stop} className="inline-flex items-center gap-2 rounded-full bg-signal px-3 py-1 text-xs font-medium text-white shadow-sm" aria-label="Stop dictation">
        <Square className="h-3 w-3 fill-current" />
        <span className="flex h-3.5 items-center gap-[2px]" aria-hidden="true">
          {(state === 'live' ? Array(12).fill(0.5) : levels).map((l, i) => (
            <span key={i} className={`w-[2px] rounded-full bg-white ${state === 'live' ? 'wave-bar' : ''}`} style={{ height: `${Math.round(l * 100)}%`, animationDelay: `${i * 60}ms` }} />
          ))}
        </span>
        {state === 'live' ? 'Listening' : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}
      </button>
    );
  }
  return (
    <button
      onClick={start}
      disabled={state === 'transcribing'}
      className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-2.5 py-0.5 text-xs text-ink-2 hover:border-ink-3 hover:text-ink"
      title="Dictate (free Whisper transcription)"
    >
      {state === 'transcribing' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />}
      {state === 'transcribing' ? 'Transcribing…' : 'Dictate'}
    </button>
  );
}
