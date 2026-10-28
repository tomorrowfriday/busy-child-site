import type { ReactNode } from 'react';
import { Link } from '@/components/Link';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { site } from '@/content';
import type { Content, Locale } from '@/content/schema';

/**
 * Chrome for /contact, the only page beside the deck.
 *
 * Everything else the site has to say is a deck screen, so this bar carries
 * no navigation — just the way back and the language. It keeps the deck's
 * bar exactly: same height, same gutter, same mark.
 */
export function PageShell({
  content,
  locale,
  children,
}: {
  content: Content;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <>
      <header className="page-top">
        <Link className="top-mark" href={`/${locale}`}>
          {site.wordmark}
          <span className="dot">.</span>
        </Link>
        <div className="page-top-right">
          <LocaleSwitch locale={locale} current="/contact" label={content.common.switchLanguage} />
        </div>
      </header>

      <main id="main" className="page">
        {children}
      </main>
    </>
  );
}
