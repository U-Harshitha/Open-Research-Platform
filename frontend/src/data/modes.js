import { CREDIT_ROLES, DISCIPLINES, LICENSES, MATERIAL_TYPES, PARALLELS, STAGES, TEMPLATES } from './catalog.js';
import { CALLS, PROJECTS, RESEARCHERS } from './samples.js';
import { GUIDES } from './guides.js';
import {
  GENRES, STORIES, STORY_CALLS, STORY_GUIDES, STORY_MATERIALS, STORY_PARALLELS, STORY_ROLES, STORY_STAGES, STORY_TEMPLATES, WRITERS,
} from './stories.js';

// One engine, two vocabularies. Pages read everything mode-specific from here.
// xray:modes
export const MODES = {
  research: {
    id: 'research',
    label: 'Research',
    brand: 'Research Nexus',
    motto: 'Open · Versioned · Shared',
    noun: 'project',
    nouns: 'projects',
    fieldLabel: 'Field',
    fieldsLabel: 'Fields',
    fields: DISCIPLINES,
    stages: STAGES,
    roles: CREDIT_ROLES,
    rolesLabel: 'CRediT roles',
    templates: TEMPLATES,
    projects: PROJECTS,
    people: RESEARCHERS,
    peopleLabel: 'researchers',
    calls: CALLS,
    guides: GUIDES,
    parallels: PARALLELS,
    materials: MATERIAL_TYPES,
    labels: {
      questions: 'Open questions',
      question: 'question',
      materials: 'Data & materials',
      reviews: 'Reviews',
      review: 'review',
      versions: 'Versions',
      buildOn: 'Build on',
      builtOn: 'Built on by',
      followers: 'Follow',
      contributors: 'Contributors · CRediT roles',
      abstract: 'Abstract',
      library: 'Library',
    },
    copy: {
      exploreTitle: 'Research in the open',
      exploreIntro: 'Projects at every stage, from first questions to published, versioned work. Follow them, ask a question, or build on them.',
      searchPlaceholder: 'Search questions, methods, keywords…',
      collaborateTitle: 'Open calls for expertise',
      collaborateIntro: 'Projects say what they’re missing. If you have it — a method, a dataset, a language, a lab — say hello.',
      guidesTitle: 'Learn to write research',
      guidesIntro: 'Short, practical guides for students, independent researchers and anyone writing their first paper.',
      newTitle: 'Start with a question.',
      newIntro: 'You don’t need data, funding or a finished draft. Pick a structure, say what you’re asking, and decide who can see it.',
      titleExample: 'e.g. Heat exposure and asthma in children',
      questionLabel: 'In one sentence, what are you asking?',
      questionPlaceholder: 'Shown on Explore. Write it so someone from another field understands.',
      seekingExample: 'e.g. Biostatistician, Field partner in Kenya',
      fieldsHint: 'up to 3 — mixing is encouraged',
      editorPlaceholder: 'Start with the question you’re trying to answer…',
    },
    assistant: { draftStyle: 'academic', reviewType: 'comprehensive', fourth: 'plagiarism' },
  },
  // …the stories entry has the same shape, with a writer's vocabulary:
  // fields → genres, stages → spark…published, roles → credits, reviews → beta notes.
  // xray:end
  stories: {
    id: 'stories',
    label: 'Stories',
    brand: 'Story Nexus',
    motto: 'Draft · Share · Remix',
    noun: 'story',
    nouns: 'stories',
    fieldLabel: 'Genre',
    fieldsLabel: 'Genres',
    fields: GENRES,
    stages: STORY_STAGES,
    roles: STORY_ROLES,
    rolesLabel: 'Credits',
    templates: STORY_TEMPLATES,
    projects: STORIES,
    people: WRITERS,
    peopleLabel: 'writers',
    calls: STORY_CALLS,
    guides: STORY_GUIDES,
    parallels: STORY_PARALLELS,
    materials: STORY_MATERIALS,
    labels: {
      questions: 'Plot threads',
      question: 'thread',
      materials: 'Notes & world',
      reviews: 'Beta notes',
      review: 'beta note',
      versions: 'Drafts',
      buildOn: 'Remix',
      builtOn: 'Remixed by',
      followers: 'Follow',
      contributors: 'Credits',
      abstract: 'Blurb',
      library: 'Library',
    },
    copy: {
      exploreTitle: 'Stories in progress',
      exploreIntro: 'Sparks, outlines, drafts and finished books. Read along, leave a beta note, or remix one that’s free to remix.',
      searchPlaceholder: 'Search premises, genres, moods…',
      collaborateTitle: 'Looking for co-writers',
      collaborateIntro: 'Writers say who they need: a co-writer, an illustrator, an editor, a few honest beta readers.',
      guidesTitle: 'Craft notes',
      guidesIntro: 'Short, friendly guides on structure, scenes, feedback and writing with other people.',
      newTitle: 'Start with a spark.',
      newIntro: 'A first line, a character, a “what if”. Pick a shape, write the premise, and decide who gets to read it.',
      titleExample: 'e.g. The Tram at Dawn',
      questionLabel: 'Your premise in one sentence',
      questionPlaceholder: 'Who wants what, and what is in the way?',
      seekingExample: 'e.g. Illustrator, Beta readers',
      fieldsHint: 'up to 3 — genre-blending welcome',
      editorPlaceholder: 'Once upon a time, or wherever you like…',
    },
    assistant: { draftStyle: 'fiction', reviewType: 'beta', fourth: 'words' },
  },
};

export const MODE_IDS = Object.keys(MODES);

// Shared lookups across both modes (ids are unique).
export const FIELD_BY_ID = Object.fromEntries([...DISCIPLINES, ...GENRES].map((f) => [f.id, f]));
export const PEOPLE_BY_HANDLE = Object.fromEntries([...RESEARCHERS, ...WRITERS].map((p) => [p.handle, p]));
export const PROJECT_BY_SLUG = Object.fromEntries([...PROJECTS, ...STORIES].map((p) => [p.slug, p]));
export const MATERIALS_ALL = { ...MATERIAL_TYPES, ...STORY_MATERIALS };
export { LICENSES };

export function stageInfo(id) {
  for (const [mode, list] of [['research', STAGES], ['stories', STORY_STAGES]]) {
    const index = list.findIndex((s) => s.id === id);
    if (index !== -1) return { ...list[index], index, list, mode };
  }
  return { id, label: id, index: 0, list: STAGES, mode: 'research' };
}

export const modeOfProject = (p) => p?.mode || (STORY_STAGES.some((s) => s.id === p?.stage) ? 'stories' : 'research');
