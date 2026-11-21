import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { auth } from '../services/firebase.js';
import AuthModal from '../components/AuthModal.jsx';

const AuthContext = createContext(null);

export const displayNameOf = (user) =>
  user?.displayName || user?.email?.split('@')[0] || (user?.isAnonymous ? 'Guest' : 'Researcher');

// Demo sessions (Firebase auth unavailable) survive reloads in this browser.
const DEMO_KEY = 'orn:demo-user:v1';
const loadDemo = () => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY)) || null;
  } catch {
    return null;
  }
};
const saveDemo = (u) => {
  try {
    if (u?.isDemo) localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    else localStorage.removeItem(DEMO_KEY);
  } catch {
    /* ignore */
  }
};

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(loadDemo);
  const setUser = useCallback((next) => {
    setUserState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      saveDemo(value);
      return value;
    });
  }, []);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'signin', reason: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser((prev) => u || (prev?.isDemo ? prev : null));
      setLoading(false);
    });
    return unsub;
  }, [setUser]);

  const openAuth = useCallback((opts = {}) => {
    setModal({ open: true, mode: opts.mode || 'signin', reason: opts.reason || null });
  }, []);

  const closeAuth = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  const signOut = useCallback(async () => {
    try {
      if (!user?.isDemo) await fbSignOut(auth);
      setUser(null);
      toast.success('Signed out');
    } catch (e) {
      console.error(e);
      toast.error('Could not sign out');
    }
  }, [user, setUser]);

  const value = useMemo(
    () => ({ user, loading, openAuth, closeAuth, signOut }),
    [user, loading, openAuth, closeAuth, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modal.open && (
        <AuthModal
          isOpen
          initialMode={modal.mode}
          reason={modal.reason}
          onClose={closeAuth}
          onAuthSuccess={(u) => {
            setUser(u);
            closeAuth();
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
