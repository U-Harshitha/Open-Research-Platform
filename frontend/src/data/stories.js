// Stories mode: the same engine as research (projects, versions, threads,
// suggested edits, remixes, credits), with a writer's vocabulary.
// IDs are distinct from research ones so lookups can be shared.

const h = (parts) => parts.join('');

export const GENRES = [
  { id: 'literary', label: 'Literary fiction', short: 'Literary', color: '#B5524A' },
  { id: 'fantasy', label: 'Fantasy', short: 'Fantasy', color: '#6B4FA8' },
  { id: 'scifi', label: 'Science fiction', short: 'Sci-fi', color: '#2F7A9A' },
  { id: 'mystery', label: 'Mystery & thriller', short: 'Mystery', color: '#3D4A5C' },
  { id: 'romance', label: 'Romance', short: 'Romance', color: '#D0587E' },
  { id: 'horror', label: 'Horror', short: 'Horror', color: '#7A2E2E' },
  { id: 'historical', label: 'Historical', short: 'Historical', color: '#9C6B2F' },
  { id: 'poetry', label: 'Poetry', short: 'Poetry', color: '#C77D2E' },
  { id: 'ya', label: 'Young adult', short: 'YA', color: '#3E8E6A' },
  { id: 'kids', label: 'Children’s', short: 'Kids', color: '#E0A526' },
  { id: 'memoir', label: 'Memoir & essay', short: 'Memoir', color: '#7C6A55' },
];

export const STORY_STAGES = [
  { id: 'spark', label: 'Spark', blurb: 'A premise, a character, a first line — shared to find co-writers.' },
  { id: 'outline', label: 'Outline', blurb: 'Beats, arcs and a plan, open for notes.' },
  { id: 'drafting', label: 'Drafting', blurb: 'Chapters being written, often out of order.' },
  { id: 'revising', label: 'Revising', blurb: 'Big structural passes, then the line edits.' },
  { id: 'beta', label: 'Beta readers', blurb: 'Readers leave notes on what lands and what drags.' },
  { id: 'released', label: 'Published', blurb: 'Finished, versioned, and free to be remixed (if the licence says so).' },
];

export const STORY_ROLES = [
  'Author',
  'Co-writer',
  'Editor',
  'Beta reader',
  'Sensitivity reader',
  'Worldbuilder',
  'Illustrator',
  'Cover artist',
  'Translator',
  'Narrator',
];

export const STORY_MATERIALS = {
  character: { label: 'Character sheet' },
  map: { label: 'Map' },
  outline: { label: 'Outline' },
  moodboard: { label: 'Moodboard' },
  research: { label: 'Research notes' },
  audio: { label: 'Audio' },
};

export const STORY_PARALLELS = [
  { code: 'Repository', research: 'Story', note: 'Manuscript, outline, characters and maps in one place.' },
  { code: 'Commit', research: 'Draft', note: 'Every draft kept. Go back to the version where it worked.' },
  { code: 'Issue', research: 'Plot thread', note: 'Plot holes, open questions and “what if…” ideas.' },
  { code: 'Pull request', research: 'Suggested edit', note: 'Co-writers propose; the author accepts, with credit.' },
  { code: 'Fork', research: 'Remix', note: 'Fan continuations and retellings, linked to the original.' },
  { code: 'Contributors', research: 'Credits', note: 'Editors, beta readers and illustrators named, like film credits.' },
];

export const STORY_TEMPLATES = [
  {
    id: 'short-story',
    name: 'Short story',
    kind: 'Short fiction',
    blurb: 'One character, one change. A shape that fits in an evening.',
    sections: ['Opening image', 'Want', 'Turn', 'Climax', 'Last line'],
    content: h([
      '<h1>Untitled story</h1>',
      '<blockquote>Logline: <em>When [character] wants [thing], [obstacle] forces them to [choice].</em></blockquote>',
      '<h2>Opening image</h2><p><em>Start as late as you can. What do we see first?</em></p>',
      '<h2>The want</h2><p><em>What does your character want badly enough to act?</em></p>',
      '<h2>The turn</h2><p><em>The moment it stops going to plan.</em></p>',
      '<h2>Climax</h2><p><em>The choice only this character would make.</em></p>',
      '<h2>Last line</h2><p><em>Echo the opening, changed.</em></p>',
    ]),
  },
  {
    id: 'novel-outline',
    name: 'Novel outline',
    kind: 'Three acts',
    blurb: 'Act one, the messy middle, act three — with beats you can move around.',
    sections: ['Premise', 'Act I', 'Midpoint', 'Act II', 'Act III'],
    content: h([
      '<h1>Untitled novel</h1>',
      '<h3>Premise</h3><p><em>Two sentences: who, what they want, what stands in the way, what is at stake.</em></p>',
      '<h2>Act I — Setup</h2><ul><li><em>Ordinary world</em></li><li><em>Inciting incident</em></li><li><em>No turning back</em></li></ul>',
      '<h2>Midpoint</h2><p><em>A reversal: what they thought they wanted changes.</em></p>',
      '<h2>Act II — Confrontation</h2><ul><li><em>Rising stakes</em></li><li><em>All is lost</em></li></ul>',
      '<h2>Act III — Resolution</h2><ul><li><em>Climax</em></li><li><em>New normal</em></li></ul>',
    ]),
  },
  {
    id: 'chapter',
    name: 'Chapter',
    kind: 'Scene by scene',
    blurb: 'Goal, conflict, outcome for each scene, so every page moves.',
    sections: ['Scene 1', 'Scene 2', 'Hook'],
    content: h([
      '<h1>Chapter one</h1>',
      '<h3>Scene 1</h3><p><em>Goal · conflict · outcome. Whose point of view?</em></p>',
      '<h3>Scene 2</h3><p></p>',
      '<h3>Hook</h3><p><em>Why would a reader turn the page?</em></p>',
    ]),
  },
  {
    id: 'character',
    name: 'Character sheet',
    kind: 'People',
    blurb: 'Want, need, wound, voice. Enough to hear them talk.',
    sections: ['Want', 'Need', 'Wound', 'Voice'],
    content: h([
      '<h1>Character name</h1>',
      '<h3>Want</h3><p><em>What they chase on the page.</em></p>',
      '<h3>Need</h3><p><em>What they actually lack.</em></p>',
      '<h3>Wound</h3><p><em>The old hurt that bends their choices.</em></p>',
      '<h3>Voice</h3><p><em>Three lines of dialogue only they would say.</em></p>',
    ]),
  },
  {
    id: 'world',
    name: 'World bible',
    kind: 'Worldbuilding',
    blurb: 'Places, rules, history and what magic costs. Shared with co-writers.',
    sections: ['Places', 'Rules', 'History', 'Factions'],
    content: h([
      '<h1>World bible</h1>',
      '<h2>Places</h2><p></p>',
      '<h2>Rules</h2><p><em>What is possible here, and what does it cost?</em></p>',
      '<h2>History</h2><p></p>',
      '<h2>Factions</h2><p></p>',
    ]),
  },
  {
    id: 'poems',
    name: 'Poem or collection',
    kind: 'Poetry',
    blurb: 'A blank page with room to breathe, and the Words tool next to it.',
    sections: [],
    content: '<h1>Untitled</h1><p></p>',
  },
];

export const WRITERS = [
  { handle: 'ines-carvalho', name: 'Inês Carvalho', role: 'Novelist', affiliation: 'Lisbon writing circle', fields: ['literary', 'historical'], open: true, bio: 'Slow novels about cities that remember more than their people do.' },
  { handle: 'kofi-asante', name: 'Kofi Asante', role: 'Fantasy writer', affiliation: 'Independent', fields: ['fantasy', 'ya'], open: true, bio: 'Maps first, plot later. Currently drowning in a world bible.' },
  { handle: 'yuna-park', name: 'Yuna Park', role: 'Poet & translator', affiliation: 'Seoul–Toronto', fields: ['poetry', 'literary'], open: true, bio: 'Translating Korean poetry, and writing the poems that fall out of the gaps.' },
  { handle: 'sam-okonkwo', name: 'Sam Okonkwo', role: 'Mystery writer', affiliation: 'Night-shift novelist', fields: ['mystery', 'horror'], open: false, bio: 'Locked rooms, unreliable narrators, very strong coffee.' },
  { handle: 'aria-lindqvist', name: 'Aria Lindqvist', role: 'Illustrator', affiliation: 'Picture-book studio', fields: ['kids', 'fantasy'], open: true, bio: 'I draw the bits the words leave out.' },
  { handle: 'dev-raman', name: 'Dev Raman', role: 'Sci-fi writer', affiliation: 'Day job: firmware', fields: ['scifi'], open: true, bio: 'Hard-ish science fiction about the people who maintain the future.' },
  { handle: 'mae-thornton', name: 'Mae Thornton', role: 'Editor', affiliation: 'Freelance', fields: ['romance', 'literary'], open: true, bio: 'Developmental edits, gentle but honest. Happy to beta read.' },
];

export const STORIES = [
  {
    slug: 'salt-and-lanterns',
    mode: 'stories',
    title: 'Salt and Lanterns',
    question: 'A lighthouse keeper’s daughter inherits a light that guides ships into the past.',
    disciplines: ['fantasy', 'historical'],
    stage: 'drafting',
    license: 'cc-by-nc-4.0',
    updated: '2026-11-18',
    version: 'Draft 4',
    lead: 'kofi-asante',
    keywords: ['time slip', 'lighthouses', 'grief', 'maritime'],
    abstract: [
      'When Nell’s mother dies, the lighthouse passes to her — and with it the duty nobody mentioned: some nights the beam reaches ships that sank a century ago, and they want to come home.',
      'Twelve chapters drafted out of order. The world bible and a map of the coast are shared below; we are looking for a historical editor who knows 1900s shipping.',
    ],
    contributors: [
      { handle: 'kofi-asante', roles: ['Author', 'Worldbuilder'] },
      { handle: 'aria-lindqvist', roles: ['Illustrator'] },
    ],
    seeking: ['Historical editor (maritime)'],
    materials: [
      { type: 'map', title: 'The coast of Carrow, hand-drawn', meta: 'PNG · v2' },
      { type: 'character', title: 'Nell, Tamsin and the drowned captain', meta: '3 sheets' },
      { type: 'outline', title: 'Three-act beat sheet', meta: 'Revised after notes' },
    ],
    questions: [
      { title: 'Does the light pull ships from one wreck or every wreck?', by: 'kofi-asante', replies: 9, status: 'open' },
      { title: 'Chapter 7 drags — cut the storm or move it earlier?', by: 'aria-lindqvist', replies: 4, status: 'open' },
    ],
    versions: [
      { v: 'Draft 4', date: '2026-11-18', note: 'Rewrote the opening from Nell’s point of view' },
      { v: 'Draft 3', date: '2026-10-02', note: 'Merged two minor characters' },
      { v: 'Draft 1', date: '2026-06-11', note: 'First full pass' },
    ],
    reviews: [],
    followers: 412,
    builtOn: 2,
  },
  {
    slug: 'the-maintenance-crew',
    mode: 'stories',
    title: 'The Maintenance Crew',
    question: 'Three technicians keep a generation ship running long after everyone forgot why it launched.',
    disciplines: ['scifi', 'literary'],
    stage: 'beta',
    license: 'cc-by-4.0',
    updated: '2026-11-15',
    version: 'Draft 6',
    lead: 'dev-raman',
    keywords: ['generation ship', 'work', 'found family'],
    abstract: [
      'Not the captains, not the heroes — the crew who fix the air scrubbers. A novella about labour, routine and what keeps people going when the destination stops mattering.',
    ],
    contributors: [
      { handle: 'dev-raman', roles: ['Author'] },
      { handle: 'mae-thornton', roles: ['Editor', 'Beta reader'] },
    ],
    seeking: ['Beta readers (sci-fi)'],
    materials: [
      { type: 'research', title: 'Closed-loop life support notes', meta: 'Sources linked' },
      { type: 'outline', title: 'Chapter map', meta: '14 chapters' },
    ],
    questions: [{ title: 'Is the ending earned or just sad?', by: 'mae-thornton', replies: 15, status: 'open' }],
    versions: [
      { v: 'Draft 6', date: '2026-11-15', note: 'Cut 6,000 words from the middle' },
      { v: 'Draft 4', date: '2026-08-30', note: 'Second POV character added' },
    ],
    reviews: [
      { by: 'Beta reader (signed)', verdict: 'Loved it', summary: 'The scrubber scene made me cry, which I did not expect to type. Chapter 3 is slow.' },
      { by: 'Beta reader', verdict: 'Mostly there', summary: 'Wanted one more scene with the old engineer before the end.' },
    ],
    followers: 688,
    builtOn: 4,
  },
  {
    slug: 'letters-from-the-flood',
    mode: 'stories',
    title: 'Letters from the Flood Year',
    question: 'A poetry sequence written as letters between two sisters on either side of a rising river.',
    disciplines: ['poetry', 'memoir'],
    stage: 'revising',
    license: 'cc-by-nc-4.0',
    updated: '2026-11-10',
    version: 'Draft 3',
    lead: 'yuna-park',
    keywords: ['epistolary', 'climate', 'sisters', 'translation'],
    abstract: [
      'Thirty-one poems in two voices and two languages. Every poem is published here with its Korean original, and readers suggest edits to the English line by line.',
    ],
    contributors: [{ handle: 'yuna-park', roles: ['Author', 'Translator'] }],
    seeking: ['Sensitivity reader (displacement)'],
    materials: [{ type: 'audio', title: 'Readings of poems 1–8', meta: 'MP3 · 14 min' }],
    questions: [{ title: '“Silt” or “sediment” in poem 12?', by: 'yuna-park', replies: 22, status: 'resolved' }],
    versions: [{ v: 'Draft 3', date: '2026-11-10', note: 'Reordered the sequence by season' }],
    reviews: [],
    followers: 254,
    builtOn: 1,
  },
  {
    slug: 'the-quiet-floor',
    mode: 'stories',
    title: 'The Quiet Floor',
    question: 'A night-shift librarian finds a reading room that isn’t on any floor plan — and a body inside it.',
    disciplines: ['mystery', 'horror'],
    stage: 'outline',
    license: 'all-rights',
    updated: '2026-11-19',
    version: 'Outline 2',
    lead: 'sam-okonkwo',
    keywords: ['locked room', 'libraries', 'unreliable narrator'],
    abstract: ['A locked-room mystery where the room is the suspect. Outline only — looking for a co-writer who loves clue-planting.'],
    contributors: [{ handle: 'sam-okonkwo', roles: ['Author'] }],
    seeking: ['Co-writer (mystery plotting)'],
    materials: [{ type: 'outline', title: 'Clue map', meta: 'Every clue, where it is planted, where it pays off' }],
    questions: [{ title: 'Should the reader suspect the narrator by chapter 5?', by: 'sam-okonkwo', replies: 6, status: 'open' }],
    versions: [{ v: 'Outline 2', date: '2026-11-19', note: 'Moved the reveal to the end of act two' }],
    reviews: [],
    followers: 133,
    builtOn: 0,
  },
  {
    slug: 'small-dragon-big-city',
    mode: 'stories',
    title: 'Small Dragon, Big City',
    question: 'A picture book about a dragon the size of a teacup who wants to be taken seriously.',
    disciplines: ['kids', 'fantasy'],
    stage: 'released',
    license: 'cc-by-4.0',
    updated: '2026-09-02',
    version: 'Edition 1',
    lead: 'aria-lindqvist',
    keywords: ['picture book', 'read-aloud', 'confidence'],
    abstract: ['Thirty-two pages, twelve illustrations, one very small dragon. Free to read aloud, translate and remix with credit.'],
    contributors: [
      { handle: 'aria-lindqvist', roles: ['Author', 'Illustrator'] },
      { handle: 'mae-thornton', roles: ['Editor'] },
    ],
    seeking: [],
    materials: [{ type: 'moodboard', title: 'Colour palette and sketches', meta: '18 images' }],
    questions: [],
    versions: [{ v: 'Edition 1', date: '2026-09-02', note: 'Published' }],
    reviews: [{ by: 'Teacher (signed)', verdict: 'Read it to 30 kids', summary: 'They made me read the sneeze page four times.' }],
    followers: 902,
    builtOn: 6,
  },
  {
    slug: 'the-tram-at-dawn',
    mode: 'stories',
    title: 'The Tram at Dawn',
    question: 'Two strangers keep missing each other on the first tram of the day, for forty years.',
    disciplines: ['romance', 'literary'],
    stage: 'spark',
    license: 'cc-by-4.0',
    updated: '2026-11-20',
    version: 'Spark',
    lead: 'ines-carvalho',
    keywords: ['near-misses', 'Lisbon', 'time'],
    abstract: ['Just a premise and a first page. Looking for someone to write the other stranger’s chapters.'],
    contributors: [{ handle: 'ines-carvalho', roles: ['Author'] }],
    seeking: ['Co-writer (alternate chapters)'],
    materials: [],
    questions: [{ title: 'Do they ever meet? Vote below.', by: 'ines-carvalho', replies: 48, status: 'open' }],
    versions: [{ v: 'Spark', date: '2026-11-20', note: 'Premise posted' }],
    reviews: [],
    followers: 77,
    builtOn: 0,
  },
];

const CALL_DETAILS = {
  'Historical editor (maritime)': { skills: ['1900s shipping', 'Line editing'], commitment: 'One pass, ~3 weeks', toward: 'historical' },
  'Beta readers (sci-fi)': { skills: ['Honest notes', 'Novellas'], commitment: 'Read 30k words', toward: 'scifi' },
  'Sensitivity reader (displacement)': { skills: ['Lived experience', 'Poetry'], commitment: 'Paid, flexible', toward: 'memoir' },
  'Co-writer (mystery plotting)': { skills: ['Clue planting', 'Outlining'], commitment: 'Co-author', toward: 'mystery' },
  'Co-writer (alternate chapters)': { skills: ['Literary voice', 'Romance'], commitment: 'Co-author', toward: 'romance' },
};

export const STORY_CALLS = STORIES.flatMap((p) =>
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

export const STORY_GUIDES = [
  {
    slug: 'three-acts',
    title: 'Three acts, without the formula',
    minutes: 5,
    level: 'Start here',
    summary: 'Setup, confrontation, resolution — as a tool for finding your story, not a cage.',
    body: `
<p>Most stories that work have a shape: something disturbs a character’s world, they struggle with it, and they come out changed. The three-act structure just names those parts.</p>
<h2>Find the turns, not the page counts</h2>
<ul>
<li><strong>Inciting incident</strong> — the moment the old life ends.</li>
<li><strong>Midpoint</strong> — the character learns what they wanted was the wrong thing.</li>
<li><strong>Crisis</strong> — the choice that costs something real.</li>
</ul>
<blockquote>If you can name those three moments in a sentence each, you have a story. Everything else is how you tell it.</blockquote>
<h3>On this platform</h3>
<p>Start from the <em>Novel outline</em> template, share it at the <em>Outline</em> stage, and let co-writers drag beats around before anyone drafts a chapter.</p>`,
  },
  {
    slug: 'scenes-that-move',
    title: 'Writing a scene that moves',
    minutes: 4,
    level: 'Craft',
    summary: 'Goal, conflict, outcome. Three questions that fix most saggy chapters.',
    body: `
<p>A scene is a small story: someone wants something, something stops them, and the situation is different at the end.</p>
<ol>
<li><strong>Goal</strong> — what does the point-of-view character want in this scene?</li>
<li><strong>Conflict</strong> — what gets in the way?</li>
<li><strong>Outcome</strong> — usually “no”, or “yes, but…”.</li>
</ol>
<p>If nothing has changed by the end of a scene, cut it or merge it.</p>`,
  },
  {
    slug: 'beta-reading',
    title: 'How to be a useful beta reader',
    minutes: 4,
    level: 'Community',
    summary: 'Report your experience, not your rewrite. Writers need to know where you got bored.',
    body: `
<p>Beta readers aren’t editors. Your job is to be a reader and say what happened to you.</p>
<ul>
<li>Mark where you stopped wanting to read, and where you couldn’t stop.</li>
<li>Note who you were confused about, and when.</li>
<li>Say what you thought would happen. Writers learn a lot from wrong guesses.</li>
<li>Be kind and specific. “Chapter 3 lost me at the dinner” beats “pacing is off”.</li>
</ul>`,
  },
  {
    slug: 'co-writing',
    title: 'Co-writing without falling out',
    minutes: 5,
    level: 'Collaboration',
    summary: 'Agree on voice, credit and who has the final say — before chapter one.',
    body: `
<p>Most co-writing breaks down over three things nobody discussed: whose voice it is, who gets credit, and who decides.</p>
<ul>
<li><strong>Write a style sheet</strong>: tense, point of view, spelling, and three sample paragraphs you both love.</li>
<li><strong>Agree credits early</strong> and record them on the story.</li>
<li><strong>Pick a tie-breaker</strong> for each part of the book.</li>
<li><strong>Use suggested edits</strong> instead of rewriting each other directly.</li>
</ul>`,
  },
];
