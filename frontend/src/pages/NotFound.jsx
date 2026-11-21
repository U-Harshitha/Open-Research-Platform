import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-page flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="eyebrow">Error 404 · Not found</p>
      <h1 className="display mt-4 text-5xl">This page has no citation.</h1>
      <p className="mt-4 max-w-md text-ink-2">It may have moved, or never existed. Null results are results too.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/explore" className="btn-secondary">Explore research</Link>
      </div>
    </div>
  );
}
