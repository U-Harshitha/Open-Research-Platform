import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';
import { XrayCorner } from '../xray/XrayButton.jsx';
import { PsstNote } from '../ui/Stickers.jsx';
import { useMode } from '../../context/ModeContext.jsx';

export default function SiteLayout() {
  const { pathname } = useLocation();
  const { mode } = useMode();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div key={`${mode}:${pathname}`} className="route-enter">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
      <XrayCorner />
      {mode === 'stories' && (
        <PsstNote id="words-tool">psst — in the editor, the <b>Words</b> tool finds rhymes, synonyms and better adjectives ✦</PsstNote>
      )}
    </div>
  );
}
