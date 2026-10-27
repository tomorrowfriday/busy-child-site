import { z } from 'zod';

/**
 * The site's content specification.
 *
 * Every string on this site is data validated against these schemas at module
 * load, which means invalid or incomplete content fails `next build` rather
 * than shipping a broken page. It is `composer validate` applied to a website.
 *
 * Both locales are parsed against the same `contentSchema`, so a translation
 * that is missing a section — or has grown one the other language lacks —
 * cannot ship. See `tests/locales.test.ts`.
 */

const nonEmpty = z.string().trim().min(1, 'must not be empty');

export const LOCALES = ['en', 'ua'] as const;
export const localeSchema = z.enum(LOCALES);
export type Locale = (typeof LOCALES)[number];

/** A bullet with an optional lead-in rendered bold. Keeps markup out of copy. */
export const bulletSchema = z.object({
  strong: nonEmpty.optional(),
  text: nonEmpty,
});

export const metricSchema = z.object({
  value: nonEmpty,
  caption: nonEmpty,
});

export const literalSchema = metricSchema;

/** A single labelled figure in a project's detail sheet. */
export const factSchema = z.object({
  k: nonEmpty,
  v: nonEmpty,
});

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  domain: nonEmpty,
  title: nonEmpty,
  /** Short sector chip on the home rail card, e.g. "Fund administration". */
  sector: nonEmpty,
  /** Card-sized title — `title` is the long form used on /work. */
  short: nonEmpty,
  /** One sentence a non-engineer can read off the card. */
  oneLiner: nonEmpty,
  metric: metricSchema,
  /** The figure set huge on the deck's case screen, e.g. "$4M+" or "Plug-in". */
  metricBig: nonEmpty,
  /** The line under it — `metric.caption` is the long form used on /work. */
  metricShort: nonEmpty,
  facts: z.array(factSchema).min(2, 'list at least two facts'),
  summary: nonEmpty,
  context: nonEmpty,
  shipped: z.array(nonEmpty).min(3, 'list at least three shipped items'),
  stack: z.array(nonEmpty).min(1),
  outcome: nonEmpty.optional(),
  named: z.boolean().default(false),
  externalUrl: z.string().url().optional(),
  externalLabel: nonEmpty.optional(),
});

export const gateSchema = z.object({
  gate: nonEmpty,
  isCommand: z.boolean().default(false),
  catches: nonEmpty,
});

export const promiseSchema = z.object({
  refusal: nonEmpty,
  detail: nonEmpty,
});

export const stepSchema = z.object({
  title: nonEmpty,
  detail: nonEmpty,
});

/* ── what a client actually gets, in an owner's language ────────────────── */

export const outcomeSchema = z.object({
  title: nonEmpty,
  detail: nonEmpty,
  /** Optional real figure from shipped work, e.g. "$1M / yr". */
  proof: nonEmpty.optional(),
  proofCaption: nonEmpty.optional(),
});

/* ── the specification language the compiler consumes ───────────────────── */

export const assertionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('excludesItem'), field: nonEmpty, equals: nonEmpty }),
  z.object({ kind: z.literal('includesItem'), field: nonEmpty, equals: nonEmpty }),
  z.object({ kind: z.literal('fieldEquals'), path: nonEmpty, value: nonEmpty }),
  z.object({ kind: z.literal('rejectedWith'), error: nonEmpty }),
]);

export const scenarioSchema = z.object({
  index: z.number().int().positive(),
  title: nonEmpty,
  /** Two or three words for the method sheet's chips — `title` is the sentence. */
  label: nonEmpty,
  role: z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'role must be an upper-case identifier'),
  operation: z.string().regex(/^[A-Z][A-Za-z0-9]*$/, 'operation must be PascalCase'),
  mutation: z.record(z.string(), z.string()).optional(),
  assertions: z.array(assertionSchema).min(1, 'a scenario must assert something'),
  proves: nonEmpty,
});

/* ── page copy ──────────────────────────────────────────────────────────── */

const sectionSchema = z.object({
  marker: nonEmpty,
  title: nonEmpty,
  lead: nonEmpty.optional(),
  body: z.array(nonEmpty).optional(),
  caption: nonEmpty.optional(),
  bullets: z.array(bulletSchema).optional(),
  note: z.object({ tag: nonEmpty, text: nonEmpty }).optional(),
  link: nonEmpty.optional(),
});

export const contentSchema = z.object({
  locale: localeSchema,
  /** Shown in the language switcher, in its own language. */
  localeLabel: nonEmpty,
  localeName: nonEmpty,

  site: z.object({
    tagline: nonEmpty,
    statement: nonEmpty,
    description: nonEmpty,
    sectors: z.array(nonEmpty).min(3),
  }),

  nav: z.array(z.object({ href: nonEmpty, label: nonEmpty })).length(4),

  common: z.object({
    sendBrief: nonEmpty,
    seeWork: nonEmpty,
    upwork: nonEmpty,
    upworkAlt: nonEmpty,
    skipToContent: nonEmpty,
    switchLanguage: nonEmpty,
    more: nonEmpty,
    /** Tells the reader the page folds, once, instead of a tooltip per row. */
    foldHint: nonEmpty,
    /** Marks a fold whose body is a running demo rather than prose. */
    liveBadge: nonEmpty,
  }),

  literals: z.array(literalSchema).length(4),
  gates: z.array(gateSchema).length(8),
  promises: z.array(promiseSchema).length(6),
  engagement: z.array(stepSchema).length(4),
  scenarios: z.array(scenarioSchema).min(3),
  projects: z.array(projectSchema).min(4),

  home: z.object({
    outcomes: sectionSchema.extend({ items: z.array(outcomeSchema).min(5) }),
    specimen: sectionSchema,
    work: sectionSchema,
    gates: sectionSchema,
    promises: sectionSchema,
    contact: sectionSchema,

    /* ── the home page proper ──────────────────────────────────────────────
       Its own copy, deliberately terser than the sections above: those are
       shared with /what-you-get, /work and /method, which have room to argue.
       The home page has one screen to be understood in.                     */

    /** In-page anchors in the masthead. Four, against `nav`'s five routes. */
    anchors: z.array(z.object({ href: nonEmpty, label: nonEmpty })).length(4),
    /** The hero line. Shorter than `site.statement`, which still feeds metadata. */
    headline: nonEmpty,

    results: z.object({
      title: nonEmpty,
      lead: nonEmpty,
      items: z.array(z.object({ title: nonEmpty, detail: nonEmpty })).length(6),
    }),

    proof: z.object({
      title: nonEmpty,
      lead: nonEmpty,
      /** Four tabs. `label` captions the panel each one opens. */
      steps: z
        .array(z.object({ title: nonEmpty, detail: nonEmpty, label: nonEmpty }))
        .length(4),
      gatesNote: nonEmpty,
      ship: z.array(z.object({ value: nonEmpty, detail: nonEmpty })).length(2),
    }),

    working: z.object({
      title: nonEmpty,
      items: z.array(nonEmpty).length(6),
    }),

    closing: z.object({ title: nonEmpty, lead: nonEmpty }),

    /**
     * The deck. Ten screens, advanced by wheel, swipe, keys or the menu.
     * `hint` is the metadata under a menu entry, and may be empty.
     */
    deck: z.object({
      screens: z.array(z.object({ label: nonEmpty, hint: z.string() })).length(10),
      caseLabel: nonEmpty,
      next: nonEmpty,
      prev: nonEmpty,
      menuLabel: nonEmpty,
      /** The two buttons that open a sheet. */
      openCase: nonEmpty,
      seeExample: nonEmpty,
      /** The method sheet: one scenario, shown as written and as compiled. */
      methodKicker: nonEmpty,
      methodTitle: nonEmpty,
      methodLead: nonEmpty,
      specLabel: nonEmpty,
      testLabel: nonEmpty,
      gatesKicker: nonEmpty,
      stepFourKicker: nonEmpty,
    }),

    /** The project detail sheet that slides in from the rail. */
    sheet: z.object({
      of: nonEmpty,
      prev: nonEmpty,
      next: nonEmpty,
      close: nonEmpty,
      shipped: nonEmpty,
      builtWith: nonEmpty,
      outcome: nonEmpty,
      proves: nonEmpty,
      cta: nonEmpty,
    }),
  }),

  workPage: z.object({
    metaTitle: nonEmpty,
    metaDescription: nonEmpty,
    hero: sectionSchema,
    shippedHeading: nonEmpty,
    outcomeTag: nonEmpty,
    next: sectionSchema,
  }),


  workingPage: z.object({
    metaTitle: nonEmpty,
    metaDescription: nonEmpty,
    hero: sectionSchema,
    engagement: sectionSchema,
    bar: sectionSchema,
    team: sectionSchema,
  }),

  /**
   * One screen. A visitor arrives here having already read the pitch, so the
   * page's whole job is to make writing the first email easy — not to argue
   * again.
   */
  contactPage: z.object({
    metaTitle: nonEmpty,
    metaDescription: nonEmpty,
    hero: sectionSchema,
    includeLabel: nonEmpty,
    include: z.array(nonEmpty).length(3),
    back: nonEmpty,
    mailSubject: nonEmpty,
  }),
});

export type Content = z.infer<typeof contentSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Gate = z.infer<typeof gateSchema>;
export type Promise_ = z.infer<typeof promiseSchema>;
export type Step = z.infer<typeof stepSchema>;
export type Assertion = z.infer<typeof assertionSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type Literal = z.infer<typeof literalSchema>;
export type Outcome = z.infer<typeof outcomeSchema>;
export type Fact = z.infer<typeof factSchema>;
export type Bullet = z.infer<typeof bulletSchema>;
export type Section = z.infer<typeof sectionSchema>;

/**
 * Validate a content collection, failing the build with a readable message
 * that names the file and the offending entry.
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown,
  source: string,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `  · ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid content in ${source}:\n${detail}`);
  }
  return result.data;
}
