# Busy Child — website

Static site. No build step, no dependencies, no framework. Five HTML pages and one
stylesheet. Open `index.html` in a browser and it works.

## Run it locally

```bash
python -m http.server 4321 --directory busy-child-site
```

Then visit <http://localhost:4321>.

## Files

```
busy-child-site/
├── index.html             home — the whole pitch in one scroll
├── work.html              four platforms + Mines
├── method.html            DOS: spec → compiler → gates
├── working-with-us.html   six refusals, engagement, quality bar
├── contact.html           send a brief
└── css/site.css           the entire design system
```

## Before launch — TODO

These are the only things standing between this and being live. Each is marked
with a `TODO` comment in the source.

1. **Set the real inbox.** `contact.html` uses a placeholder `hello@busychild.com`
   in two places. Search for `TODO` and replace both.
2. **Add the App Store URL for Mines.** `work.html`, in the `#mines` section, links
   to `https://apps.apple.com/` as a placeholder. Mines is the only thing on the site
   a stranger can verify by clicking, so this link matters more than it looks.
3. **Confirm the Upwork URL.** Every page footer links to
   `https://www.upwork.com/agencies/busy-child/`, taken from the portfolio PDF.
   Verify it resolves.
4. **Decide on the two missing numbers.** The workforce-scheduling and provider-scheduling
   entries carry architecture but no outcome figure, unlike the other two. In an
   anonymised portfolio the figure does most of the persuading. If you can publish
   anything — hours saved, fill-rate, shifts processed, users — add it to the
   `.figure` block in `work.html` and the `.metric` block in `index.html`.
5. **Pick the domain** and update the canonical URLs if you add any.

## Deploying

It is static, so anything serves it. Free tiers that work with zero config:

- **Cloudflare Pages** — connect the repo, set the output directory to `busy-child-site`.
- **Netlify** — drag the folder onto the dashboard, or connect the repo.
- **GitHub Pages** — push and enable Pages on the branch.

Hosts generally serve `work.html` at `/work` automatically. Links are written with
the `.html` extension so the site also works when opened straight off disk. If you
want extensionless URLs everywhere, add redirects in your host config and update the
`href`s in the five files.

## The design system

Everything lives in `css/site.css`. It is a syntax scheme: each colour carries the
same meaning it carries in code, and nothing is coloured decoratively.

| Token | Role |
|---|---|
| `--bg` | listing paper — deliberately not white |
| `--panel` | raised block: code, tables, cards |
| `--fg` `--fg-dim` `--fg-faint` | ink, body prose, metadata |
| `--kw` | keyword → structure, section markers |
| `--str` | string → settled, verified, shipped |
| `--num` | literal → **every metric on the site** |
| `--fn` | function → links and navigation |
| `--com` | comment → asides and annotation |

Light and dark are both defined. Light is the bare `:root` block; dark is defined
twice — once under `prefers-color-scheme` and once under `[data-theme="dark"]` — so
an explicit choice can win over the OS setting if you ever add a toggle.

**Type.** Two monospaces doing different jobs: Martian Mono for display (wide and
heavy — good at 28px and up, unreadable as body text), JetBrains Mono for everything
else. Both free from Google Fonts. Real fallback stacks are declared, so the page
degrades to the system mono rather than to a serif.

### Rules worth keeping

- **List markers are positioned, not grid cells.** A list item containing `<strong>`
  or a link would otherwise scatter its children across separate grid rows. This was
  a real bug; don't reintroduce it.
- **Rules, not shadows.** Hairline borders and flat panels. No drop shadows, no
  gradients, no rounded corners beyond 2–3px.
- **Motion budget is one moment** — the compiled test arriving after the spec on the
  homepage. It respects `prefers-reduced-motion` and degrades to showing instantly
  without JavaScript. Nothing else on the site animates.
- **No fake IDE chrome.** No window dots, no simulated tabs, no typing animation.
  The typography and the colour system are the design.
- **Wide content scrolls inside its own container.** Code blocks, tables and diagrams
  each have `overflow-x:auto`, so the page body never scrolls sideways.

## Content notes

Client names are withheld throughout. Each project is published as domain + scale +
architecture + number, following the pattern already used in the portfolio PDF for
the NDA'd client. **The PDF names three clients that this site does not** — decide
whether the PDF gets realigned or stays as the version you send privately once
someone is already in conversation.

Mines is the exception: it is your own product, not a client's, so it keeps its name.
