import { describe, expect, it } from 'vitest';
import en from '@/content/locales/en';
import uk from '@/content/locales/uk';
import { getContent, isLocale, LOCALES, clientProjects, ownProducts, site } from '@/content';
import { projectSchema, scenarioSchema, validate } from '@/content/schema';
import type { Content } from '@/content/schema';

/**
 * Translation gates.
 *
 * Both locales are parsed against the same schema at import, so a structurally
 * broken translation already fails the build. These tests close the gaps a
 * schema cannot see: a key that exists but was never translated, a list that
 * drifted out of step, or a slug that stopped matching across languages.
 */

const dictionaries: Record<string, Content> = { en, uk };

/** Every leaf path in an object, e.g. "home.editor.role" or "literals.0.value". */
function paths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => paths(item, `${prefix}${prefix ? '.' : ''}${i}`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      paths(child, `${prefix}${prefix ? '.' : ''}${key}`),
    );
  }
  return [prefix];
}

/** Every string leaf, keyed by path. */
function strings(value: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (node: unknown, path: string) => {
    if (typeof node === 'string') {
      out[path] = node;
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}${path ? '.' : ''}${i}`));
      return;
    }
    if (node && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) {
        walk(child, `${path}${path ? '.' : ''}${key}`);
      }
    }
  };
  walk(value, prefix);
  return out;
}

describe('the locale registry', () => {
  it('exposes exactly the locales it ships', () => {
    expect([...LOCALES]).toEqual(['en', 'uk']);
    expect(Object.keys(dictionaries).sort()).toEqual([...LOCALES].sort());
  });

  it('resolves content for every locale', () => {
    for (const locale of LOCALES) {
      expect(getContent(locale).locale).toBe(locale);
    }
  });

  it('recognises its own locales and rejects others', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('uk')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});

describe('the two languages stay in step', () => {
  // The gate that matters: a missing or extra Ukrainian key fails the build
  // rather than shipping a half-translated page.
  it('have identical key structures', () => {
    const a = paths(en).sort();
    const b = paths(uk).sort();

    const onlyInEn = a.filter((p) => !b.includes(p));
    const onlyInUk = b.filter((p) => !a.includes(p));

    expect({ onlyInEn, onlyInUk }).toEqual({ onlyInEn: [], onlyInUk: [] });
  });

  it('have the same number of every repeated block', () => {
    expect(uk.literals).toHaveLength(en.literals.length);
    expect(uk.gates).toHaveLength(en.gates.length);
    expect(uk.promises).toHaveLength(en.promises.length);
    expect(uk.engagement).toHaveLength(en.engagement.length);
    expect(uk.projects).toHaveLength(en.projects.length);
    expect(uk.scenarios).toHaveLength(en.scenarios.length);
    expect(uk.home.outcomes.items).toHaveLength(en.home.outcomes.items.length);
    expect(uk.home.anchors).toHaveLength(en.home.anchors.length);
    expect(uk.home.results.items).toHaveLength(en.home.results.items.length);
    expect(uk.home.proof.steps).toHaveLength(en.home.proof.steps.length);
    expect(uk.home.proof.ship).toHaveLength(en.home.proof.ship.length);
    expect(uk.home.working.items).toHaveLength(en.home.working.items.length);
    expect(uk.projects.map((p) => p.facts.length)).toEqual(en.projects.map((p) => p.facts.length));
    expect(uk.methodPage.stages).toHaveLength(en.methodPage.stages.length);
    expect(uk.contactPage.briefItems).toHaveLength(en.contactPage.briefItems.length);
  });

  it('keep project slugs identical, so /en/work#x and /uk/work#x agree', () => {
    expect(uk.projects.map((p) => p.slug)).toEqual(en.projects.map((p) => p.slug));
  });

  it('keep nav hrefs identical, so the language switch stays on the same page', () => {
    expect(uk.nav.map((n) => n.href)).toEqual(en.nav.map((n) => n.href));
  });

  it('keep the same project named/anonymous split', () => {
    expect(clientProjects(uk).map((p) => p.slug)).toEqual(clientProjects(en).map((p) => p.slug));
    expect(ownProducts(uk).map((p) => p.slug)).toEqual(ownProducts(en).map((p) => p.slug));
  });
});

describe('the Ukrainian copy is actually translated', () => {
  const enStrings = strings(en);
  const ukStrings = strings(uk);

  // Values that are the same in both languages on purpose: identifiers, code,
  // brand names, stacks, numerals and the like.
  const SHARED =
    /^(projects\.\d+\.(stack|slug|externalUrl)|scenarios\.\d+\.(role|operation|assertions|mutation)|gates\.\d+\.(gate|isCommand)|literals\.\d+\.value|methodPage\.pipelineLabels\.spec|common\.(upwork|switchLanguage)|nav\.\d+\.href|locale$|projects\.\d+\.title|projects\.\d+\.metric\.value|home\.editor\.(specHead|outHead|failHead)|methodPage\.metaTitle|home\.anchors\.\d+\.href|home\.proof\.ship\.\d+\.value)/;

  const candidates = Object.keys(enStrings).filter((path) => !SHARED.test(path));

  it('has a large body of prose to check', () => {
    expect(candidates.length).toBeGreaterThan(150);
  });

  it('differs from English everywhere it should', () => {
    const untranslated = candidates.filter(
      (path) => enStrings[path] === ukStrings[path] && (enStrings[path]?.length ?? 0) > 3,
    );
    expect(untranslated).toEqual([]);
  });

  it('uses Cyrillic in its long-form copy', () => {
    const cyrillic = /[Ѐ-ӿ]/;
    expect(cyrillic.test(uk.site.statement)).toBe(true);
    expect(cyrillic.test(uk.home.outcomes.title)).toBe(true);
    expect(cyrillic.test(uk.methodPage.hero.title)).toBe(true);
  });
});

describe('the content schema rejects bad content', () => {
  it('rejects a scenario with no assertions', () => {
    expect(() =>
      validate(
        scenarioSchema,
        { index: 1, title: 't', role: 'USER', operation: 'Op', assertions: [], proves: 'p' },
        'test',
      ),
    ).toThrow(/assert/);
  });

  it('rejects a lower-case operation name', () => {
    expect(() =>
      validate(
        scenarioSchema,
        {
          index: 1,
          title: 't',
          role: 'USER',
          operation: 'indexActivities',
          assertions: [{ kind: 'rejectedWith', error: 'E' }],
          proves: 'p',
        },
        'test',
      ),
    ).toThrow(/PascalCase/);
  });

  it('rejects a non-kebab-case slug', () => {
    expect(() =>
      validate(
        projectSchema,
        {
          slug: 'Not Kebab',
          domain: 'd',
          title: 't',
          metric: { value: 'v', caption: 'c' },
          summary: 's',
          context: 'c',
          shipped: ['a', 'b', 'c'],
          stack: ['x'],
        },
        'test',
      ),
    ).toThrow(/kebab-case/);
  });

  it('names the source file in the error, so the failure is actionable', () => {
    expect(() => validate(scenarioSchema, {}, 'content/locales/uk.ts')).toThrow(
      /content\/locales\/uk\.ts/,
    );
  });

  it('labels a root-level failure as (root) rather than an empty path', () => {
    expect(() => validate(scenarioSchema, 'not an object', 'test')).toThrow(/\(root\)/);
  });

  it('returns the parsed value when content is valid', () => {
    const parsed = validate(scenarioSchema, en.scenarios[0], 'test');
    expect(parsed.operation).toBe(en.scenarios[0]?.operation);
  });
});

describe('outbound links', () => {
  it('points at the agency profile by id, not the busy-child slug', () => {
    expect(site.upwork).toBe('https://www.upwork.com/agencies/2029955071357100515/');
    expect(site.upwork).not.toContain('busy-child');
  });

  it('points Mines at its actual App Store listing', () => {
    for (const locale of LOCALES) {
      const mines = ownProducts(getContent(locale))[0];
      expect(mines?.externalUrl).toBe(
        'https://apps.apple.com/us/app/mines-classic-bomb-puzzle/id1541036838',
      );
      expect(mines?.externalUrl).toMatch(/\/id\d+$/);
    }
  });

  // Asserts the placeholder still exists so nobody forgets it is one.
  it('flags the placeholder inbox', () => {
    expect(site.email).toBe('hello@busychild.com');
  });
});

describe('the anonymity rule', () => {
  const FORBIDDEN = ['Fundamental', 'Humanics', 'CHG', 'Connect Staffing', 'Slate Studio'];
  const haystack = JSON.stringify({ en, uk }).toLowerCase();

  it.each(FORBIDDEN)('does not mention %s in either language', (name) => {
    expect(haystack).not.toContain(name.toLowerCase());
  });
});

describe('the outcomes section speaks to an owner, not an engineer', () => {
  // This section exists for a reader who does not know what an API is. If
  // jargon creeps back in, it stops doing its job.
  const JARGON = [
    'api',
    'schema',
    'compiler',
    'typescript',
    'kubernetes',
    'kafka',
    'serverless',
    'endpoint',
    'repository',
    'deployment',
  ];

  for (const locale of LOCALES) {
    const content = getContent(locale);
    const haystack = JSON.stringify(content.home.outcomes).toLowerCase();

    it.each(JARGON)(`[${locale}] avoids the word "%s"`, (word) => {
      expect(haystack).not.toContain(word);
    });
  }

  it('leads with a plain-language explanation in both languages', () => {
    for (const locale of LOCALES) {
      const outcomes = getContent(locale).home.outcomes;
      expect(outcomes.note?.text.length).toBeGreaterThan(60);
      expect(outcomes.items.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('backs at least two outcomes with a real figure, in both languages', () => {
    for (const locale of LOCALES) {
      const withProof = getContent(locale).home.outcomes.items.filter((i) => i.proof);
      expect(withProof.length).toBeGreaterThanOrEqual(2);
      for (const item of withProof) {
        expect(item.proofCaption).toBeTruthy();
      }
    }
  });
});
