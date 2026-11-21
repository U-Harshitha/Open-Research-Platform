import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import { PORTFOLIO_URL } from '../../lib/config.js';

const COLS = [
  { title: 'Research', links: [['Explore projects', '/explore'], ['Open calls', '/collaborate'], ['Start a project', '/new']] },
  { title: 'Learn', links: [['Your first paper', '/guides/first-paper'], ['Open peer review', '/guides/peer-review'], ['Data & licences', '/guides/open-data-licences']] },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-page gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-2">
            An open home for research — drafted together, versioned in public, and free to build on.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="eyebrow mb-3">{c.title}</p>
            <ul className="space-y-2 text-sm">
              {c.links.map(([label, to]) => (
                <li key={to}><Link to={to} className="text-ink-2 hover:text-ink">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="eyebrow mb-3">Project</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://github.com/U-Harshitha/Open-Research-Platform" className="inline-flex items-center gap-1 text-ink-2 hover:text-ink">
                Source on GitHub <ArrowUpRight className="h-3 w-3" />
              </a>
            </li>
            <li>
              <a href={PORTFOLIO_URL} className="inline-flex items-center gap-1 text-ink-2 hover:text-ink">
                Back to the portfolio <ArrowUpRight className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-2 px-4 py-4 font-mono text-2xs uppercase tracking-[0.12em] text-ink-3 sm:px-6">
          <span>Open Research Nexus · MIT licensed</span>
          <span>Contributor roles follow CRediT · Content CC BY 4.0 by default</span>
        </div>
      </div>
    </footer>
  );
}
