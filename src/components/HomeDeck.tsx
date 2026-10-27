'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/components/Link';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { compileScenario, renderSpec, tokenize, tokenizeSpec } from '@/lib/compile';
import {
  canGo,
  DARK_SCREEN,
  DURATION_MS,
  FIRST_PROJECT,
  groupOf,
  METHOD_SCREEN,
  progress,
  runState,
  screenStyle,
  SCREEN_COUNT,
  stepCase,
  type Phase,
} from '@/lib/deck';
import { site } from '@/content';
import type { Content, Locale, Project } from '@/content/schema';

/**
 * The home page, as a deck.
 *
 * Ten screens on one stage, advanced by wheel, swipe, arrow keys or the menu.
 * The page itself never scrolls; a screen whose content overflows scrolls
 * inside itself, and the wheel only moves the deck once that inner scroll has
 * bottomed out — otherwise long screens would be impossible to read.
 *
 * All ten screens are in the DOM on first paint, so the export is still one
 * static document a crawler reads end to end. `globals.css` unstacks them
 * under `<noscript>`, which is what a reader without JavaScript gets.
 */

/** Positional, like everywhere else on this site — no locale owns a colour. */
const HUES = [
  'var(--fg)',
  'var(--fg)',
  'var(--num)',
  'var(--fn)',
  'var(--kw)',
  'var(--str)',
  'var(--str)',
  'var(--kw)',
  'var(--str)',
  'var(--num)',
] as const;

const PROJECT_HUES = ['var(--num)', 'var(--fn)', 'var(--kw)', 'var(--str)'] as const;
const RESULT_MARKS = ['↻', '◉', '$', '✓', '⇄', '↗'] as const;
const STEP_HUES = ['var(--kw)', 'var(--fn)', 'var(--num)', 'var(--str)'] as const;

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function HomeDeck({
  content,
  projects,
  locale,
}: {
  content: Content;
  projects: readonly Project[];
  locale: Locale;
}) {
  const t = content.home;
  /** The page's own nav label, so these read in the visitor's language. */
  const navLabel = (href: string) =>
    content.nav.find((item) => item.href === href)?.label ?? href;
  const deck = t.deck;

  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('run');
  const [sheet, setSheet] = useState<'project' | 'method' | null>(null);
  const [caseIndex, setCaseIndex] = useState(0);
  const [scenario, setScenario] = useState(0);
  /* The top bar and the narrow strip are the same markup to React; which one
     is shown is a media query, so there is no width state to hydrate wrong. */

  const busyUntil = useRef(0);
  const wheelHold = useRef(0);
  const touchY = useRef<number | null>(null);
  const cleanup = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const go = useCallback(
    (target: number) => {
      if (!canGo(target, current, sheet !== null)) return;
      const now = Date.now();
      if (now < busyUntil.current) return;

      const ms = prefersReduced() ? 0 : DURATION_MS;
      busyUntil.current = now + ms + 120;

      clearTimeout(cleanup.current);
      setPrevious(current);
      setCurrent(target);
      setPhase('pre');

      // Two frames: one to paint the start position, one to release it.
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('run')));
      cleanup.current = setTimeout(() => setPrevious(null), ms + 80);
    },
    [current, sheet],
  );

  const next = useCallback(() => go(current + 1), [go, current]);
  const back = useCallback(() => go(current - 1), [go, current]);

  useEffect(() => () => clearTimeout(cleanup.current), []);

  const stepCaseBy = useCallback(
    (delta: number) => setCaseIndex((i) => stepCase(i, delta, projects.length)),
    [projects.length],
  );

  /* Keys belong to the sheet while one is up, and to the deck otherwise. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (sheet !== null) {
        if (event.key === 'Escape') setSheet(null);
        if (sheet === 'project' && event.key === 'ArrowRight') stepCaseBy(1);
        if (sheet === 'project' && event.key === 'ArrowLeft') stepCaseBy(-1);
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        next();
      }
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        back();
      }
      if (event.key === 'Home') go(0);
      if (event.key === 'End') go(SCREEN_COUNT - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, next, back, go, stepCaseBy]);

  /** True while something under the pointer still has room to scroll. */
  const innerCanScroll = (target: EventTarget | null, direction: number) => {
    let node = target instanceof Element ? target : null;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      if (node.scrollHeight > node.clientHeight + 2 && /auto|scroll/.test(style.overflowY)) {
        if (
          direction > 0
            ? node.scrollTop + node.clientHeight < node.scrollHeight - 2
            : node.scrollTop > 2
        ) {
          return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  };

  const onWheel = (event: React.WheelEvent) => {
    if (sheet !== null) return;
    if (innerCanScroll(event.target, event.deltaY)) {
      wheelHold.current = Date.now() + 400;
      return;
    }
    if (Date.now() < wheelHold.current) return;
    if (Math.abs(event.deltaY) < 24) return;
    if (event.deltaY > 0) next();
    else back();
  };

  const onTouchStart = (event: React.TouchEvent) => {
    touchY.current = event.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const startedAt = touchY.current;
    touchY.current = null;
    if (startedAt === null || sheet !== null) return;
    const delta = startedAt - (event.changedTouches[0]?.clientY ?? startedAt);
    if (innerCanScroll(event.target, delta)) return;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) next();
    else back();
  };

  const dark = current === DARK_SCREEN;
  const hue = HUES[current] ?? 'var(--fg)';
  const selected = projects[caseIndex];
  const methodLabel = deck.screens[METHOD_SCREEN]?.label ?? '';
  const chosen = content.scenarios[scenario];

  const caseOnScreen = projects[current - FIRST_PROJECT];
  const barLabel =
    current >= FIRST_PROJECT && caseOnScreen
      ? `${caseOnScreen.sector} · ${caseOnScreen.short}`
      : (deck.screens[current]?.label ?? '');

  const styleFor = useMemo(
    () => (index: number) => screenStyle(index, current, previous, phase, prefersReduced()),
    [current, previous, phase],
  );

  /** The top bar shows four entries; the four cases hide behind "our work". */
  const TOP_ENTRIES = [1, 6, 7, 8] as const;

  return (
    <div
      className={`deck${dark ? ' is-dark' : ''}`}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ '--hue': hue } as React.CSSProperties}
    >
      {/* ── the bar across the top, and the strip that replaces it on a phone ── */}
      <header className="deck-top">
        <button type="button" className="top-mark" onClick={() => go(0)}>
          {site.wordmark}
          <span className="dot">.</span>
        </button>

        <nav className="top-nav" aria-label={deck.menuLabel}>
          {TOP_ENTRIES.map((index) => (
            <div className="top-group" key={index}>
              <button
                type="button"
                className={`top-pill${groupOf(current) === index ? ' is-on' : ''}`}
                aria-current={groupOf(current) === index ? 'true' : undefined}
                onClick={() => go(index)}
              >
                {deck.screens[index]?.label}
              </button>
              {index === 1 ? (
                <span className="top-chips">
                  {projects.map((project, i) => (
                    <button
                      key={project.slug}
                      type="button"
                      className={current === FIRST_PROJECT + i ? 'is-on' : undefined}
                      style={{ '--hue': PROJECT_HUES[i] } as React.CSSProperties}
                      onClick={() => go(FIRST_PROJECT + i)}
                      aria-label={project.short}
                      title={project.short}
                    >
                      {i + 1}
                    </button>
                  ))}
                </span>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="top-right">
          <LocaleSwitch locale={locale} label={content.common.switchLanguage} />
          <Link className="pill sm" href={`/${locale}/contact`}>
            {content.common.sendBrief}
          </Link>
        </div>

        <div className="top-progress" style={{ width: progress(current) }} />
      </header>

      <aside className="deck-strip">
        <div className="strip-top">
          <button type="button" className="top-mark" onClick={() => go(0)}>
            {site.wordmark}
            <span className="dot">.</span>
          </button>
          <span className="strip-run">{runState(current)}</span>
        </div>
        <div className="strip-here">
          <span className="strip-dot" />
          <span>{deck.screens[current]?.label}</span>
          <LocaleSwitch locale={locale} label={content.common.switchLanguage} />
        </div>
      </aside>

      {/* ── the stage ──────────────────────────────────────────────────────── */}
      <div className="stage">
        <Screen index={0} label={deck.screens[0]?.label} style={styleFor(0)}>
          <span className="eyebrow">{content.site.tagline}</span>
          <h1 className="deck-mark">
            {site.wordmark}
            <span className="dot">.</span>
          </h1>
          <p className="deck-lede">{t.headline}</p>
          <div className="deck-cta">
            <button type="button" className="pill" onClick={() => go(1)}>
              {content.common.seeWork}
            </button>
            <Link className="pill ghost" href={`/${locale}/contact`}>
              {content.common.sendBrief}
            </Link>
          </div>
          <div className="deck-stats">
            {content.literals.map((literal, index) => (
              <div key={literal.value} style={{ '--hue': STAT_HUES[index] } as React.CSSProperties}>
                <b>{literal.value}</b>
                <span>{literal.caption}</span>
              </div>
            ))}
          </div>
        </Screen>

        <Screen index={1} label={deck.screens[1]?.label} style={styleFor(1)}>
          <div className="screen-head">
            <h2>{t.work.title}</h2>
          </div>
          <div className="work-list">
            {projects.map((project, index) => (
              <button
                key={project.slug}
                type="button"
                className="work-row"
                style={{ '--hue': PROJECT_HUES[index] } as React.CSSProperties}
                onClick={() => go(FIRST_PROJECT + index)}
              >
                <span className="work-n">{String(index + 1).padStart(2, '0')}</span>
                <span className="work-name">
                  <span className="work-sector">{project.sector}</span>
                  <span className="work-short">{project.short}</span>
                </span>
                <span className="work-metric">
                  <b>{project.metric.value}</b>
                  <span aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </div>
          <div>
            <Link className="pill ghost" href={`/${locale}/work`}>
              {navLabel('/work')} →
            </Link>
          </div>
        </Screen>

        {projects.map((project, index) => (
          <Screen
            key={project.slug}
            index={FIRST_PROJECT + index}
            label={project.short}
            style={styleFor(FIRST_PROJECT + index)}
            hue={PROJECT_HUES[index]}
            wash
          >
            <div className="deck-case">
              <div className="case-copy">
                <span className="case-tag">
                  <span className="muted">
                    {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                  </span>
                  <span className="chip">{project.sector}</span>
                </span>
                <h2>{project.short}</h2>
                <p className="case-line">{project.oneLiner}</p>
                <div className="case-stack">
                  {project.stack.slice(0, 5).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <div>
                  <button
                    type="button"
                    className="pill hue"
                    aria-haspopup="dialog"
                    onClick={() => {
                      setCaseIndex(index);
                      setSheet('project');
                    }}
                  >
                    {deck.openCase}
                  </button>
                </div>
              </div>
              <div
                className="case-metric"
                style={{ '--chars': String(project.metricBig.length) } as React.CSSProperties}
              >
                <b>{project.metricBig}</b>
                <span>{project.metricShort}</span>
              </div>
            </div>
          </Screen>
        ))}

        <Screen index={6} label={deck.screens[6]?.label} style={styleFor(6)}>
          <div className="screen-stack">
            <h2>{t.results.title}</h2>
            <p className="muted">{t.results.lead}</p>
          </div>
          <div className="results">
            {t.results.items.map((item, index) => (
              <div className="result" key={item.title}>
                <span className="mark" aria-hidden="true">
                  {RESULT_MARKS[index]}
                </span>
                <span className="result-body">
                  <b>{item.title}</b>
                  <span>{item.detail}</span>
                </span>
              </div>
            ))}
          </div>
          <div>
            <Link className="pill ghost" href={`/${locale}/what-you-get`}>
              {navLabel('/what-you-get')} →
            </Link>
          </div>
        </Screen>

        <Screen index={7} label={deck.screens[7]?.label} style={styleFor(7)}>
          <div className="screen-stack">
            <h2>{t.proof.title}</h2>
            <p className="muted">{t.proof.lead}</p>
          </div>
          <div className="method-steps">
            {t.proof.steps.map((step, index) => (
              <div
                className="method-step"
                key={step.title}
                style={{ '--hue': STEP_HUES[index] } as React.CSSProperties}
              >
                <b className="step-n">{String(index + 1).padStart(2, '0')}</b>
                <span className="step-t">{step.title}</span>
                <span className="step-p">{step.detail}</span>
              </div>
            ))}
          </div>
          <div>
            <button
              type="button"
              className="pill"
              aria-haspopup="dialog"
              onClick={() => setSheet('method')}
            >
              {deck.seeExample}
            </button>
          </div>
        </Screen>

        <Screen index={8} label={deck.screens[8]?.label} style={styleFor(8)}>
          <div className="screen-head">
            <h2>{t.working.title}</h2>
          </div>
          <div className="promises">
            {t.working.items.map((item) => (
              <div className="promise" key={item}>
                <span aria-hidden="true">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div>
            <Link className="pill ghost" href={`/${locale}/working-with-us`}>
              {navLabel('/working-with-us')} →
            </Link>
          </div>
        </Screen>

        <Screen index={9} label={deck.screens[9]?.label} style={styleFor(9)} invert>
          <h2 className="closing-title">{t.closing.title}</h2>
          <p className="closing-lede">{t.closing.lead}</p>
          <div className="deck-cta">
            <Link className="pill invert" href={`/${locale}/contact`}>
              {content.common.sendBrief} →
            </Link>
            <a className="pill ghost-invert" href={site.upwork}>
              {content.common.upworkAlt}
            </a>
          </div>
          <nav className="closing-more" aria-label={content.common.more}>
            {content.nav
              .filter((item) => item.href !== '/contact')
              .map((item) => (
                <Link key={item.href} href={`/${locale}${item.href}`}>
                  {item.label}
                </Link>
              ))}
          </nav>
          <div className="closing-foot">
            <LocaleSwitch locale={locale} label={content.common.switchLanguage} />
            <span>© {site.name}</span>
          </div>
        </Screen>
      </div>

      {/* ── the sheets ─────────────────────────────────────────────────────── */}
      {sheet !== null ? (
        <div className="sheet-layer">
          <button
            type="button"
            className="sheet-scrim"
            aria-label={t.sheet.close}
            onClick={() => setSheet(null)}
          />
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={sheet === 'project' ? selected?.short : methodLabel}
            style={
              {
                '--hue': sheet === 'project' ? PROJECT_HUES[caseIndex] : 'var(--kw)',
              } as React.CSSProperties
            }
          >
            <div className="sheet-bar">
              <span className="sheet-count">
                {sheet === 'project'
                  ? `${deck.caseLabel} ${String(caseIndex + 1).padStart(2, '0')} ${t.sheet.of} ${String(projects.length).padStart(2, '0')}`
                  : methodLabel}
              </span>
              {sheet === 'project' ? (
                <>
                  <button type="button" onClick={() => stepCaseBy(-1)} aria-label={t.sheet.prev}>
                    ←
                  </button>
                  <button type="button" onClick={() => stepCaseBy(1)} aria-label={t.sheet.next}>
                    →
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => setSheet(null)} aria-label={t.sheet.close}>
                ✕
              </button>
            </div>

            <div className="sheet-body">
              {sheet === 'project' && selected ? (
                <>
                  <div className="sheet-lede">
                    <span className="sheet-domain">{selected.domain}</span>
                    <h3>{selected.title}</h3>
                  </div>
                  <p className="sheet-desc">{selected.context}</p>
                  {selected.outcome ? (
                    <div className="sheet-outcome">
                      <span className="tag">{t.sheet.outcome}</span>
                      <p>{selected.outcome}</p>
                    </div>
                  ) : null}
                  <div className="sheet-block">
                    <h4>{t.sheet.shipped}</h4>
                    <ul className="ticks">
                      {selected.shipped.map((line) => (
                        <li key={line}>
                          <span aria-hidden="true">✓</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="sheet-block">
                    <h4>{t.sheet.builtWith}</h4>
                    <div className="chips">
                      {selected.stack.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  </div>
                  <Link className="pill" href={`/${locale}/contact`}>
                    {t.sheet.cta}
                  </Link>
                </>
              ) : (
                <>
                  <div className="sheet-lede">
                    <span className="sheet-kicker">{deck.methodKicker}</span>
                    <h3>{deck.methodTitle}</h3>
                    <p className="sheet-desc">{deck.methodLead}</p>
                  </div>

                  <div className="scenario-chips">
                    {content.scenarios.map((item, index) => (
                      <button
                        key={item.index}
                        type="button"
                        className={index === scenario ? 'is-on' : undefined}
                        onClick={() => setScenario(index)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {chosen ? (
                    <>
                      <CodePane
                        label={deck.specLabel}
                        tone="spec"
                        source={renderSpec(chosen)}
                        wrap
                      />
                      <CodePane
                        label={deck.testLabel}
                        tone="test"
                        source={compileScenario(chosen)}
                      />
                      <p className="proves">
                        <b>{t.editor.proves}: </b>
                        {chosen.proves}
                      </p>
                    </>
                  ) : null}

                  <div className="sheet-block ruled">
                    <span className="sheet-kicker num">{deck.gatesKicker}</span>
                    {content.gates.map((gate, index) => (
                      <div className="gate-row" key={gate.gate}>
                        <span className="gate-n">{String(index + 1).padStart(2, '0')}</span>
                        <span className="gate-body">
                          <b>{gate.gate}</b>
                          <span>{gate.catches}</span>
                        </span>
                      </div>
                    ))}
                    <p className="sheet-desc">{t.proof.gatesNote}</p>
                  </div>

                  <div className="sheet-block ruled">
                    <span className="sheet-kicker str">{deck.stepFourKicker}</span>
                    <p className="sheet-desc">{t.proof.ship[1]?.detail}</p>
                  </div>

                  <Link className="pill" href={`/${locale}/contact`}>
                    {t.sheet.cta}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── where you are, and the two nudges ──────────────────────────────── */}
      <div className="deck-bar">
        <span className="bar-label">{barLabel}</span>
        <div className="bar-right">
          <span className="bar-count">
            <b>{String(current + 1).padStart(2, '0')}</b> / {SCREEN_COUNT}
          </span>
          <button type="button" onClick={back} aria-label={deck.prev} disabled={current === 0}>
            ↑
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={deck.next}
            disabled={current === SCREEN_COUNT - 1}
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
}

const STAT_HUES = ['var(--kw)', 'var(--num)', 'var(--str)', 'var(--fn)'] as const;

function Screen({
  index,
  label,
  style,
  children,
  hue,
  wash = false,
  invert = false,
}: {
  index: number;
  label?: string;
  style: React.CSSProperties;
  children: React.ReactNode;
  hue?: string;
  wash?: boolean;
  invert?: boolean;
}) {
  return (
    <section
      className={`screen${invert ? ' is-invert' : ''}`}
      aria-label={label}
      data-screen={index}
      style={hue ? ({ ...style, '--hue': hue } as React.CSSProperties) : style}
    >
      {wash ? <span className="screen-wash" aria-hidden="true" /> : null}
      <div className="screen-inner">{children}</div>
    </section>
  );
}

/**
 * One pane of the method sheet: a labelled block of numbered, highlighted
 * lines. The spec is Markdown and the test is TypeScript, so each gets its own
 * tokeniser — both from `src/lib/compile.ts`, the same module the build uses.
 */
function CodePane({
  label,
  tone,
  source,
  wrap = false,
}: {
  label: string;
  tone: 'spec' | 'test';
  source: string;
  wrap?: boolean;
}) {
  const read = tone === 'spec' ? tokenizeSpec : tokenize;

  return (
    <div className={`code-pane is-${tone}`}>
      <div className="code-label">{label}</div>
      <div className={`code-lines${wrap ? ' is-wrap' : ''}`}>
        {source.split('\n').map((line, index) => (
          <div className="code-line" key={index}>
            <span className="code-n">{index + 1}</span>
            <span className="code-src">
              {read(line).map((token, i) =>
                token.kind === 'plain' ? (
                  <span key={i}>{token.text}</span>
                ) : (
                  <span key={i} className={`tok-${token.kind}`}>
                    {token.text}
                  </span>
                ),
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
