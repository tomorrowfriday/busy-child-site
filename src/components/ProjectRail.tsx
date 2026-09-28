'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/components/Link';
import type { Content, Locale, Project } from '@/content/schema';

/**
 * The work rail, and the sheet behind it.
 *
 * Four cards on one row; below 720px the row becomes a horizontal scroller
 * rather than a stack, so the set still reads as a set. Choosing a card opens a
 * sheet with the detail that does not fit on it.
 *
 * The hue is positional, not content: a project's colour is its place in the
 * rail, so translators never have to think about it and no locale can disagree
 * about what colour insurance is.
 */
const HUES = ['var(--num)', 'var(--fn)', 'var(--kw)', 'var(--str)'] as const;

const hueFor = (index: number) => HUES[index % HUES.length] as string;

export function ProjectRail({
  projects,
  t,
  sheet,
  locale,
}: {
  projects: readonly Project[];
  t: Content['home']['rail'];
  sheet: Content['home']['sheet'];
  locale: Locale;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const closeButton = useRef<HTMLButtonElement | null>(null);

  const move = useCallback(
    (delta: number) =>
      setOpen((current) =>
        current === null ? current : (current + delta + projects.length) % projects.length,
      ),
    [projects.length],
  );

  const close = useCallback(() => {
    setOpen((current) => {
      if (current !== null) cards.current[current]?.focus();
      return null;
    });
  }, []);

  /* Escape and the arrow keys belong to the sheet while it is up. */
  useEffect(() => {
    if (open === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, move]);

  /* The page must not scroll behind the sheet. */
  useEffect(() => {
    if (open === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const selected = open === null ? null : projects[open];

  return (
    <>
      <div className="rail-head">
        <h2>{t.title}</h2>
        <span className="rail-hint">
          <span className="on-wide">{t.hintWide}</span>
          <span className="on-narrow">{t.hintNarrow}</span>
        </span>
      </div>

      <div className="rail">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            className="card"
            style={{ '--hue': hueFor(index) } as React.CSSProperties}
            aria-haspopup="dialog"
            onClick={() => setOpen(index)}
            ref={(node) => {
              cards.current[index] = node;
            }}
          >
            <span className="card-top">
              <span className="chip">{project.sector}</span>
              <span className="idx">{String(index + 1).padStart(2, '0')}</span>
            </span>
            <span className="card-metric">
              <b>{project.metric.value}</b>
              <span>{project.metricShort}</span>
            </span>
            <span className="card-title">{project.short}</span>
            <span className="card-line">{project.oneLiner}</span>
            <span className="card-more">{t.details}</span>
          </button>
        ))}
      </div>

      {selected && open !== null ? (
        <div className="sheet-layer">
          <div className="sheet-scrim" onClick={close} />
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={selected.short}
            style={{ '--hue': hueFor(open) } as React.CSSProperties}
          >
            <div className="sheet-bar">
              <span className="sheet-count">
                <b>{String(open + 1).padStart(2, '0')}</b> {sheet.of} {projects.length}
              </span>
              <button type="button" onClick={() => move(-1)} aria-label={sheet.prev}>
                ←
              </button>
              <button type="button" onClick={() => move(1)} aria-label={sheet.next}>
                →
              </button>
              <button type="button" onClick={close} aria-label={sheet.close} ref={closeButton}>
                ✕
              </button>
            </div>

            <div className="sheet-body">
              <div className="sheet-lede">
                <span className="sheet-domain">{selected.domain}</span>
                <h3>{selected.title}</h3>
              </div>

              <div className="facts">
                {selected.facts.map((fact) => (
                  <div className="fact" key={fact.k}>
                    <span className="fact-k">{fact.k}</span>
                    <span className="fact-v">{fact.v}</span>
                  </div>
                ))}
              </div>

              <p className="sheet-desc">{selected.context}</p>

              {selected.outcome ? (
                <div className="sheet-outcome">
                  <span className="tag">{sheet.outcome}</span>
                  <p>{selected.outcome}</p>
                </div>
              ) : null}

              <div className="sheet-block">
                <h4>{sheet.shipped}</h4>
                <ul className="ticks">
                  {selected.shipped.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sheet-block">
                <h4>{sheet.builtWith}</h4>
                <div className="chips">
                  {selected.stack.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </div>

              {selected.externalUrl ? (
                <a className="button" href={selected.externalUrl}>
                  {selected.externalLabel}
                </a>
              ) : (
                <Link className="button" href={`/${locale}/contact`}>
                  {sheet.cta}
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
