import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, PenLine, Plus, X } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth, displayNameOf } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/explore', label: 'Explore' },
  { to: '/collaborate', label: 'Collaborate' },
  { to: '/guides', label: 'Guides' },
];

export default function SiteHeader() {
  const { user, openAuth, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const link = ({ isActive }) =>
    `text-sm transition-colors ${isActive ? 'text-ink font-medium' : 'text-ink-2 hover:text-ink'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-rule/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-page items-center gap-8 px-4 sm:px-6">
        <Link to="/" aria-label="Research Nexus home" className="shrink-0">
          <Logo compact />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={link}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link to="/workspace" className="btn-ghost hidden sm:inline-flex">
                <PenLine className="h-4 w-4" /> Workspace
              </Link>
              <Link to="/new" className="btn-primary hidden sm:inline-flex">
                <Plus className="h-4 w-4" /> New project
              </Link>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenu(!menu)} className="ml-1 rounded-full" aria-label="Account menu" aria-expanded={menu}>
                  <Avatar name={displayNameOf(user)} photo={user.photoURL} size="h-8 w-8 text-xs" />
                </button>
                {menu && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-rule bg-surface py-1 shadow-lift animate-fade-in">
                    <div className="border-b border-rule px-4 py-3">
                      <p className="truncate text-sm font-medium">{displayNameOf(user)}</p>
                      <p className="truncate text-xs text-ink-3">
                        {user.isDemo ? 'Local demo session' : user.isAnonymous ? 'Guest session' : user.email}
                      </p>
                    </div>
                    <button onClick={() => navigate('/workspace')} className="block w-full px-4 py-2 text-left text-sm hover:bg-sunken">Your workspace</button>
                    <button onClick={() => navigate('/new')} className="block w-full px-4 py-2 text-left text-sm hover:bg-sunken">Start a project</button>
                    <button onClick={signOut} className="flex w-full items-center gap-2 border-t border-rule px-4 py-2 text-left text-sm text-ink-2 hover:bg-sunken">
                      <LogOut className="h-3.5 w-3.5" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => openAuth()} className="btn-ghost hidden sm:inline-flex">Sign in</button>
              <button onClick={() => openAuth({ mode: 'signup' })} className="btn-primary hidden sm:inline-flex">
                Start writing
              </button>
            </>
          )}
          <button className="icon-btn md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-rule bg-paper px-4 pb-5 pt-2 md:hidden animate-fade-in">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className="border-b border-rule py-3 font-serif text-lg">
                {n.label}
              </NavLink>
            ))}
            {user && (
              <NavLink to="/workspace" className="border-b border-rule py-3 font-serif text-lg">Workspace</NavLink>
            )}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {user ? (
              <>
                <Link to="/new" className="btn-primary">New project</Link>
                <button onClick={signOut} className="btn-secondary">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth()} className="btn-secondary">Sign in</button>
                <button onClick={() => openAuth({ mode: 'signup' })} className="btn-primary">Start writing</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
