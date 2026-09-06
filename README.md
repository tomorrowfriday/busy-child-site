# Busy Child — website

Next.js 16 · TypeScript (strict) · static export · no runtime, no database, no CMS.

The site argues that verification should be a build failure rather than a review
comment. So this repo is built that way: content is a typed specification validated
at build time, pages are generated from it, and four gates run in CI. The website is
the work sample.

```bash
npm install
npm run dev      # http://localhost:3000
npm run gates    # typecheck → lint → coverage(100%) → build
```

## Why it is built like this

Every client project on this site is anonymised and there are no screenshots, so a
prospect cannot inspect the work — only the website. That makes the site the primary
demonstration of how we build, not a description of it. Three consequences:

- **Content is a spec.** Copy lives in `src/content/` as typed data validated by Zod
  at module load. An invalid promise, a lower-case operation name or a non-kebab slug
  throws during `next build` rather than shipping. It is `composer validate`, applied
  to a website.
- **The homepage compiler is real.** `src/lib/compile.ts` is a pure function that turns
  a spec scenario into the test it becomes. The homepage runs it in the browser — the
  panes are computed, not a pair of pre-written strings being swapped. It is the claim,
  executing.
- **The gates are the ones we sell.** 100% coverage on the logic and content layers,
  enforced as a threshold. Not aspirational: `npm run gates` fails under it.

## Layout

```
src/
├── app/                    routes (App Router, all statically exported)
│   ├── page.tsx            home — seven-block sequence
│   ├── work/               four platforms + Mines
│   ├── method/             DOS: spec, compiler, gates
│   ├── working-with-us/    six refusals, engagement, quality bar
│   ├── contact/            brief prompt
│   ├── opengraph-image.tsx social card, rendered at build
│   ├── sitemap.ts robots.ts
│   └── globals.css         the whole design system
├── components/             Chrome, Primitives, CompilerDemo
├── content/
│   ├── schema.ts           Zod schemas — the content specification
│   ├── site.ts             copy, gates, promises, scenarios
│   └── projects.ts         the work
└── lib/compile.ts          spec → test compiler + tokenizer
tests/                      37 tests, 100% coverage of src/lib and src/content
.github/workflows/ci.yml    the gates
_legacy-static/             the previous hand-written HTML site, kept for reference
```

## The gates

`npm run gates`, and the same four steps in CI on every push and pull request:

| Gate | Catches |
|---|---|
| `tsc --noEmit` | Type drift. `strict`, plus `noUncheckedIndexedAccess` and `noUnusedLocals`. |
| `eslint` | Style and correctness. Zero warnings allowed. |
| `vitest --coverage` | Any untested line, branch or function in `src/lib` and `src/content` — threshold 100%. |
| `next build` | Invalid content (schemas throw), and the static export itself. |

A separate CI job runs `npm audit --audit-level=high`.

## Design system

All in `src/app/globals.css`. It is a syntax scheme: every colour carries the meaning
it carries in code, and nothing is coloured decoratively.

| Token | Role |
|---|---|
| `--bg` `--panel` | listing paper, raised block — deliberately not white |
| `--fg` `--fg-dim` `--fg-faint` | ink, body prose, metadata |
| `--kw` | keyword → structure, section markers |
| `--str` | string → settled, verified, shipped |
| `--num` | literal → **every metric on the site** |
| `--fn` | function → links and navigation |
| `--com` | comment → asides and annotation |

Light and dark are both defined: light on bare `:root`, dark under both
`prefers-color-scheme` and `[data-theme="dark"]`, so an explicit choice can win over
the OS setting if a toggle is ever added.

**Type.** Martian Mono for display (wide and heavy — good above 28px, unreadable as
body text), JetBrains Mono for everything else. Self-hosted at build by `next/font`,
so there is no request to Google at runtime, no layout shift and no third-party
tracking on a page that argues for restraint.

### Rules worth keeping

- **List markers are positioned, not grid cells.** A list item containing `<strong>` or
  a link would otherwise scatter its children across implicit grid rows. This was a real
  bug in the previous site; don't reintroduce it.
- **The motion budget is one moment** — the compiled pane settling when you pick a
  different scenario. It respects `prefers-reduced-motion`. Nothing else animates.
- **No fake IDE chrome.** No window dots, no simulated tabs, no typing animation. The
  typography and the colour system are the design.
- **Rules, not shadows.** Hairline borders, flat panels, no gradients.
- **Wide content scrolls inside its own container**, so the page body never scrolls
  sideways. The spec pane wraps because it is prose; the generated pane scrolls because
  breaking a line would misrepresent what the compiler emitted.

## Before launch — TODO

Two placeholders. Both are asserted in `tests/content.test.ts` so they cannot be
quietly forgotten — replace the value and update the test in the same commit.

1. **The inbox.** `site.email` in `src/content/site.ts` is `hello@busychild.com`.
2. **The Mines App Store URL.** `projects.ts` → `mines.externalUrl` points at
   `https://apps.apple.com/`. Mines is the only thing on the site a stranger can click
   to verify, so this link matters more than it looks.

Also worth settling:

- **`site.url`** is `https://busychild.com` and feeds canonical, sitemap and OG URLs.
- **Two missing numbers.** The workforce-scheduling and provider-scheduling entries
  carry architecture but no outcome figure, unlike the other two. With client names
  withheld, the figure does most of the persuading.

## Deploying

Static export — `npm run build` writes `out/`. Anything serves it:

- **Cloudflare Pages** — build `npm run build`, output directory `out`.
- **Netlify** — same, or drag `out/` onto the dashboard.
- **GitHub Pages** — publish `out/` (CI already uploads it as an artifact).
