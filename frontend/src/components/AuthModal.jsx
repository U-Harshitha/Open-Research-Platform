import React, { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth, db } from '../services/firebase.js';
import Logo from './ui/Logo.jsx';

// Firebase isn't configured for this auth method → fall back to a local demo
// session so the workspace can still be explored. Never on user error.
const NOT_CONFIGURED = ['auth/configuration-not-found', 'auth/operation-not-allowed', 'auth/admin-restricted-operation'];

const demoUser = (overrides) => ({
  uid: `demo-${Date.now()}`,
  displayName: 'Demo researcher',
  email: null,
  photoURL: null,
  isAnonymous: true,
  isDemo: true,
  providerData: [],
  ...overrides,
});

const errorMessage = (code) =>
  ({
    'auth/user-not-found': 'No account uses that email.',
    'auth/wrong-password': 'That password is incorrect.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Use at least 6 characters.',
    'auth/invalid-email': 'That email address doesn’t look right.',
    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
    'auth/unauthorized-domain': 'Sign-in isn’t enabled for this domain yet.',
    'auth/popup-blocked': 'Your browser blocked the sign-in window.',
  })[code] || 'Sign-in failed. Please try again.';

const COPY = {
  signin: { title: 'Welcome back', sub: 'Sign in to pick up where you left off.' },
  signup: { title: 'Join the commons', sub: 'Free for every researcher, student and curious mind.' },
  reset: { title: 'Reset your password', sub: 'We’ll email you a link.' },
};

const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMode = 'signin', reason }) => {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', displayName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const switchMode = (m) => {
    setMode(m);
    setForm({ email: '', password: '', confirmPassword: '', displayName: '' });
  };

  const createUserProfile = async (user, extra = {}) => {
    if (!user || !db) return;
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const now = new Date();
        await setDoc(ref, {
          displayName: user.displayName || extra.displayName || 'Researcher',
          email: user.email || null,
          photoURL: user.photoURL || null,
          createdAt: now,
          lastActive: now,
          fields: [],
          openToCollaborate: true,
          preferences: { notifications: true, autoSave: true },
          ...extra,
        });
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const run = async (fn) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = (e) => {
    e.preventDefault();
    if (mode === 'reset') return handleReset();
    if (mode === 'signup') {
      if (form.password !== form.confirmPassword) return toast.error('Passwords don’t match.');
      if (form.password.length < 6) return toast.error('Use at least 6 characters.');
    }
    run(async () => {
      try {
        if (mode === 'signin') {
          const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);
          await createUserProfile(user);
          toast.success(`Welcome back, ${user.displayName || 'researcher'}`);
          onAuthSuccess(user);
        } else {
          const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
          await updateProfile(user, { displayName: form.displayName });
          await createUserProfile(user, { displayName: form.displayName });
          toast.success(`Welcome, ${form.displayName}`);
          onAuthSuccess(user);
        }
      } catch (error) {
        console.error('Email auth error:', error);
        if (NOT_CONFIGURED.includes(error.code)) {
          toast('Email sign-in isn’t configured — opening a local demo session.');
          onAuthSuccess(demoUser({ displayName: form.displayName || form.email.split('@')[0], email: form.email, isAnonymous: false }));
        } else {
          toast.error(errorMessage(error.code));
        }
      }
    });
  };

  const handleGoogle = () =>
    run(async () => {
      try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        await createUserProfile(result.user);
        toast.success(`Welcome, ${result.user.displayName}`);
        onAuthSuccess(result.user);
      } catch (error) {
        console.error('Google sign in error:', error);
        if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error.code)) return;
        if (NOT_CONFIGURED.includes(error.code)) {
          toast('Google sign-in isn’t configured — opening a local demo session.');
          onAuthSuccess(demoUser({ isAnonymous: false }));
        } else {
          toast.error(errorMessage(error.code));
        }
      }
    });

  const handleGuest = () =>
    run(async () => {
      try {
        const { user } = await signInAnonymously(auth);
        await createUserProfile(user, { displayName: 'Guest', isAnonymous: true });
        toast.success('You’re in as a guest. Create an account any time to keep your work.');
        onAuthSuccess(user);
      } catch (error) {
        console.error('Anonymous sign in error:', error);
        toast('Guest sign-in isn’t available — opening a local demo session.');
        onAuthSuccess(demoUser());
      }
    });

  const handleReset = () => {
    if (!form.email) return toast.error('Enter your email address.');
    run(async () => {
      try {
        await sendPasswordResetEmail(auth, form.email);
        toast.success('Check your inbox for a reset link.');
        switchMode('signin');
      } catch (error) {
        toast.error(errorMessage(error.code));
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] animate-fade-in sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="w-full max-w-[26rem] overflow-hidden rounded-t-2xl border border-rule bg-surface shadow-lift animate-rise sm:rounded-2xl"
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <Logo compact />
          <button onClick={onClose} className="icon-btn -mr-2 -mt-1" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-5">
          <h2 id="auth-title" className="display text-[1.75rem] leading-tight">
            {COPY[mode].title}
          </h2>
          <p className="mt-1 text-sm text-ink-2">{reason || COPY[mode].sub}</p>

          {mode !== 'reset' && (
            <>
              <div className="mt-6 grid gap-2">
                <button onClick={handleGoogle} disabled={loading} className="btn-secondary w-full py-2.5">
                  <GoogleMark />
                  Continue with Google
                </button>
                <button onClick={handleGuest} disabled={loading} className="btn-ghost w-full py-2.5">
                  Try it as a guest
                </button>
              </div>
              <div className="my-5 flex items-center gap-3 text-2xs uppercase tracking-[0.14em] text-ink-3">
                <span className="h-px flex-1 bg-rule" />
                or with email
                <span className="h-px flex-1 bg-rule" />
              </div>
            </>
          )}

          <form onSubmit={handleEmail} className={`space-y-3 ${mode === 'reset' ? 'mt-6' : ''}`}>
            {mode === 'signup' && (
              <div>
                <label className="label" htmlFor="displayName">Name, as you’d like it cited</label>
                <input id="displayName" name="displayName" value={form.displayName} onChange={change} className="input-field" placeholder="e.g. A. Researcher" required autoComplete="name" />
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" name="email" value={form.email} onChange={change} className="input-field" placeholder="you@university.edu" required autoComplete="email" />
            </div>
            {mode !== 'reset' && (
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="label" htmlFor="password">Password</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => switchMode('reset')} className="text-xs text-ink-3 hover:text-accent">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={change}
                    className="input-field pr-10"
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {mode === 'signup' && (
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={change} className="input-field" required autoComplete="new-password" />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'reset' && 'Send reset link'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-2">
            {mode === 'signin' && (
              <>New here? <button onClick={() => switchMode('signup')} className="font-medium text-accent hover:underline">Create an account</button></>
            )}
            {mode === 'signup' && (
              <>Already have an account? <button onClick={() => switchMode('signin')} className="font-medium text-accent hover:underline">Sign in</button></>
            )}
            {mode === 'reset' && (
              <button onClick={() => switchMode('signin')} className="font-medium text-accent hover:underline">Back to sign in</button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
  </svg>
);

export default AuthModal;
