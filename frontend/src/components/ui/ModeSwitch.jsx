import React from 'react';
import { useMode } from '../../context/ModeContext.jsx';

export default function ModeSwitch({ className = '' }) {
  const { mode, setMode } = useMode();
  return (
    <div className={`mode-switch ${className}`} role="group" aria-label="Switch between research and stories">
      <span className="thumb" aria-hidden="true" />
      <button type="button" aria-pressed={mode === 'research'} onClick={() => setMode('research')}>Research</button>
      <button type="button" aria-pressed={mode === 'stories'} onClick={() => setMode('stories')}>Stories</button>
    </div>
  );
}
