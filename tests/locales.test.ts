import { describe, expect, it } from 'vitest';
import en from '@/content/locales/en';
import ua from '@/content/locales/ua';
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

const dictionaries: Record<string, Content> = { en, ua };

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
    expect([...LOCALES]).toEqual(['en', 'ua']);
    expect(Object.keys(dictionaries).sort()).toEqual([...LOCALES].sort());
  });

  it('resolves content for every locale', () => {
    for (const locale of LOCALES) {
      expect(getContent(locale).locale).toBe(locale);
    }
  });

  it('recognises its own locales and rejects others', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ua')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});

describe('the two languages stay in step', () => {
  // The gate that matters: a missing or extra Ukrainian key fails the build
  // rather than shipping a half-translated page.
  it('have identical key structures', () => {
    const a = paths(en).sort();
    const b = paths(ua).sort();

    const onlyInEn = a.filter((p) => !b.includes(p));
    const onlyInUa = b.filter((p) => !a.includes(p));

    expect({ onlyInEn, onlyInUa }).toEqual({ onlyInEn: [], onlyInUa: [] });
  });

  it('have the same number of every repeated block', () => {
    expect(ua.literals).toHaveLength(en.literals.length);
    expect(ua.gates).toHaveLength(en.gates.length);
    expect(ua.promises).toHaveLength(en.promises.length);
    expect(ua.engagement).toHaveLength(en.engagement.length);
    expect(ua.projects).toHaveLength(en.projects.length);
    expect(ua.scenarios).toHaveLength(en.scenarios.length);
    expect(ua.home.anchors).toHaveLength(en.home.anchors.length);
    expect(ua.home.results.items).toHaveLength(en.home.results.items.length);
    expect(ua.home.proof.steps).toHaveLength(en.home.proof.steps.length);
    expect(ua.home.proof.ship).toHaveLength(en.home.proof.ship.length);
    expect(ua.home.working.items).toHaveLength(en.home.working.items.length);
    expect(ua.projects.map((p) => p.facts.length)).toEqual(en.projects.map((p) => p.facts.length));
    expect(ua.contactPage.include).toHaveLength(en.contactPage.include.length);
  });

  it('keep project slugs identical, so /en/work#x and /ua/work#x agree', () => {
    expect(ua.projects.map((p) => p.slug)).toEqual(en.projects.map((p) => p.slug));
  });


  it('keep the same project named/anonymous split', () => {
    expect(clientProjects(ua).map((p) => p.slug)).toEqual(clientProjects(en).map((p) => p.slug));
    expect(ownProducts(ua).map((p) => p.slug)).toEqual(ownProducts(en).map((p) => p.slug));
  });
});

describe('the Ukrainian copy is actually translated', () => {
  const enStrings = strings(en);
  const uaStrings = strings(ua);

  // Values that are the same in both languages on purpose: identifiers, code,
  // brand names, stacks, numerals and the like.
  const SHARED =
    /^(projects\.\d+\.(stack|slug|externalUrl)|scenarios\.\d+\.(role|operation|assertions|mutation)|gates\.\d+\.(gate|isCommand)|literals\.\d+\.value|common\.(upwork|switchLanguage)|nav\.\d+\.href|locale$|projects\.\d+\.title|projects\.\d+\.metric\.value|projects\.\d+\.metricBig|home\.editor\.(specHead|outHead|failHead)|home\.anchors\.\d+\.href|home\.proof\.ship\.\d+\.value|home\.deck\.screens\.\d+\.hint)/;

  const candidates = Object.keys(enStrings).filter((path) => !SHARED.test(path));

  it('has a large body of prose to check', () => {
    expect(candidates.length).toBeGreaterThan(150);
  });

  it('differs from English everywhere it should', () => {
    const untranslated = candidates.filter(
      (path) => enStrings[path] === uaStrings[path] && (enStrings[path]?.length ?? 0) > 3,
    );
    expect(untranslated).toEqual([]);
  });

  it('uses Cyrillic in its long-form copy', () => {
    const cyrillic = /[Ѐ-ӿ]/;
    expect(cyrillic.test(ua.site.statement)).toBe(true);
    expect(cyrillic.test(ua.home.results.title)).toBe(true);
    expect(cyrillic.test(ua.home.proof.title)).toBe(true);
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
    expect(() => validate(scenarioSchema, {}, 'content/locales/ua.ts')).toThrow(
      /content\/locales\/ua\.ts/,
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

  // The inbox shipped as a hello@ placeholder once. This pins the real one.
  it('points at the real inbox, not a placeholder', () => {
    expect(site.email).toBe('kravets.s.mail@gmail.com');
    expect(site.email).not.toMatch(/^hello@/);
  });
});

describe('the anonymity rule', () => {
  const FORBIDDEN = ['Fundamental', 'Humanics', 'CHG', 'Connect Staffing', 'Slate Studio'];
  const haystack = JSON.stringify({ en, ua }).toLowerCase();

  it.each(FORBIDDEN)('does not mention %s in either language', (name) => {
    expect(haystack).not.toContain(name.toLowerCase());
  });
});

