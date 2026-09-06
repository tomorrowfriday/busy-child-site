import type { Assertion, Scenario } from '@/content/schema';

/**
 * A miniature of the DOS compiler.
 *
 * `renderSpec` prints a scenario the way it is written in `docs/spec/`;
 * `compileScenario` turns that same structured scenario into the executable
 * test it becomes. Both are pure functions of the scenario data, which is the
 * whole argument: the assertion never lives in the test file, so it cannot be
 * weakened to make a build pass. Changing what is verified means changing the
 * spec — a reviewed diff in a document a human approved.
 *
 * This runs in the browser on the homepage. It is the claim, executing.
 */

const INDENT = '  ';

/* ── spec side ──────────────────────────────────────────────────────────── */

function renderAssertion(assertion: Assertion): string {
  switch (assertion.kind) {
    case 'excludesItem':
      return `result does not include item where \`${assertion.field}\` equals \`${assertion.equals}\``;
    case 'includesItem':
      return `result includes item where \`${assertion.field}\` equals \`${assertion.equals}\``;
    case 'fieldEquals':
      return `\`${assertion.path}\` equals \`${assertion.value}\``;
    case 'rejectedWith':
      return `request is rejected with \`${assertion.error}\``;
  }
}

export function renderSpec(scenario: Scenario): string {
  const lines: string[] = [
    `### ${scenario.index}. ${scenario.title}`,
    '',
    `- **Role:** ${scenario.role}`,
    `- **Operation:** ${scenario.operation}`,
  ];

  if (scenario.mutation && Object.keys(scenario.mutation).length > 0) {
    lines.push('- **Mutation:**');
    for (const [key, value] of Object.entries(scenario.mutation)) {
      lines.push(`${INDENT}- \`${key}\`: ${value}`);
    }
  }

  lines.push('- **Assertions:**');
  for (const assertion of scenario.assertions) {
    lines.push(`${INDENT}- ${renderAssertion(assertion)}`);
  }

  return lines.join('\n');
}

/* ── generated side ─────────────────────────────────────────────────────── */

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function renderMutation(mutation: Scenario['mutation']): string {
  if (!mutation || Object.keys(mutation).length === 0) return '{}';
  const pairs = Object.entries(mutation).map(
    ([key, value]) => `${key}: ${quote(value)}`,
  );
  return `{ ${pairs.join(', ')} }`;
}

function compileAssertion(assertion: Assertion): string {
  switch (assertion.kind) {
    case 'excludesItem':
      return `${INDENT}t.ensureNoItem(data, { ${assertion.field}: t.get(context, ${quote(assertion.equals)}) });`;
    case 'includesItem':
      return `${INDENT}t.ensureItem(data, { ${assertion.field}: t.get(context, ${quote(assertion.equals)}) });`;
    case 'fieldEquals':
      return `${INDENT}expect(t.at(result, ${quote(assertion.path)})).toEqual(${quote(assertion.value)});`;
    case 'rejectedWith':
      return `${INDENT}await expect(request).rejects.toThrow(${assertion.error});`;
  }
}

/** True when any assertion inspects the result as a collection of items. */
function needsCollection(scenario: Scenario): boolean {
  return scenario.assertions.some(
    (a) => a.kind === 'excludesItem' || a.kind === 'includesItem',
  );
}

/** True when the scenario expects the request to fail rather than resolve. */
function expectsRejection(scenario: Scenario): boolean {
  return scenario.assertions.some((a) => a.kind === 'rejectedWith');
}

export function compileScenario(scenario: Scenario): string {
  const call = `t.request(${quote(scenario.operation)}, ${renderMutation(scenario.mutation)}, t.${scenario.role}())`;
  const body: string[] = [];

  if (expectsRejection(scenario)) {
    body.push(`${INDENT}const request = ${call};`);
  } else {
    body.push(`${INDENT}const result = await ${call};`);
    if (needsCollection(scenario)) {
      body.push(`${INDENT}const data = result as Record<string, unknown>[];`);
    }
  }

  body.push('');
  for (const assertion of scenario.assertions) {
    body.push(compileAssertion(assertion));
  }

  return [`it(${quote(scenario.title)}, async () => {`, ...body, '});'].join('\n');
}

/* ── a tiny highlighter, so the output reads as code rather than text ───── */

export type TokenKind = 'keyword' | 'string' | 'comment' | 'fn' | 'number' | 'plain';
export interface Token {
  readonly kind: TokenKind;
  readonly text: string;
}

const KEYWORDS = new Set([
  'const', 'await', 'async', 'as', 'return', 'new', 'throw', 'if', 'else', 'true', 'false',
]);

/**
 * Tokenises the small subset of TypeScript this compiler emits. It is not a
 * general parser — it only has to be correct for the output above, and it is
 * tested against exactly that.
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  // Order matters: comments, then strings, then identifiers/numbers.
  const pattern =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*")|(\b\d+\b)|([A-Za-z_$][\w$]*)/g;

  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > last) {
      tokens.push({ kind: 'plain', text: source.slice(last, match.index) });
    }

    const [text, comment, str, num, ident] = match;
    if (comment !== undefined) {
      tokens.push({ kind: 'comment', text });
    } else if (str !== undefined) {
      tokens.push({ kind: 'string', text });
    } else if (num !== undefined) {
      tokens.push({ kind: 'number', text });
    } else if (ident !== undefined) {
      const isCall = source[match.index + text.length] === '(';
      tokens.push({
        kind: KEYWORDS.has(ident) ? 'keyword' : isCall ? 'fn' : 'plain',
        text,
      });
    }

    last = match.index + text.length;
  }

  if (last < source.length) {
    tokens.push({ kind: 'plain', text: source.slice(last) });
  }

  return tokens;
}
