import { z } from 'zod';

/**
 * The site's content specification.
 *
 * Every piece of copy on this site is data validated against these schemas at
 * module load, which means an invalid content file fails `next build` rather
 * than shipping a broken page. It is the same idea as `composer validate` in
 * the DOS pipeline, applied to a website: the spec is the source of truth, and
 * the build is the gate.
 */

const nonEmpty = z.string().trim().min(1, 'must not be empty');

/** A metric we can publish. Client names are withheld; numbers are not. */
export const metricSchema = z.object({
  value: nonEmpty,
  caption: nonEmpty,
});

export const projectSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  domain: nonEmpty,
  title: nonEmpty,
  metric: metricSchema,
  summary: nonEmpty,
  /** Longer narrative shown on /work. */
  context: nonEmpty,
  shipped: z.array(nonEmpty).min(3, 'list at least three shipped items'),
  stack: z.array(nonEmpty).min(1),
  /** Optional pull-quote describing the outcome. */
  outcome: nonEmpty.optional(),
  /** Our own products may be named; client work may not. */
  named: z.boolean().default(false),
  externalUrl: z.string().url().optional(),
});

export const gateSchema = z.object({
  gate: nonEmpty,
  /** Rendered in the keyword colour when it is a command rather than a name. */
  isCommand: z.boolean().default(false),
  catches: nonEmpty,
});

export const promiseSchema = z.object({
  /** Each promise is phrased as a refusal — harder to fake than a claim. */
  refusal: z.string().regex(/^No\b/, 'every promise is phrased as a refusal'),
  detail: nonEmpty,
});

export const stepSchema = z.object({
  title: nonEmpty,
  detail: nonEmpty,
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
  /** Roles are upper-case identifiers, e.g. USER2, ADMIN. */
  role: z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'role must be an upper-case identifier'),
  /** Operations are PascalCase, e.g. IndexActivities. */
  operation: z
    .string()
    .regex(/^[A-Z][A-Za-z0-9]*$/, 'operation must be PascalCase'),
  mutation: z.record(z.string(), z.string()).optional(),
  assertions: z.array(assertionSchema).min(1, 'a scenario must assert something'),
  /** One line explaining what this scenario proves, shown beside the demo. */
  proves: nonEmpty,
});

export const literalSchema = z.object({
  value: nonEmpty,
  caption: nonEmpty,
});

export type Metric = z.infer<typeof metricSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Gate = z.infer<typeof gateSchema>;
export type Promise_ = z.infer<typeof promiseSchema>;
export type Step = z.infer<typeof stepSchema>;
export type Assertion = z.infer<typeof assertionSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type Literal = z.infer<typeof literalSchema>;

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
