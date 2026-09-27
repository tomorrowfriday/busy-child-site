import { scenarioSchema, type Assertion, type Scenario } from '@/content/schema';

/**
 * Immutable edits to a spec scenario, plus the validity check the editor shows.
 *
 * The homepage lets a visitor change the spec and watch the test regenerate.
 * That only demonstrates anything if breaking the spec actually breaks
 * something — so `checkScenario` runs the same schema the build runs, and the
 * editor surfaces the failure the way `composer validate` would.
 */

export function setRole(scenario: Scenario, role: string): Scenario {
  return { ...scenario, role };
}

export function setOperation(scenario: Scenario, operation: string): Scenario {
  return { ...scenario, operation };
}

export function setAssertion(
  scenario: Scenario,
  index: number,
  assertion: Assertion,
): Scenario {
  return {
    ...scenario,
    assertions: scenario.assertions.map((existing, i) => (i === index ? assertion : existing)),
  };
}

export function removeAssertion(scenario: Scenario, index: number): Scenario {
  return {
    ...scenario,
    assertions: scenario.assertions.filter((_, i) => i !== index),
  };
}

export interface CheckResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export function checkScenario(scenario: Scenario): CheckResult {
  const result = scenarioSchema.safeParse(scenario);
  if (result.success) return { ok: true, errors: [] };

  return {
    ok: false,
    errors: result.error.issues.map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    }),
  };
}

/**
 * Change the kind of an assertion while keeping whatever values still apply, so
 * switching between kinds in the editor does not silently discard the field the
 * visitor just typed.
 */
export function changeAssertionKind(
  assertion: Assertion,
  kind: Assertion['kind'],
): Assertion {
  if (assertion.kind === kind) return assertion;

  // The two item kinds share field/equals, so switching between them keeps
  // whatever the visitor typed.
  const field = 'field' in assertion ? assertion.field : 'id';
  const equals = 'equals' in assertion ? assertion.equals : 'recordId';

  switch (kind) {
    case 'excludesItem':
      return { kind, field, equals };
    case 'includesItem':
      return { kind, field, equals };
    // The early return above guarantees the incoming assertion is not already
    // of the kind being switched to, so a fieldEquals/rejectedWith target has
    // nothing of its own to carry over — these start from defaults.
    case 'fieldEquals':
      return { kind, path: '0.status', value: 'funded' };
    case 'rejectedWith':
      return { kind, error: 'ForbiddenError' };
  }
}

export const ASSERTION_KINDS: readonly Assertion['kind'][] = [
  'excludesItem',
  'includesItem',
  'fieldEquals',
  'rejectedWith',
];

export const ASSERTION_LABELS: Record<Assertion['kind'], string> = {
  excludesItem: 'does not include item',
  includesItem: 'includes item',
  fieldEquals: 'field equals',
  rejectedWith: 'is rejected with',
};
