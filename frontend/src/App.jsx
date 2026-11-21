import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import SiteLayout from './components/layout/SiteLayout.jsx';
import Landing from './pages/Landing.jsx';
import Explore from './pages/Explore.jsx';
import Project from './pages/Project.jsx';
import Collaborate from './pages/Collaborate.jsx';
import Guides, { Guide } from './pages/Guides.jsx';
import Profile from './pages/Profile.jsx';
import NewProject from './pages/NewProject.jsx';
import NotFound from './pages/NotFound.jsx';

// The editor pulls in Quill; load it only when someone opens the workspace.
const Workspace = lazy(() => import('./pages/Workspace.jsx'));

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="loading-dot h-2 w-2 rounded-full bg-ink-3" />
      ))}
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'rgb(var(--ink))',
            color: 'rgb(var(--paper))',
            fontSize: '0.875rem',
            borderRadius: '999px',
            padding: '8px 16px',
          },
        }}
      />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Landing />} />
            <Route path="explore" element={<Explore />} />
            <Route path="p/:slug" element={<Project />} />
            <Route path="collaborate" element={<Collaborate />} />
            <Route path="guides" element={<Guides />} />
            <Route path="guides/:slug" element={<Guide />} />
            <Route path="u/:handle" element={<Profile />} />
            <Route path="new" element={<NewProject />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="workspace" element={<Workspace />} />
          <Route path="workspace/:docId" element={<Workspace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
