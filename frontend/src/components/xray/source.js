// Code excerpts are cut from the real source files at build time (Vite ?raw
// imports), between `xray:<name>` and `xray:end` comments — so they can't drift.
import mainSrc from '../../main.jsx?raw';
import appSrc from '../../App.jsx?raw';
import editorSrc from '../CollaborativeEditor.jsx?raw';
import projectsSrc from '../../lib/projects.js?raw';
import formatSrc from '../../lib/format.js?raw';
import backendSrc from '../../../../backend/ai_service_api.py?raw';
import modesSrc from '../../data/modes.js?raw';
import dictationSrc from '../workspace/Dictation.jsx?raw';

const FILES = {
  'frontend/src/main.jsx': mainSrc,
  'frontend/src/App.jsx': appSrc,
  'frontend/src/components/CollaborativeEditor.jsx': editorSrc,
  'frontend/src/lib/projects.js': projectsSrc,
  'frontend/src/lib/format.js': formatSrc,
  'backend/ai_service_api.py': backendSrc,
  'frontend/src/data/modes.js': modesSrc,
  'frontend/src/components/workspace/Dictation.jsx': dictationSrc,
};

export function excerpt(file, name) {
  const lines = (FILES[file] || '').split('\n');
  const start = lines.findIndex((l) => l.includes(`xray:${name}`));
  if (start === -1) return '';
  const end = lines.findIndex((l, i) => i > start && l.includes('xray:end'));
  const body = lines.slice(start + 1, end === -1 ? undefined : end);
  const indent = Math.min(...body.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
  return body.map((l) => l.slice(indent)).join('\n');
}

export const lineCount = (file) => (FILES[file] || '').split('\n').filter((l) => l.trim()).length;
