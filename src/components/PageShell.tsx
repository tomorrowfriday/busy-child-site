import type { ReactNode } from 'react';
import { Link } from '@/components/Link';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { site } from '@/content';
import type { Content, Locale } from '@/content/schema';

/**
 * Chrome for the pages under the deck.
 *
 * The deck is one screen at a time; these pages scroll. Everything else is
 * the deck's — the same bar at the same height, the same mark, the same
 * pills, and content inset to the same gutter as .screen-inner, so stepping
 * off the deck does not look like stepping onto a different site.
 */
export function PageShell({
  content,
  locale,
  current,
  children,
}: {
  content: Content;
  locale: Locale;
  /** href of this page in content.nav, so its pill reads as the current one. */
  current?: string;
  children: ReactNode;
}) {
  const pages = content.nav.filter((item) => item.href !== '/contact');

  return (
    <>
      <header className="page-top">
        <Link className="top-mark" href={`/${locale}`}>
          {site.wordmark}
          <span className="dot">.</span>
        </Link>

        <nav className="page-nav" aria-label={content.common.more}>
          {pages.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`top-pill${item.href === current ? ' is-on' : ''}`}
              aria-current={item.href === current ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="page-top-right">
          <LocaleSwitch locale={locale} current={current} label={content.common.switchLanguage} />
          <Link className="pill sm" href={`/${locale}/contact`}>
            {content.common.sendBrief}
          </Link>
        </div>
      </header>

      <main id="main" className="page">
        {children}
      </main>
    </>
  );
}

/** A band of content — a screen laid flat, at the deck's gutter. */
export function Band({
  id,
  eyebrow,
  title,
  lead,
  hue,
  children,
  head = false,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  /** The per-section accent the deck uses, e.g. 'var(--kw)'. */
  hue?: string;
  children?: ReactNode;
  /** The opening band: larger type, no rule above. */
  head?: boolean;
}) {
  return (
    <section
      className={`band${head ? ' band-head' : ' reveal'}`}
      id={id}
      style={hue ? ({ '--hue': hue } as React.CSSProperties) : undefined}
    >
      <div className="band-inner">
        {eyebrow ? <span className="eyebrow hue">{eyebrow}</span> : null}
        {title ? head ? <h1>{title}</h1> : <h2>{title}</h2> : null}
        {lead ? <p className={head ? 'page-lede' : 'band-lead'}>{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}
