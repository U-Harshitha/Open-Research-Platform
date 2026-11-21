// SAMPLE DATA — fictional projects and people that show what the public
// index will look like. Every page that renders them says so. Replace with
// Firestore queries (public projects, calls, profiles) as those land.

export const SAMPLE_NOTICE =
  'Sample projects and people, shown so you can see how the platform works. The public index fills as researchers publish.';

export const RESEARCHERS = [
  { handle: 'amara-okafor', name: 'Amara Okafor', role: 'Environmental epidemiologist', affiliation: 'Coastal Health Lab', fields: ['health', 'earth'], open: true, bio: 'I study how heat, air and water shape children’s health in fast-growing cities. Looking for people who think in maps.' },
  { handle: 'lin-wei', name: 'Lin Wei', role: 'Computational linguist', affiliation: 'Language & Society Group', fields: ['computing', 'humanities'], open: true, bio: 'Code-mixing, pragmatics and the parts of language that models get wrong.' },
  { handle: 'sofia-marquez', name: 'Sofía Márquez', role: 'Social psychologist', affiliation: 'Open Replication Network', fields: ['social', 'meta'], open: false, bio: 'Replications, registered reports, and making null results publishable.' },
  { handle: 'tomas-novak', name: 'Tomáš Novák', role: 'Embedded systems engineer', affiliation: 'Independent researcher', fields: ['engineering'], open: true, bio: 'Cheap, robust sensors for places without reliable power.' },
  { handle: 'priya-raman', name: 'Priya Raman', role: 'Oral historian', affiliation: 'Coastal Memory Archive', fields: ['humanities', 'social'], open: true, bio: 'Recording how communities remember displacement, in their own words and languages.' },
  { handle: 'kenji-sato', name: 'Kenji Sato', role: 'Structural bioinformatician', affiliation: 'Molecular Modelling Lab', fields: ['life', 'computing'], open: false, bio: 'Protein–ligand interactions and honest benchmarks.' },
  { handle: 'noor-haddad', name: 'Noor Haddad', role: 'Meta-researcher', affiliation: 'Scholarly Communication Lab', fields: ['meta'], open: true, bio: 'How peer review works, and how it could work better.' },
  { handle: 'elena-petrova', name: 'Elena Petrova', role: 'Applied topologist', affiliation: 'Dynamics & Data Group', fields: ['math', 'earth'], open: true, bio: 'Using the shape of data to see tipping points before they tip.' },
  { handle: 'david-mensah', name: 'David Mensah', role: 'Agronomist', affiliation: 'Smallholder Systems Lab', fields: ['life', 'earth'], open: true, bio: 'Soil, water and what actually works on a two-hectare farm.' },
  { handle: 'ravi-iyer', name: 'Ravi Iyer', role: 'Biostatistician', affiliation: 'Independent researcher', fields: ['math', 'health'], open: true, bio: 'Happy to be the person who asks about your sample size.' },
];

export const researcherByHandle = Object.fromEntries(RESEARCHERS.map((r) => [r.handle, r]));

export const PROJECTS = [
  {
    mode: 'research',
    slug: 'urban-heat-childhood-asthma',
    title: 'Urban heat islands and childhood asthma admissions',
    question: 'Do the hottest city blocks send more children to hospital with asthma — and is it the heat, the air, or the housing?',
    disciplines: ['health', 'earth'],
    stage: 'active',
    license: 'cc-by-4.0',
    updated: '2026-11-19',
    version: 'v0.6',
    lead: 'amara-okafor',
    keywords: ['spatial epidemiology', 'heat exposure', 'paediatrics', 'remote sensing'],
    abstract: [
      'Cities warm unevenly. Blocks with little tree cover and dense housing can run several degrees hotter than parks a kilometre away, and those same blocks often carry more traffic pollution and older housing stock. Disentangling which exposure drives respiratory harm in children matters for where cities plant trees, reroute traffic, or retrofit homes.',
      'We link five years of paediatric asthma admissions to satellite-derived land surface temperature, ground-level PM2.5 and housing-age records at the census-block level, and fit spatial models that separate the three exposures. This page holds our protocol, cleaning code and an evolving draft.',
    ],
    contributors: [
      { handle: 'amara-okafor', roles: ['Conceptualization', 'Investigation', 'Writing – original draft'] },
      { handle: 'ravi-iyer', roles: ['Methodology', 'Formal analysis'] },
    ],
    seeking: ['GIS / remote-sensing analyst'],
    materials: [
      { type: 'protocol', title: 'Study protocol and exposure definitions', meta: 'PDF · v3' },
      { type: 'code', title: 'Admissions cleaning pipeline', meta: 'Python · 1.2k lines' },
      { type: 'dataset', title: 'Block-level temperature, 2019–2024', meta: 'CSV · 48 MB · CC0' },
      { type: 'preregistration', title: 'Analysis plan, registered before linkage', meta: 'Locked 2026-06-02' },
    ],
    questions: [
      { title: 'Is land surface temperature a fair proxy for the air temperature children breathe?', by: 'ravi-iyer', replies: 7, status: 'open' },
      { title: 'How should we handle admissions that list a school address instead of home?', by: 'amara-okafor', replies: 3, status: 'open' },
      { title: 'Lag structure: same-day vs 0–3 day cumulative exposure', by: 'ravi-iyer', replies: 12, status: 'resolved' },
    ],
    versions: [
      { v: 'v0.6', date: '2026-11-19', note: 'Added sensitivity analysis excluding school addresses' },
      { v: 'v0.5', date: '2026-10-30', note: 'Methods: switched to a BYM2 spatial model' },
      { v: 'v0.3', date: '2026-08-14', note: 'First full draft of introduction and methods' },
      { v: 'v0.1', date: '2026-06-02', note: 'Protocol and analysis plan registered' },
    ],
    reviews: [],
    followers: 214,
    builtOn: 2,
  },
  {
    mode: 'research',
    slug: 'code-mixed-sarcasm',
    title: 'Sarcasm in code-mixed Telugu–English social media',
    question: 'When speakers switch languages mid-sentence, does the switch itself signal sarcasm?',
    disciplines: ['computing', 'humanities'],
    stage: 'preprint',
    license: 'cc-by-4.0',
    updated: '2026-11-12',
    version: 'v1.2',
    lead: 'lin-wei',
    keywords: ['code-mixing', 'pragmatics', 'NLP', 'low-resource languages'],
    abstract: [
      'Most sarcasm detectors are trained on monolingual English. Yet much of the world posts in mixed languages, and switching language is itself a pragmatic move — sometimes the very thing that tells a reader not to take a sentence literally.',
      'We release an annotated corpus of 18,000 Telugu–English posts, show that switch points carry signal a monolingual model ignores, and invite linguists to challenge our annotation scheme in the open questions below.',
    ],
    contributors: [
      { handle: 'lin-wei', roles: ['Conceptualization', 'Software', 'Writing – original draft'] },
      { handle: 'priya-raman', roles: ['Data curation', 'Validation'] },
    ],
    seeking: ['Sociolinguist (Telugu)'],
    materials: [
      { type: 'dataset', title: 'Annotated corpus, 18k posts', meta: 'JSONL · CC BY 4.0' },
      { type: 'code', title: 'Baselines and switch-point features', meta: 'Python · notebooks' },
      { type: 'protocol', title: 'Annotation guidelines', meta: 'PDF · 14 pages' },
    ],
    questions: [
      { title: 'Should romanised Telugu be treated as a separate variety?', by: 'priya-raman', replies: 9, status: 'open' },
      { title: 'Inter-annotator agreement is low for irony vs sarcasm', by: 'lin-wei', replies: 5, status: 'open' },
    ],
    versions: [
      { v: 'v1.2', date: '2026-11-12', note: 'Responded to community comments on annotation scheme' },
      { v: 'v1.0', date: '2026-10-01', note: 'Preprint released with DOI' },
      { v: 'v0.4', date: '2026-07-20', note: 'Corpus frozen' },
    ],
    reviews: [
      { by: 'Community reviewer', verdict: 'Minor revisions', summary: 'Strong corpus contribution. Please report agreement per label and add a romanised-script ablation.' },
    ],
    followers: 389,
    builtOn: 5,
  },
  {
    mode: 'research',
    slug: 'ego-depletion-many-labs',
    title: 'A preregistered multi-site replication of ego depletion',
    question: 'Does exerting self-control on one task really make the next one harder?',
    disciplines: ['social', 'meta'],
    stage: 'review',
    license: 'cc-by-4.0',
    updated: '2026-11-08',
    version: 'v2.0',
    lead: 'sofia-marquez',
    keywords: ['replication', 'registered report', 'self-control', 'many labs'],
    abstract: [
      'Ego depletion was one of psychology’s most cited effects before large replications produced mixed results. We ran a registered report across 23 sites (N = 3,412) with a protocol agreed with the original authors in advance.',
      'The pooled effect is small and its confidence interval includes zero. All data, site-level analyses, and the original authors’ commentary are linked here, and the open review is in progress.',
    ],
    contributors: [
      { handle: 'sofia-marquez', roles: ['Conceptualization', 'Project administration', 'Writing – original draft'] },
      { handle: 'ravi-iyer', roles: ['Formal analysis', 'Visualization'] },
      { handle: 'noor-haddad', roles: ['Writing – review & editing'] },
    ],
    seeking: [],
    materials: [
      { type: 'preregistration', title: 'Stage 1 registered report', meta: 'Accepted in principle' },
      { type: 'dataset', title: 'Trial-level data, 23 sites', meta: 'CSV · CC0' },
      { type: 'code', title: 'Meta-analytic models', meta: 'R · reproducible' },
    ],
    questions: [
      { title: 'Should sites with manipulation-check failures be excluded?', by: 'noor-haddad', replies: 18, status: 'resolved' },
    ],
    versions: [
      { v: 'v2.0', date: '2026-11-08', note: 'Stage 2 manuscript submitted for open review' },
      { v: 'v1.0', date: '2025-09-15', note: 'Stage 1 accepted in principle' },
    ],
    reviews: [
      { by: 'Reviewer 1 (signed)', verdict: 'Accept', summary: 'Executed as registered. Exemplary transparency around site deviations.' },
      { by: 'Reviewer 2', verdict: 'Minor revisions', summary: 'Add a Bayesian estimate so readers can judge evidence for the null.' },
    ],
    followers: 1032,
    builtOn: 3,
  },
  {
    mode: 'research',
    slug: 'low-cost-soil-moisture',
    title: 'Low-cost soil moisture sensing for smallholder farms',
    question: 'Can a sensor that costs less than a sack of fertiliser tell a farmer when to irrigate?',
    disciplines: ['engineering', 'life'],
    stage: 'active',
    license: 'cc-by-sa-4.0',
    updated: '2026-11-17',
    version: 'v0.4',
    lead: 'tomas-novak',
    keywords: ['open hardware', 'capacitive sensing', 'agriculture', 'LoRa'],
    abstract: [
      'Commercial soil probes cost hundreds of dollars. We are building an open-hardware capacitive probe from commodity parts, calibrating it against gravimetric samples across three soil types, and field-testing it on partner farms.',
      'Schematics, firmware and calibration data are published as we go. We need an agronomist to help translate sensor readings into irrigation advice that fits local practice.',
    ],
    contributors: [
      { handle: 'tomas-novak', roles: ['Conceptualization', 'Software', 'Resources'] },
      { handle: 'david-mensah', roles: ['Investigation'] },
    ],
    seeking: ['Agronomist (irrigation scheduling)', 'Field partner, East Africa'],
    materials: [
      { type: 'code', title: 'Firmware and LoRa gateway', meta: 'C++ · MIT' },
      { type: 'protocol', title: 'Gravimetric calibration protocol', meta: 'PDF' },
      { type: 'figure', title: 'Calibration curves, three soils', meta: 'SVG' },
    ],
    questions: [
      { title: 'Sensor drift after six weeks buried — encapsulation ideas?', by: 'tomas-novak', replies: 14, status: 'open' },
    ],
    versions: [
      { v: 'v0.4', date: '2026-11-17', note: 'Clay-soil calibration added' },
      { v: 'v0.2', date: '2026-09-03', note: 'Hardware rev B' },
    ],
    reviews: [],
    followers: 176,
    builtOn: 7,
  },
  {
    mode: 'research',
    slug: 'cyclone-relocation-oral-histories',
    title: 'Oral histories of fishing communities after cyclone relocation',
    question: 'What do families lose — and keep — when they are moved inland after a cyclone?',
    disciplines: ['humanities', 'social'],
    stage: 'proposal',
    license: 'cc-by-nc-4.0',
    updated: '2026-11-03',
    version: 'v0.2',
    lead: 'priya-raman',
    keywords: ['oral history', 'climate displacement', 'ethics', 'archives'],
    abstract: [
      'Relocation policy is usually evaluated in housing units and compensation paid. This project records, in Telugu and Odia, how relocated fishing families describe what changed: work, ritual, kinship, and their relationship with the sea.',
      'The proposal sets out consent and community-ownership terms for the recordings. We want feedback from archivists and from anyone who has run participatory research with displaced communities.',
    ],
    contributors: [{ handle: 'priya-raman', roles: ['Conceptualization', 'Methodology', 'Writing – original draft'] }],
    seeking: ['Digital archivist', 'Climate-migration researcher'],
    materials: [
      { type: 'protocol', title: 'Consent and community ownership framework', meta: 'Draft for comment' },
    ],
    questions: [
      { title: 'Who should hold the copyright to a recorded life story?', by: 'priya-raman', replies: 21, status: 'open' },
    ],
    versions: [{ v: 'v0.2', date: '2026-11-03', note: 'Revised consent framework after comments' }],
    reviews: [],
    followers: 98,
    builtOn: 0,
  },
  {
    mode: 'research',
    slug: 'gnn-binding-affinity',
    title: 'How much do graph neural networks really learn about binding?',
    question: 'Are protein–ligand affinity models learning chemistry, or memorising the benchmark?',
    disciplines: ['life', 'computing'],
    stage: 'preprint',
    license: 'cc-by-4.0',
    updated: '2026-10-28',
    version: 'v1.0',
    lead: 'kenji-sato',
    keywords: ['drug discovery', 'benchmarks', 'data leakage', 'GNNs'],
    abstract: [
      'Reported accuracy of binding-affinity models has climbed steadily. We show that much of that gain disappears under a split that keeps similar proteins out of both training and test sets.',
      'We release the leakage-free split and invite groups to re-run their models against it.',
    ],
    contributors: [{ handle: 'kenji-sato', roles: ['Conceptualization', 'Software', 'Formal analysis', 'Writing – original draft'] }],
    seeking: [],
    materials: [
      { type: 'dataset', title: 'Leakage-free benchmark split', meta: 'CSV · CC BY 4.0' },
      { type: 'code', title: 'Evaluation harness', meta: 'Python' },
    ],
    questions: [
      { title: 'Submit your model’s results on the new split here', by: 'kenji-sato', replies: 31, status: 'open' },
    ],
    versions: [{ v: 'v1.0', date: '2026-10-28', note: 'Preprint with DOI' }],
    reviews: [],
    followers: 642,
    builtOn: 11,
  },
  {
    mode: 'research',
    slug: 'open-peer-review-survey',
    title: 'Open peer review across 40 journals: who signs, and why?',
    question: 'When reviewers can sign their reports, which ones do — and does it change what they write?',
    disciplines: ['meta', 'social'],
    stage: 'published',
    license: 'cc-by-4.0',
    updated: '2026-09-21',
    version: 'v3.1',
    lead: 'noor-haddad',
    keywords: ['peer review', 'open science', 'scholarly communication'],
    abstract: [
      'We analysed 52,000 review reports from journals that let reviewers choose whether to sign. Signing rates differ sharply by field and career stage, and signed reviews are longer and more constructive in tone, with no detectable difference in recommendation.',
    ],
    contributors: [
      { handle: 'noor-haddad', roles: ['Conceptualization', 'Data curation', 'Writing – original draft'] },
      { handle: 'sofia-marquez', roles: ['Methodology', 'Writing – review & editing'] },
    ],
    seeking: [],
    materials: [
      { type: 'dataset', title: 'De-identified review metadata', meta: 'CSV · CC0' },
      { type: 'code', title: 'Tone classifier and analysis', meta: 'R + Python' },
    ],
    questions: [],
    versions: [
      { v: 'v3.1', date: '2026-09-21', note: 'Corrected a coding error in Table 2 (see note)' },
      { v: 'v3.0', date: '2026-05-10', note: 'Published version' },
    ],
    reviews: [
      { by: 'Reviewer 1 (signed)', verdict: 'Accept', summary: 'Careful and important. The career-stage analysis deserves its own paper.' },
    ],
    followers: 1290,
    builtOn: 4,
  },
  {
    mode: 'research',
    slug: 'topology-early-warning',
    title: 'Topological early-warning signals for ecosystem collapse',
    question: 'Can the changing shape of sensor data warn us before a lake flips to an algae-dominated state?',
    disciplines: ['math', 'earth'],
    stage: 'idea',
    license: 'cc-by-4.0',
    updated: '2026-11-20',
    version: 'v0.1',
    lead: 'elena-petrova',
    keywords: ['persistent homology', 'tipping points', 'limnology'],
    abstract: [
      'Classical early-warning signals — rising variance, slowing recovery — need long, clean time series. Persistent homology may detect structural change in shorter, noisier multivariate data. This is an idea looking for an ecologist with lake sensor data.',
    ],
    contributors: [{ handle: 'elena-petrova', roles: ['Conceptualization'] }],
    seeking: ['Freshwater ecologist with sensor data'],
    materials: [],
    questions: [
      { title: 'Which public lake datasets have high-frequency multivariate sensors?', by: 'elena-petrova', replies: 4, status: 'open' },
    ],
    versions: [{ v: 'v0.1', date: '2026-11-20', note: 'Idea posted' }],
    reviews: [],
    followers: 57,
    builtOn: 0,
  },
];

export const projectBySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));

// Open calls for collaborators, derived from what each project is seeking.
const CALL_DETAILS = {
  'GIS / remote-sensing analyst': { skills: ['Google Earth Engine', 'Landsat LST', 'R or Python'], commitment: '4–6 hrs / week', toward: 'earth' },
  'Sociolinguist (Telugu)': { skills: ['Telugu', 'Pragmatics', 'Annotation design'], commitment: 'Advisory · ~2 hrs / week', toward: 'humanities' },
  'Agronomist (irrigation scheduling)': { skills: ['Irrigation', 'Field trials', 'Extension work'], commitment: '3 months · flexible', toward: 'life' },
  'Field partner, East Africa': { skills: ['Farmer networks', 'Swahili'], commitment: 'One growing season', toward: 'social' },
  'Digital archivist': { skills: ['Audio preservation', 'Metadata standards', 'Community archives'], commitment: 'Advisory', toward: 'humanities' },
  'Climate-migration researcher': { skills: ['Displacement policy', 'Mixed methods'], commitment: 'Co-investigator', toward: 'social' },
  'Freshwater ecologist with sensor data': { skills: ['Limnology', 'Buoy sensor data'], commitment: 'Co-author', toward: 'earth' },
};

export const CALLS = PROJECTS.flatMap((p) =>
  p.seeking.map((role, i) => ({
    id: `${p.slug}-${i}`,
    role,
    project: p.slug,
    from: p.disciplines[0],
    toward: CALL_DETAILS[role]?.toward || p.disciplines[1] || p.disciplines[0],
    skills: CALL_DETAILS[role]?.skills || [],
    commitment: CALL_DETAILS[role]?.commitment || 'Flexible',
    posted: p.updated,
  }))
);
