import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MODES } from '../data/modes.js';

const KEY = 'orn:mode';
const read = () => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('mode');
    if (MODES[fromUrl]) return fromUrl;
    return MODES[localStorage.getItem(KEY)] ? localStorage.getItem(KEY) : 'research';
  } catch {
    return 'research';
  }
};

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(read);

  const setMode = useCallback((next) => {
    if (!MODES[next]) return;
    setModeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('mode-switching');
    root.dataset.mode = mode;
    const t = setTimeout(() => root.classList.remove('mode-switching'), 600);
    return () => clearTimeout(t);
  }, [mode]);

  const value = useMemo(
    () => ({ mode, m: MODES[mode], setMode, toggle: () => setMode(mode === 'research' ? 'stories' : 'research') }),
    [mode, setMode]
  );
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext);
