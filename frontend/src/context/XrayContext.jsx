import React, { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// The panel (and the raw source it quotes) loads only when X-ray is opened.
const XrayPanel = lazy(() => import('../components/xray/XrayPanel.jsx'));

const XrayContext = createContext({ open: false, toggle: () => {}, close: () => {} });

export function XrayProvider({ children }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-xray', open);
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const value = useMemo(() => ({ open, toggle, close }), [open, toggle, close]);
  return (
    <XrayContext.Provider value={value}>
      {children}
      {open && (
        <Suspense fallback={null}>
          <XrayPanel onClose={close} />
        </Suspense>
      )}
    </XrayContext.Provider>
  );
}

export const useXray = () => useContext(XrayContext);
