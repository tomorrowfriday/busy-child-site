import { describe, expect, it } from 'vitest';
import { projectSchema, promiseSchema, scenarioSchema, validate } from '@/content/schema';
import { clientProjects, ownProducts, projectBySlug, projects } from '@/content/projects';
import { gates, literals, promises, scenarios, site } from '@/content/site';

/**
 * Content gates. These are the site's equivalent of `composer validate`: the
 * rules that must hold for the published copy, checked in CI rather than
 * noticed by a reader.
 */

describe('content loads', () => {
  it('validates every collection at import time', () => {
    expect(projects.length).toBeGreaterThanOrEqual(4);
    expect(gates).toHaveLength(8);
    expect(promises).toHaveLength(6);
    expect(literals).toHaveLength(4);
    expect(scenarios.length).toBeGreaterThanOrEqual(3);
  });
});

describe('the anonymity rule', () => {
  // Client names withheld. If one is ever pasted back in, this fails the build.
  const FORBIDDEN = [
    'Fundamental',
    'FundamentalPortal',
    'Humanics',
    'CHG',
    'Connect Staffing',
    'Slate Studio',
  ];

  const haystack = JSON.stringify({ projects, site, gates, promises, scenarios }).toLowerCase();

  it.each(FORBIDDEN)('does not mention %s anywhere in published content', (name) => {
    expect(haystack).not.toContain(name.toLowerCase());
  });

  it('marks exactly one project as our own, and names it', () => {
    expect(ownProducts).toHaveLength(1);
    expect(ownProducts[0]?.slug).toBe('mines');
    expect(clientProjects).toHaveLength(4);
  });

  it('gives every client project a domain instead of a client name', () => {
    for (const project of clientProjects) {
      expect(project.named).toBe(false);
      expect(project.domain.length).toBeGreaterThan(0);
    }
  });
});

describe('slugs', () => {
  it('are unique', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('are kebab-case', () => {
    for (const slug of projects.map((p) => p.slug)) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});

describe('schema rejects bad content', () => {
  it('rejects a promise that is not phrased as a refusal', () => {
    expect(() =>
      validate(promiseSchema, { refusal: 'We are great.', detail: 'x' }, 'test'),
    ).toThrow(/refusal/);
  });

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
    expect(() => validate(promiseSchema, {}, 'content/site.ts → promises')).toThrow(
      /content\/site\.ts/,
    );
  });

  it('labels a root-level failure as (root) rather than an empty path', () => {
    expect(() => validate(promiseSchema, 'not an object', 'test')).toThrow(/\(root\)/);
  });
});

describe('projectBySlug', () => {
  it('finds a project by its slug', () => {
    expect(projectBySlug('mines')?.title).toContain('Mines');
  });

  it('returns undefined for an unknown slug', () => {
    expect(projectBySlug('no-such-project')).toBeUndefined();
  });
});

describe('outbound links', () => {
  // The portfolio PDF printed upwork.com/agencies/busy-child, which does not
  // resolve — the real agency profile is keyed by a numeric id. This shipped
  // once; it should not ship again.
  it('points at the agency profile by id, not the busy-child slug', () => {
    expect(site.upwork).toBe('https://www.upwork.com/agencies/2029955071357100515/');
    expect(site.upwork).not.toContain('busy-child');
  });

  it('uses an absolute https URL', () => {
    expect(() => new URL(site.upwork)).not.toThrow();
    expect(new URL(site.upwork).protocol).toBe('https:');
  });
});

describe('launch blockers are visible', () => {
  // These assert the placeholders still exist so nobody forgets they are
  // placeholders. Replace the value and update the test in the same commit.
  it('flags the placeholder inbox', () => {
    expect(site.email).toBe('hello@busychild.com');
  });

  it('flags the placeholder App Store link', () => {
    expect(ownProducts[0]?.externalUrl).toBe('https://apps.apple.com/');
  });
});
