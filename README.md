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

To just *look* at the site, there is a launcher that needs nothing but Node installed
— `start.cmd` on Windows (double-click it), `./start.sh` on macOS and Linux, or
`npm run up` anywhere. It installs dependencies on a fresh clone, reuses a dev server
that is already running instead of failing against it, picks the first free port from
3000, and opens the browser once the server answers.

## Why it is built like this

Every client project on this site is anonymised and there are no screenshots, so a
prospect cannot inspect the work — only the website. That makes the site the primary
demonstration of how we build, not a description of it. Three consequences:

- **Content is a spec.** Copy lives in `src/content/` as typed data validated by Zod
  at module load. An invalid promise, a lower-case operation name or a non-kebab slug
  throws during `next build` rather than shipping. It is `composer validate`, applied
  to a website.
- **The homepage compiler is real, and editable.** `src/lib/compile.ts` is a pure
  function that turns a spec scenario into the test it becomes. The homepage runs it in
  the browser and lets a visitor change the spec — role, operation, assertions — and
  watch the test recompile. Break the spec and nothing is generated at all, because the
  editor runs the same schema the build runs. It is the claim, executing.
- **The gates are the ones we sell.** 100% coverage on the logic and content layers,
  enforced as a threshold. Not aspirational: `npm run gates` fails under it.

## Layout

```
src/
├── app/                    routes (App Router, all statically exported)
│   ├── page.tsx            home — the ten-screen deck
│   ├── work/               four platforms + Mines
│   ├── method/             DOS: spec, compiler, gates
│   ├── working-with-us/    six refusals, engagement, quality bar
│   ├── contact/            brief prompt
│   ├── opengraph-image.tsx social card, rendered at build
│   ├── sitemap.ts robots.ts
│   └── globals.css         the whole design system
├── components/
│   ├── SpecEditor.tsx      editable spec → live recompiled test
│   ├── GateRunner.tsx      the gate table, runnable
│   ├── Pipeline.tsx        SVG pipeline, lights in sequence on scroll
│   ├── Reveal.tsx          scroll reveal (one observer for the page)
│   ├── Link.tsx            next/link with prefetch off — see note below
│   └── Chrome, Primitives
├── content/
│   ├── schema.ts           Zod schemas — the content specification
│   ├── site.ts             copy, gates, promises, scenarios
│   └── projects.ts         the work
└── lib/
    ├── compile.ts          spec → test compiler + tokenizer
    ├── gates.ts            gate-run planning and summary
    └── scenarioEdit.ts     immutable spec edits + validity
tests/                      72 tests, 100% coverage of src/lib and src/content
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

## The interaction layer

Three interactive pieces, and one rule behind all of them: **every animation
demonstrates a claim rather than decorating one.** The copy says "No theater", so
nothing here moves for effect.

| Piece | What it demonstrates |
|---|---|
| **Spec editor** (home method sheet, `/method`) | That the assertion lives in the spec. Edit the role, operation or an assertion and the test recompiles. Remove the last assertion and the compiler refuses to emit — the same failure `composer validate` produces in CI. |
| **Gate runner** (home method sheet, `/method`) | That verification is a build failure, not a review comment. Run the gates, then pick one to break: it stops there and everything after it is skipped, not reported at the end. |
| **Pipeline** (`/method`) | The mechanism itself. Stages light in order as it scrolls in, once. A diagram that loops forever is wallpaper. |
| **The deck** (home) | That there is a route through the argument. Ten screens, one on top at a time, each arriving with its own motion so the direction of travel is legible. `src/lib/deck.ts` decides every frame of it. |

All four collapse to a finished, static state under `prefers-reduced-motion`, and the
logic behind them is pure and unit-tested — the components only animate what
`src/lib` decides.

### Rules worth keeping

- **List markers are positioned, not grid cells.** A list item containing `<strong>` or
  a link would otherwise scatter its children across implicit grid rows. This was a real
  bug in the previous site; don't reintroduce it.
- **Motion is functional or it does not ship.** Scroll reveal, the compile settle, the
  gate stagger, the pipeline sequence, the deck's transitions. Each one is showing you
  something true. No parallax, no counters ticking up.
- **The home page takes the wheel; nothing else does.** The deck is the one exception to
  the rule this file used to state flatly, and it is deliberate: the home page is a
  walkthrough with an order, and the screens carry that order. Every other route is an
  ordinary scrolling document, and the deck hands the wheel back the moment a screen's
  own content still has somewhere to scroll.
- **Nothing is hidden behind JavaScript.** Scroll-reveal hides sections with CSS and the
  deck stacks ten screens to show one, so a `<noscript>` block in `<head>` puts both
  back — the deck unstacks into an ordinary long page. All ten screens are in the
  exported HTML either way, so a crawler reads the whole argument.
- **`Reveal` re-runs on every route change.** The App Router keeps the layout mounted
  across client-side navigation and swaps only the page, so a mount-only effect observes
  the first page's sections and never the next one's — leaving everything after the hero
  stuck at opacity 0. It keys on `usePathname()`. If you add another layout-level effect
  that touches page content, it needs the same treatment.
- **No fake IDE chrome.** No window dots, no simulated tabs, no typing animation. The
  typography and the colour system are the design.
- **Rules, not shadows.** Hairline borders, flat panels, no gradients.
- **Wide content scrolls inside its own container**, so the page body never scrolls
  sideways. The spec pane wraps because it is prose; the generated pane scrolls because
  breaking a line would misrepresent what the compiler emitted.
- **Prefetch is off** (`src/components/Link.tsx`). Next 16 writes each route's RSC
  payload to `work/__next.work/__PAGE__.txt` under `output: export`, while the router
  prefetches `work/__next.work.__PAGE__.txt` — so every prefetch 404s. Navigation is
  unaffected either way, and five static pages do not need prefetching. If a later Next
  release lines those paths up, delete the wrapper.

## Before launch — TODO

One placeholder left, asserted in `tests/content.test.ts` so it cannot be quietly
forgotten — replace the value and update the test in the same commit.

1. **The inbox.** `site.email` in `src/content/site.ts` is `hello@busychild.com`.

Also worth settling:

- **`site.url`** is `https://busychild.com` and feeds canonical, sitemap and OG URLs.
- **Two missing numbers.** The workforce-scheduling and provider-scheduling entries
  carry architecture but no outcome figure, unlike the other two. With client names
  withheld, the figure does most of the persuading.

## Deploying

A push to `main` publishes the site. Nothing else to run.

`.github/workflows/notify-skravets.yml` asks the [skravets][hub] hub to rebuild;
the hub clones this repo, runs `npm ci && npm run build` with
`NEXT_PUBLIC_BASE_PATH=/busy-child`, and deploys the result to Cloudflare
Workers alongside the other projects. Live at
<https://skravets.skravets.workers.dev/busy-child/>.

That notify step needs the repo secret `SKRAVETS_TOKEN` — a fine-grained token
with **Contents: read and write** on this repo and on the hub. Write is not
optional: `repository_dispatch` rejects a read-only token. When deploys go
quiet, check that the token has not expired before looking anywhere else.

[hub]: https://github.com/tomorrowfriday/skravets

The output is a plain static export, so nothing above is load-bearing —
`npm run build` writes `out/`, and any static host will serve it.
