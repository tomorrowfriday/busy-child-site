import { z } from 'zod';
import {
  gateSchema,
  literalSchema,
  promiseSchema,
  scenarioSchema,
  stepSchema,
  validate,
  type Gate,
  type Literal,
  type Promise_,
  type Scenario,
  type Step,
} from './schema';

export const site = {
  name: 'Busy Child',
  wordmark: 'busychild',
  tagline: 'Production web & mobile platforms',
  statement:
    'We build the platforms your business runs on — and ship them ourselves.',
  description:
    'A senior engineering team that designs, builds, and maintains production web and mobile software for enterprises. Spec-driven, serverless-first, 100% test coverage. The partner who scopes your project is the one who ships it.',
  sectors: ['Fund administration', 'Healthcare', 'Insurance', 'Consumer mobile'],
  upwork: 'https://www.upwork.com/agencies/2029955071357100515/',
  // TODO: replace with the real inbox before launch.
  email: 'hello@busychild.com',
  // TODO: set once the domain is registered — used for canonical + OG URLs.
  url: 'https://busychild.com',
} as const;

export const nav = [
  { href: '/work', label: '/work' },
  { href: '/method', label: '/method' },
  { href: '/working-with-us', label: '/working-with-us' },
  { href: '/contact', label: '/contact' },
] as const;

export const literals: Literal[] = validate(
  z.array(literalSchema).length(4),
  [
    { value: '15+', caption: 'years shipping production systems' },
    { value: '$4M+', caption: 'monthly transaction volume on one platform' },
    { value: '100%', caption: 'test coverage, enforced as a build failure' },
    { value: 'Senior', caption: 'only — no juniors learning on you' },
  ],
  'content/site.ts → literals',
);

export const gates: Gate[] = validate(
  z.array(gateSchema).min(8),
  [
    { gate: 'composer validate', isCommand: true, catches: 'Broken spec — before any code exists' },
    { gate: 'Spec coverage', isCommand: false, catches: 'An operation no scenario exercises end to end' },
    { gate: 'tsc', isCommand: true, catches: 'Drift between operation I/O and document shape' },
    { gate: 'ESLint', isCommand: false, catches: 'Style, documentation, complexity' },
    { gate: 'Generated unit tests', isCommand: false, catches: 'Per-operation security, schema shape, before logic' },
    { gate: 'Generated scenario tests', isCommand: false, catches: 'End-to-end behaviour against a real database, multi-role, multi-tenant' },
    { gate: 'Coverage threshold', isCommand: false, catches: 'Any untested line, branch, or function — set at 100%' },
    { gate: 'Runtime output validation', isCommand: false, catches: "A response that doesn't match its declared schema — in production" },
  ],
  'content/site.ts → gates',
);

export const promises: Promise_[] = validate(
  z.array(promiseSchema).length(6),
  [
    {
      refusal: 'No pitch-and-switch.',
      detail:
        'The senior partner who scopes your project is on it until it ships. You will not meet one team in the sales conversation and a different one on Monday.',
    },
    {
      refusal: 'No account managers.',
      detail:
        'You talk directly to the people building your software. Nothing gets relayed, summarised, or lost between you and the person writing the code.',
    },
    {
      refusal: 'No juniors learning on you.',
      detail:
        "We stay small on purpose. Senior people, or we don't take the work. Your project is not anybody's training exercise.",
    },
    {
      refusal: 'No surprise invoices.',
      detail:
        "We'd rather lose a margin than lose your trust. If something is going to cost more, you hear it before it's spent, not after.",
    },
    {
      refusal: 'No theater.',
      detail:
        'Short meetings, written decisions, working software. No status decks, no ceremony that exists to look like progress.',
    },
    {
      refusal: 'No vibecoding.',
      detail:
        'AI is a tool to ship faster — never a shortcut past review. Everything is verified by the same gates whether a person or a model wrote it.',
    },
  ],
  'content/site.ts → promises',
);

export const engagement: Step[] = validate(
  z.array(stepSchema).length(4),
  [
    {
      title: 'We write the spec with your team',
      detail:
        'One or two working sessions. Your domain expert talks, we write it down precisely, and the result is a document both sides can read.',
    },
    {
      title: 'You review the spec',
      detail:
        "This is the decision point, and it's a document rather than a pull request. Being wrong here costs an edit, not a rewrite.",
    },
    {
      title: 'We generate, implement and ship it',
      detail: 'Behind your existing gates, on your infrastructure, in your process.',
    },
    {
      title: 'Your engineers own it afterwards',
      detail:
        'The spec is the handover artefact. New people ramp on a readable document instead of reverse-engineering intent from handlers.',
    },
  ],
  'content/site.ts → engagement',
);

/**
 * The scenarios the homepage compiler demo runs on. These are real DOS spec
 * scenarios: each one compiles to the test shown beside it, in the browser.
 */
export const scenarios: Scenario[] = validate(
  z.array(scenarioSchema).min(3),
  [
    {
      index: 4,
      title: 'Platform activity is not returned to another organization user',
      role: 'USER2',
      operation: 'IndexActivities',
      assertions: [{ kind: 'excludesItem', field: 'id', equals: 'activityId' }],
      proves: 'Tenant isolation — one organisation cannot read another’s records.',
    },
    {
      index: 7,
      title: 'A supervisor cannot approve a claim outside their location',
      role: 'SUPERVISOR',
      operation: 'ApproveClaim',
      mutation: { claimId: 'otherLocationClaimId' },
      assertions: [{ kind: 'rejectedWith', error: 'ForbiddenError' }],
      proves: 'Permission scope — role checks are enforced per location, not per account.',
    },
    {
      index: 12,
      title: 'An investor sees their own commitment after funding',
      role: 'INVESTOR',
      operation: 'IndexCommitments',
      assertions: [
        { kind: 'includesItem', field: 'id', equals: 'commitmentId' },
        { kind: 'fieldEquals', path: '0.status', value: 'funded' },
      ],
      proves: 'Positive path — the record exists, and its state is what the spec promised.',
    },
  ],
  'content/site.ts → scenarios',
);
