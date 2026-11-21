// Short, practical guides for people starting to write research.
// Body is trusted static HTML authored here, rendered in .prose-paper.

export const GUIDES = [
  {
    slug: 'first-paper',
    title: 'Your first paper, section by section',
    minutes: 6,
    level: 'Start here',
    summary: 'What each part of a research article is for, and the order that makes them easier to write.',
    body: `
<p>Almost every empirical paper follows the same shape — <strong>Introduction, Methods, Results, Discussion</strong> (IMRaD). Readers rely on that shape to find what they need quickly, so following it is a kindness, not a constraint.</p>
<h2>Write it out of order</h2>
<p>Start with <strong>Methods</strong>: it is the most concrete and you already know what you did. Then <strong>Results</strong>, in the order of your questions. Then the <strong>Discussion</strong>, then the <strong>Introduction</strong> — which is much easier once you know what the paper actually shows. Write the <strong>Abstract</strong> last.</p>
<h2>What each section answers</h2>
<ul>
<li><strong>Introduction</strong> — what is known, what is not, and the one question this paper answers.</li>
<li><strong>Methods</strong> — could a stranger repeat this from the text alone?</li>
<li><strong>Results</strong> — what happened, with effect sizes and uncertainty. No interpretation yet.</li>
<li><strong>Discussion</strong> — what it means, how it fits earlier work, its limits, and what comes next.</li>
</ul>
<blockquote>A useful test: a reader from a neighbouring field should be able to state your question after the first paragraph.</blockquote>
<h3>On this platform</h3>
<p>Choose the <em>Research article</em> template when you start a project. Share it at the <em>Idea</em> or <em>Proposal</em> stage — feedback is most useful before you have collected data.</p>`,
  },
  {
    slug: 'abstracts',
    title: 'Writing an abstract people finish reading',
    minutes: 4,
    level: 'Writing',
    summary: 'Five sentences, each with a job. Most readers will never get past them.',
    body: `
<p>An abstract is not a teaser. It is the whole paper at one-twentieth scale, and for most readers it is the only part they will read.</p>
<h2>The five-sentence skeleton</h2>
<ol>
<li><strong>Context</strong> — the problem, in words an outsider understands.</li>
<li><strong>Gap</strong> — what is missing or contested.</li>
<li><strong>What you did</strong> — design, data, scale.</li>
<li><strong>What you found</strong> — the main result, with a number.</li>
<li><strong>Why it matters</strong> — the implication, stated no more strongly than the evidence allows.</li>
</ol>
<p>Then cut every word that does not earn its place. Avoid abbreviations, citations and phrases like “results are discussed”.</p>`,
  },
  {
    slug: 'peer-review',
    title: 'Giving (and receiving) open peer review',
    minutes: 5,
    level: 'Community',
    summary: 'How to write a review that helps the work, and how to respond to one without getting defensive.',
    body: `
<p>Open review means your report is public and, if you choose, signed. That tends to make reviews more careful and more constructive — and it means your reviewing becomes visible, creditable work.</p>
<h2>Writing a review</h2>
<ul>
<li>Start by restating the paper’s main claim in your own words. If you can’t, say so — that is useful feedback.</li>
<li>Separate <strong>major</strong> concerns (would change the conclusions) from <strong>minor</strong> ones (clarity, typos).</li>
<li>For every problem, suggest what would fix it.</li>
<li>Review the work, not the author.</li>
</ul>
<h2>Responding</h2>
<p>Reply point by point, quoting each comment. Say what you changed and where. When you disagree, explain why with evidence — reviewers can be wrong, and saying so politely is part of the process.</p>`,
  },
  {
    slug: 'across-disciplines',
    title: 'Collaborating across disciplines',
    minutes: 5,
    level: 'Collaboration',
    summary: 'The best questions sit between fields. Here is how to work with people who use different words for the same thing.',
    body: `
<p>An epidemiologist and a remote-sensing analyst can both say “exposure” and mean different things. Interdisciplinary projects rarely fail on skill; they fail on vocabulary and on unspoken expectations about credit.</p>
<h2>Before you start</h2>
<ul>
<li><strong>Write a shared glossary</strong> in the project. Ten terms is enough to surface the disagreements.</li>
<li><strong>Agree on contributor roles early</strong> using CRediT. It removes most authorship arguments before they begin.</li>
<li><strong>Agree where results will be published.</strong> Fields value different venues.</li>
</ul>
<h2>Posting a call</h2>
<p>Describe the problem, not just the job title. “We have five years of admissions data and need to link it to block-level temperature” attracts better collaborators than “Seeking GIS expert”.</p>`,
  },
  {
    slug: 'open-data-licences',
    title: 'Sharing data and choosing a licence',
    minutes: 4,
    level: 'Open science',
    summary: 'FAIR data in plain language, and which Creative Commons licence fits which kind of work.',
    body: `
<p>Shared data is only useful if someone else can find it, open it and understand it. The <strong>FAIR</strong> principles — Findable, Accessible, Interoperable, Reusable — are a checklist for that.</p>
<h2>A minimum for every dataset</h2>
<ul>
<li>A README describing each column, its units and how missing values are coded.</li>
<li>An open file format (CSV, JSON, Parquet) alongside anything proprietary.</li>
<li>A licence, so people know what they are allowed to do.</li>
</ul>
<h2>Licences, briefly</h2>
<ul>
<li><strong>CC BY 4.0</strong> — reuse with attribution. The default for open-access papers.</li>
<li><strong>CC0</strong> — no conditions. Common for data, because attribution chains break in large analyses.</li>
<li><strong>CC BY-NC</strong> — non-commercial only. Consider carefully: it can block legitimate reuse.</li>
</ul>
<p>Never share data that could identify people without consent and an ethics review that allows it.</p>`,
  },
  {
    slug: 'preregistration',
    title: 'Preregistration in ten minutes',
    minutes: 3,
    level: 'Methods',
    summary: 'Write down your hypotheses and analysis before you see the data, so your results mean what they say.',
    body: `
<p>Preregistration is a time-stamped plan: what you expect, how you will collect data, and exactly how you will analyse it. It protects you from the very human habit of finding the analysis that “works”.</p>
<h2>What to write down</h2>
<ol>
<li>Your hypotheses, phrased so they could be wrong.</li>
<li>Your sample size and how you chose it.</li>
<li>Your exclusion rules.</li>
<li>The exact analysis for each hypothesis.</li>
</ol>
<p>You can still run exploratory analyses — just label them as exploratory. Deviating from the plan is fine too; report what changed and why.</p>
<h3>On this platform</h3>
<p>The <em>Registered report</em> template has these sections ready. Lock a version before data collection and it becomes your timestamp.</p>`,
  },
];

export const guideBySlug = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));
