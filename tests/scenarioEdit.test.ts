import { describe, expect, it } from 'vitest';
import {
  ASSERTION_KINDS,
  ASSERTION_LABELS,
  changeAssertionKind,
  checkScenario,
  removeAssertion,
  setAssertion,
  setOperation,
  setRole,
} from '@/lib/scenarioEdit';
import type { Assertion, Scenario } from '@/content/schema';

const base: Scenario = {
  index: 4,
  label: 'Fixture',
  title: 'Platform activity is not returned to another organization user',
  role: 'USER2',
  operation: 'IndexActivities',
  assertions: [{ kind: 'excludesItem', field: 'id', equals: 'activityId' }],
  proves: 'Tenant isolation.',
};

describe('edits are immutable', () => {
  it('setRole returns a new scenario and leaves the original alone', () => {
    const next = setRole(base, 'ADMIN');
    expect(next.role).toBe('ADMIN');
    expect(base.role).toBe('USER2');
    expect(next).not.toBe(base);
  });

  it('setOperation returns a new scenario', () => {
    expect(setOperation(base, 'IndexClaims').operation).toBe('IndexClaims');
    expect(base.operation).toBe('IndexActivities');
  });

  it('setAssertion replaces only the assertion at the index', () => {
    const two: Scenario = {
      ...base,
      assertions: [
        { kind: 'excludesItem', field: 'id', equals: 'a' },
        { kind: 'includesItem', field: 'id', equals: 'b' },
      ],
    };
    const next = setAssertion(two, 1, { kind: 'rejectedWith', error: 'ForbiddenError' });
    expect(next.assertions[0]).toEqual(two.assertions[0]);
    expect(next.assertions[1]).toEqual({ kind: 'rejectedWith', error: 'ForbiddenError' });
    expect(two.assertions[1]).toEqual({ kind: 'includesItem', field: 'id', equals: 'b' });
  });

  it('setAssertion at an index that does not exist changes nothing', () => {
    expect(setAssertion(base, 9, { kind: 'rejectedWith', error: 'E' }).assertions).toEqual(
      base.assertions,
    );
  });

  it('removeAssertion drops the one at the index', () => {
    const two: Scenario = {
      ...base,
      assertions: [
        { kind: 'excludesItem', field: 'id', equals: 'a' },
        { kind: 'includesItem', field: 'id', equals: 'b' },
      ],
    };
    expect(removeAssertion(two, 0).assertions).toEqual([two.assertions[1]]);
    expect(two.assertions).toHaveLength(2);
  });
});

describe('checkScenario', () => {
  it('accepts a valid scenario', () => {
    expect(checkScenario(base)).toEqual({ ok: true, errors: [] });
  });

  it('rejects a scenario whose last assertion was removed', () => {
    const empty = removeAssertion(base, 0);
    const result = checkScenario(empty);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/assert/i);
  });

  it('rejects a lower-case operation and says which field is wrong', () => {
    const result = checkScenario(setOperation(base, 'indexActivities'));
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/^operation: /);
  });

  it('rejects a lower-case role', () => {
    expect(checkScenario(setRole(base, 'user2')).ok).toBe(false);
  });

  it('reports a root-level failure without a field prefix', () => {
    const result = checkScenario('nonsense' as unknown as Scenario);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).not.toMatch(/^\w+: /);
  });
});

describe('changeAssertionKind', () => {
  const excludes: Assertion = { kind: 'excludesItem', field: 'claimId', equals: 'otherId' };

  it('returns the same object when the kind is unchanged', () => {
    expect(changeAssertionKind(excludes, 'excludesItem')).toBe(excludes);
  });

  it('carries field and equals across the two item kinds', () => {
    expect(changeAssertionKind(excludes, 'includesItem')).toEqual({
      kind: 'includesItem',
      field: 'claimId',
      equals: 'otherId',
    });
  });

  it('falls back to sensible defaults when switching to fieldEquals', () => {
    expect(changeAssertionKind(excludes, 'fieldEquals')).toEqual({
      kind: 'fieldEquals',
      path: '0.status',
      value: 'funded',
    });
  });

  it('starts from defaults when switching away from fieldEquals', () => {
    const fieldEquals: Assertion = { kind: 'fieldEquals', path: '1.state', value: 'closed' };
    // fieldEquals carries no field/equals, so the item kinds start fresh.
    expect(changeAssertionKind(fieldEquals, 'rejectedWith')).toEqual({
      kind: 'rejectedWith',
      error: 'ForbiddenError',
    });
    expect(changeAssertionKind(fieldEquals, 'excludesItem')).toEqual({
      kind: 'excludesItem',
      field: 'id',
      equals: 'recordId',
    });
  });

  it('keeps the error when switching away from and back to rejectedWith', () => {
    const rejected: Assertion = { kind: 'rejectedWith', error: 'NotFoundError' };
    expect(changeAssertionKind(rejected, 'rejectedWith')).toBe(rejected);
    expect(changeAssertionKind(rejected, 'includesItem')).toEqual({
      kind: 'includesItem',
      field: 'id',
      equals: 'recordId',
    });
  });

  it('produces a valid assertion for every kind it can switch to', () => {
    for (const kind of ASSERTION_KINDS) {
      const next = changeAssertionKind(excludes, kind);
      expect(checkScenario({ ...base, assertions: [next] }).ok).toBe(true);
    }
  });
});

describe('assertion vocabulary', () => {
  it('labels every kind the editor offers', () => {
    for (const kind of ASSERTION_KINDS) {
      expect(ASSERTION_LABELS[kind]).toBeTruthy();
    }
  });
});
