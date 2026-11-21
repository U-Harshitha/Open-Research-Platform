// Platform vocabulary: disciplines, lifecycle stages, contributor roles,
// licences and manuscript templates. These are real taxonomies and stay
// when sample data (data/samples.js) is replaced by live data.

export const DISCIPLINES = [
  { id: 'life', label: 'Life sciences', short: 'Life', color: '#2F7D5B' },
  { id: 'health', label: 'Health & medicine', short: 'Health', color: '#B23A3A' },
  { id: 'physical', label: 'Physical sciences', short: 'Physical', color: '#2E5AAC' },
  { id: 'earth', label: 'Earth & environment', short: 'Earth', color: '#1F7A80' },
  { id: 'computing', label: 'Computing & AI', short: 'Computing', color: '#6045B0' },
  { id: 'math', label: 'Mathematics & statistics', short: 'Math', color: '#4B5567' },
  { id: 'engineering', label: 'Engineering', short: 'Engineering', color: '#B85A0D' },
  { id: 'social', label: 'Social sciences', short: 'Social', color: '#9A6B12' },
  { id: 'humanities', label: 'Humanities', short: 'Humanities', color: '#A2405C' },
  { id: 'arts', label: 'Arts & design', short: 'Arts', color: '#8A4FA0' },
  { id: 'meta', label: 'Meta-research', short: 'Meta', color: '#5C6B2E' },
];

export const disciplineById = Object.fromEntries(DISCIPLINES.map((d) => [d.id, d]));

// A project moves through these openly. Sharing early is the point.
export const STAGES = [
  { id: 'idea', label: 'Idea', blurb: 'A question worth asking, shared to find collaborators.' },
  { id: 'proposal', label: 'Proposal', blurb: 'Aims, methods and a plan — open for critique.' },
  { id: 'active', label: 'In progress', blurb: 'Data collection, analysis and drafting.' },
  { id: 'preprint', label: 'Preprint', blurb: 'A complete draft, citable and open to comment.' },
  { id: 'review', label: 'In review', blurb: 'Open peer review, with responses on the record.' },
  { id: 'published', label: 'Published', blurb: 'Versioned, citable, and ready to be built on.' },
];

export const stageById = Object.fromEntries(STAGES.map((s, i) => [s.id, { ...s, index: i }]));

// CRediT — Contributor Roles Taxonomy (credit.niso.org)
export const CREDIT_ROLES = [
  'Conceptualization',
  'Data curation',
  'Formal analysis',
  'Funding acquisition',
  'Investigation',
  'Methodology',
  'Project administration',
  'Resources',
  'Software',
  'Supervision',
  'Validation',
  'Visualization',
  'Writing – original draft',
  'Writing – review & editing',
];

export const LICENSES = [
  { id: 'cc-by-4.0', label: 'CC BY 4.0', blurb: 'Anyone can reuse with attribution. The open-access default.' },
  { id: 'cc-by-sa-4.0', label: 'CC BY-SA 4.0', blurb: 'Reuse with attribution; derivatives must share alike.' },
  { id: 'cc-by-nc-4.0', label: 'CC BY-NC 4.0', blurb: 'Attribution, non-commercial reuse only.' },
  { id: 'cc0', label: 'CC0', blurb: 'Public domain dedication. Common for datasets.' },
  { id: 'all-rights', label: 'All rights reserved', blurb: 'Readable, not reusable without permission.' },
];

export const MATERIAL_TYPES = {
  dataset: { label: 'Dataset' },
  code: { label: 'Code' },
  protocol: { label: 'Protocol' },
  paper: { label: 'Paper' },
  figure: { label: 'Figure' },
  preregistration: { label: 'Preregistration' },
};

// How open-source ideas map onto research. Shown on the landing page.
export const PARALLELS = [
  { code: 'Repository', research: 'Project', note: 'Manuscript, data, code and protocols in one place.' },
  { code: 'Commit', research: 'Version', note: 'Every draft is kept, diffable and citable.' },
  { code: 'Issue', research: 'Open question', note: 'Threads for doubts, gaps and next experiments.' },
  { code: 'Pull request', research: 'Proposed revision', note: 'Suggest changes; authors accept with credit.' },
  { code: 'Fork', research: 'Build on', note: 'Replicate, extend or reanalyse — linked to the original.' },
  { code: 'Contributors', research: 'CRediT roles', note: 'Say exactly who did what, not just author order.' },
];

const h = (strings) => strings.join('');

// Starting points for people writing research, many for the first time.
export const TEMPLATES = [
  {
    id: 'imrad',
    name: 'Research article',
    kind: 'IMRaD',
    blurb: 'Introduction, Methods, Results and Discussion — the standard empirical paper.',
    sections: ['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'References'],
    content: h([
      '<h1>Working title</h1>',
      '<h3>Abstract</h3><p><em>In 150–250 words: the question, why it matters, what you did, what you found, and what it means.</em></p>',
      '<h2>1. Introduction</h2><p><em>What is known, what is not, and the specific question this paper answers.</em></p>',
      '<h2>2. Methods</h2><p><em>Enough detail that someone else could repeat it: participants or materials, procedure, analysis plan.</em></p>',
      '<h2>3. Results</h2><p><em>What you found, in the order of your questions. Report effect sizes and uncertainty, not only p-values.</em></p>',
      '<h2>4. Discussion</h2><p><em>What the results mean, how they fit prior work, limitations, and what should come next.</em></p>',
      '<h2>References</h2><p>[1] </p>',
    ]),
  },
  {
    id: 'review',
    name: 'Literature review',
    kind: 'Review',
    blurb: 'Map what a field knows, where it disagrees, and what nobody has asked yet.',
    sections: ['Scope', 'Search strategy', 'Themes', 'Gaps', 'References'],
    content: h([
      '<h1>Working title</h1>',
      '<h3>Scope</h3><p><em>The question the review answers and the boundaries you drew (years, fields, study types).</em></p>',
      '<h2>1. Search strategy</h2><p><em>Databases, search strings, inclusion and exclusion criteria.</em></p>',
      '<h2>2. Themes</h2><p><em>Group the literature by idea, not by paper.</em></p>',
      '<h2>3. Gaps and open questions</h2><p><em>Where evidence is thin, conflicting, or missing entirely.</em></p>',
      '<h2>References</h2><p>[1] </p>',
    ]),
  },
  {
    id: 'proposal',
    name: 'Research proposal',
    kind: 'Proposal',
    blurb: 'Aims, background, methods and timeline — for a grant, a thesis, or a collaborator.',
    sections: ['Summary', 'Aims', 'Background', 'Approach', 'Timeline', 'Team'],
    content: h([
      '<h1>Working title</h1>',
      '<h3>Summary</h3><p><em>Two or three sentences a reviewer from another field would understand.</em></p>',
      '<h2>1. Specific aims</h2><ol><li><em>Aim 1 — </em></li><li><em>Aim 2 — </em></li></ol>',
      '<h2>2. Background and significance</h2><p></p>',
      '<h2>3. Approach</h2><p><em>For each aim: design, data, analysis, and what could go wrong.</em></p>',
      '<h2>4. Timeline</h2><p></p>',
      '<h2>5. Team and expertise needed</h2><p><em>Which skills you have, and which you are looking for.</em></p>',
    ]),
  },
  {
    id: 'registered',
    name: 'Registered report',
    kind: 'Pre-registration',
    blurb: 'Commit to hypotheses and analysis before seeing the data. Reviewed on the question, not the result.',
    sections: ['Hypotheses', 'Design', 'Sampling plan', 'Analysis plan', 'Deviations'],
    content: h([
      '<h1>Working title</h1>',
      '<h2>1. Hypotheses</h2><p><em>State each one so it could be wrong.</em></p>',
      '<h2>2. Design</h2><p></p>',
      '<h2>3. Sampling plan</h2><p><em>Sample size and how you justified it (power analysis or precision).</em></p>',
      '<h2>4. Analysis plan</h2><p><em>The exact tests, exclusion rules and thresholds, decided now.</em></p>',
      '<h2>5. Deviations</h2><p><em>Filled in later: anything you changed and why.</em></p>',
    ]),
  },
  {
    id: 'replication',
    name: 'Replication study',
    kind: 'Replication',
    blurb: 'Re-run a published finding. Links back to the original so both get credit.',
    sections: ['Original claim', 'Differences', 'Methods', 'Results', 'Verdict'],
    content: h([
      '<h1>Replication of: </h1>',
      '<h3>Original claim</h3><p><em>Cite the study and quote the specific finding being tested.</em></p>',
      '<h2>1. What is the same, what differs</h2><p></p>',
      '<h2>2. Methods</h2><p></p>',
      '<h2>3. Results</h2><p></p>',
      '<h2>4. Does it replicate?</h2><p><em>Compare effect sizes, not just significance.</em></p>',
    ]),
  },
  {
    id: 'blank',
    name: 'Blank page',
    kind: 'Freeform',
    blurb: 'Notes, an essay, a field report — no structure until you want one.',
    sections: [],
    content: '<h1>Untitled</h1><p></p>',
  },
];

export const templateById = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));
