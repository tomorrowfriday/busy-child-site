import { describe, expect, it } from 'vitest';
import { compileScenario, renderSpec, tokenize, tokenizeSpec } from '@/lib/compile';
import type { Scenario } from '@/content/schema';
import en from '@/content/locales/en';
const scenarios = en.scenarios;

const isolation: Scenario = {
  index: 4,
  label: 'Fixture',
  title: 'Platform activity is not returned to another organization user',
  role: 'USER2',
  operation: 'IndexActivities',
  assertions: [{ kind: 'excludesItem', field: 'id', equals: 'activityId' }],
  proves: 'Tenant isolation.',
};

const rejection: Scenario = {
  index: 7,
  label: 'Fixture',
  title: 'A supervisor cannot approve a claim outside their location',
  role: 'SUPERVISOR',
  operation: 'ApproveClaim',
  mutation: { claimId: 'otherLocationClaimId' },
  assertions: [{ kind: 'rejectedWith', error: 'ForbiddenError' }],
  proves: 'Permission scope.',
};

const positive: Scenario = {
  index: 12,
  label: 'Fixture',
  title: 'An investor sees their own commitment after funding',
  role: 'INVESTOR',
  operation: 'IndexCommitments',
  assertions: [
    { kind: 'includesItem', field: 'id', equals: 'commitmentId' },
    { kind: 'fieldEquals', path: '0.status', value: 'funded' },
  ],
  proves: 'Positive path.',
};

describe('renderSpec', () => {
  it('prints the scenario the way it appears in docs/spec/', () => {
    expect(renderSpec(isolation)).toBe(
      [
        '### 4. Platform activity is not returned to another organization user',
        '',
        '- **Role:** USER2',
        '- **Operation:** IndexActivities',
        '- **Assertions:**',
        '  - result does not include item where `id` equals `activityId`',
      ].join('\n'),
    );
  });

  it('includes a mutation block only when the scenario has one', () => {
    expect(renderSpec(isolation)).not.toContain('Mutation');
    expect(renderSpec(rejection)).toContain('- **Mutation:**');
    expect(renderSpec(rejection)).toContain('- `claimId`: otherLocationClaimId');
  });

  it('renders every assertion kind', () => {
    expect(renderSpec(positive)).toContain('result includes item where `id` equals `commitmentId`');
    expect(renderSpec(positive)).toContain('`0.status` equals `funded`');
    expect(renderSpec(rejection)).toContain('request is rejected with `ForbiddenError`');
  });
});

describe('compileScenario', () => {
  it('compiles a tenant-isolation scenario to the expected test', () => {
    expect(compileScenario(isolation)).toBe(
      [
        "it('Platform activity is not returned to another organization user', async () => {",
        "  const result = await t.request('IndexActivities', {}, t.USER2());",
        '  const data = result as Record<string, unknown>[];',
        '',
        "  t.ensureNoItem(data, { id: t.get(context, 'activityId') });",
        '});',
      ].join('\n'),
    );
  });

  it('declares the collection binding only when an item assertion needs it', () => {
    expect(compileScenario(isolation)).toContain('const data = result');
    expect(compileScenario(rejection)).not.toContain('const data = result');
  });

  it('awaits a rejection rather than a result when the spec expects failure', () => {
    const compiled = compileScenario(rejection);
    expect(compiled).toContain("const request = t.request('ApproveClaim'");
    expect(compiled).toContain('await expect(request).rejects.toThrow(ForbiddenError);');
    expect(compiled).not.toContain('const result = await');
  });

  it('serialises a mutation object into the request call', () => {
    expect(compileScenario(rejection)).toContain(
      "t.request('ApproveClaim', { claimId: 'otherLocationClaimId' }, t.SUPERVISOR())",
    );
  });

  it('emits one line per assertion', () => {
    const compiled = compileScenario(positive);
    expect(compiled).toContain("t.ensureItem(data, { id: t.get(context, 'commitmentId') });");
    expect(compiled).toContain("expect(t.at(result, '0.status')).toEqual('funded');");
  });

  it('escapes quotes so a title with an apostrophe stays valid code', () => {
    const tricky: Scenario = { ...isolation, title: "It's rejected" };
    expect(compileScenario(tricky)).toContain("it('It\\'s rejected'");
  });

  it('is a pure function of its input', () => {
    const before = JSON.stringify(isolation);
    compileScenario(isolation);
    renderSpec(isolation);
    expect(JSON.stringify(isolation)).toBe(before);
  });
});

describe('tokenize', () => {
  it('round-trips: concatenating every token reproduces the source exactly', () => {
    for (const scenario of scenarios) {
      const source = compileScenario(scenario);
      expect(tokenize(source).map((t) => t.text).join('')).toBe(source);
    }
  });

  it('classifies keywords, strings and calls', () => {
    const tokens = tokenize("const result = await t.request('Op');");
    const kinds = Object.fromEntries(tokens.map((t) => [t.text, t.kind]));
    expect(kinds['const']).toBe('keyword');
    expect(kinds['await']).toBe('keyword');
    expect(kinds["'Op'"]).toBe('string');
    expect(kinds['request']).toBe('fn');
  });

  it('treats a comment as a single token', () => {
    const tokens = tokenize('/** does a thing */\nconst x = 1;');
    expect(tokens[0]).toEqual({ kind: 'comment', text: '/** does a thing */' });
  });

  it('does not classify identifiers inside strings as code', () => {
    const tokens = tokenize("const a = 'const await';");
    const strings = tokens.filter((t) => t.kind === 'string');
    expect(strings).toHaveLength(1);
    expect(strings[0]?.text).toBe("'const await'");
  });

  it('returns an empty list for empty input', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('the published scenarios', () => {
  it('every scenario compiles to a syntactically plausible test', () => {
    for (const scenario of scenarios) {
      const compiled = compileScenario(scenario);
      expect(compiled.startsWith('it(')).toBe(true);
      expect(compiled.endsWith('});')).toBe(true);
      // Braces must balance, or we are shipping broken code on the homepage.
      const opens = (compiled.match(/\{/g) ?? []).length;
      const closes = (compiled.match(/\}/g) ?? []).length;
      expect(opens).toBe(closes);
    }
  });
});

describe('tokenizeSpec', () => {
  it('marks a heading and leaves its text alone', () => {
    expect(tokenizeSpec('### 4. Platform activity')).toEqual([
      { kind: 'keyword', text: '### ' },
      { kind: 'plain', text: '4. Platform activity' },
    ]);
  });

  it('marks a bold lead-in', () => {
    const tokens = tokenizeSpec('- **Role:** USER2');
    expect(tokens).toContainEqual({ kind: 'keyword', text: '**Role:**' });
    expect(tokens).toContainEqual({ kind: 'comment', text: '- ' });
    expect(tokens.at(-1)).toEqual({ kind: 'plain', text: ' USER2' });
  });

  it('marks backticked identifiers as strings', () => {
    expect(tokenizeSpec('where `id` equals')).toContainEqual({ kind: 'string', text: '`id`' });
  });

  it('keeps plain text between matches', () => {
    const tokens = tokenizeSpec('result `a` and `b`');
    expect(tokens).toContainEqual({ kind: 'plain', text: ' and ' });
  });

  it('returns a line with nothing to mark as a single plain token', () => {
    expect(tokenizeSpec('just words')).toEqual([{ kind: 'plain', text: 'just words' }]);
  });

  it('returns nothing for an empty line', () => {
    expect(tokenizeSpec('')).toEqual([]);
  });
});
