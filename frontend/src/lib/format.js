const TODAY = () => new Date();

export function relativeDate(input) {
  if (!input) return 'just now';
  const d = input?.toDate ? input.toDate() : new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.floor((TODAY() - d) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '·';

export const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Honest numbers computed from the manuscript itself.
export function manuscriptStats(html = '') {
  const text = stripHtml(html);
  const words = text ? text.split(' ').length : 0;
  return {
    words,
    minutes: Math.max(1, Math.round(words / 230)),
    sections: (html.match(/<h[12][ >]/g) || []).length,
    citations: new Set(text.match(/\[\d+\]/g) || []).size,
    figures: (html.match(/<img /g) || []).length,
  };
}

export function bibtexFor(project, authors) {
  const year = (project.updated || '').slice(0, 4) || new Date().getFullYear();
  const key = `${(authors[0]?.split(' ').pop() || 'anon').toLowerCase()}${year}${project.slug.split('-')[0]}`;
  return `@misc{${key},
  title  = {${project.title}},
  author = {${authors.join(' and ')}},
  year   = {${year}},
  note   = {${project.version}, Open Research Nexus},
  url    = {${typeof window !== 'undefined' ? window.location.origin : ''}${import.meta.env.BASE_URL}p/${project.slug}}
}`;
}
