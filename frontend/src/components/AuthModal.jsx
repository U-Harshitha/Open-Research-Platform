import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase.js';
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Globe, Monitor } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('signin'); // 'signin', 'signup', 'reset'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleProvider = new GoogleAuthProvider();

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();
      
      try {
        await setDoc(userRef, {
          displayName: displayName || additionalData.displayName || 'Anonymous User',
          email,
          photoURL: photoURL || null,
          createdAt,
          lastActive: createdAt,
          preferences: {
            theme: 'light',
            notifications: true,
            autoSave: true
          },
          stats: {
            documentsCreated: 0,
            collaborations: 0,
            totalEdits: 0
          },
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }
    
    return userRef;
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await createUserProfile(user);
      toast.success(`Welcome back, ${user.displayName || 'User'}!`);
      onAuthSuccess(user);
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Fallback to demo mode for development
      if (error.code === 'auth/configuration-not-found' || error.code === 'auth/user-not-found') {
        const demoUser = {
          uid: 'demo-email-' + Date.now(),
          displayName: formData.email.split('@')[0] || 'Demo User',
          email: formData.email,
          photoURL: null,
          isAnonymous: false,
          providerData: [{ providerId: 'password' }]
        };
        toast.success('Welcome to Demo Mode!');
        onAuthSuccess(demoUser);
      } else {
        toast.error(getAuthErrorMessage(error.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.displayName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Update user profile
      await updateProfile(user, {
        displayName: formData.displayName
      });

      await createUserProfile(user, {
        displayName: formData.displayName
      });

      toast.success(`Welcome to Research Nexus, ${formData.displayName}!`);
      onAuthSuccess(user);
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
      toast.success(`Welcome, ${result.user.displayName}!`);
      onAuthSuccess(result.user);
    } catch (error) {
      console.error('Google sign in error:', error);
      
      // If Firebase Auth is not properly configured, create a demo user
      if (error.code === 'auth/configuration-not-found' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        const demoUser = {
          uid: 'demo-google-' + Date.now(),
          displayName: 'Demo Google User',
          email: 'demo@google.com',
          photoURL: null,
          isAnonymous: false,
          providerData: [{ providerId: 'google.com' }]
        };
        toast.success('Welcome to Demo Mode!');
        onAuthSuccess(demoUser);
      } else {
        toast.error(getAuthErrorMessage(error.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      const { user } = await signInAnonymously(auth);
      await createUserProfile(user, {
        displayName: 'Guest User',
        isAnonymous: true
      });
      toast.success('Signed in as guest. You can upgrade your account anytime!');
      onAuthSuccess(user);
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      
      // Fallback to demo mode if Firebase Auth fails
      const demoUser = {
        uid: 'demo-guest-' + Date.now(),
        displayName: 'Demo Guest',
        email: null,
        photoURL: null,
        isAnonymous: true,
        providerData: []
      };
      toast.success('Welcome to Demo Mode as Guest!');
      onAuthSuccess(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast.success('Password reset email sent! Check your inbox.');
      setAuthMode('signin');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full m-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {authMode === 'signin' && 'Welcome Back'}
                {authMode === 'signup' && 'Join Research Nexus'}
                {authMode === 'reset' && 'Reset Password'}
              </h2>
              <p className="text-primary-100 mt-1">
                {authMode === 'signin' && 'Sign in to your account'}
                {authMode === 'signup' && 'Create your account'}
                {authMode === 'reset' && 'Enter your email to reset'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Social Sign In */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Globe className="w-5 h-5 mr-3 text-red-500" />
              Continue with Google
            </button>
            
            <button
              onClick={handleAnonymousSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <User className="w-5 h-5 mr-3 text-gray-500" />
              Continue as Guest
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Email Forms */}
          <form onSubmit={
            authMode === 'signin' ? handleEmailSignIn :
            authMode === 'signup' ? handleEmailSignUp :
            handlePasswordReset
          }>
            <div className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {authMode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-field pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {authMode === 'signin' && <><LogIn className="w-5 h-5 mr-2" /> Sign In</>}
                  {authMode === 'signup' && <><UserPlus className="w-5 h-5 mr-2" /> Create Account</>}
                  {authMode === 'reset' && <><Mail className="w-5 h-5 mr-2" /> Send Reset Email</>}
                </div>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm">
            {authMode === 'signin' && (
              <div className="space-y-2">
                <button
                  onClick={() => setAuthMode('reset')}
                  className="text-primary-600 hover:text-primary-700 block mx-auto"
                >
                  Forgot your password?
                </button>
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      resetForm();
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            )}

            {authMode === 'signup' && (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    resetForm();
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}

            {authMode === 'reset' && (
              <button
                onClick={() => {
                  setAuthMode('signin');
                  resetForm();
                }}
                className="text-primary-600 hover:text-primary-700"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;