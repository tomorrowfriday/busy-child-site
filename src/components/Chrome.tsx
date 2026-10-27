import { Link } from '@/components/Link';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { site } from '@/content';
import type { Content, Locale } from '@/content/schema';

export function Masthead({
  content,
  locale,
  current,
}: {
  content: Content;
  locale: Locale;
  current?: string;
}) {
  return (
    <header className="masthead">
      <div className="wrap">
        <Link className="wordmark" href={`/${locale}`}>
          {site.wordmark}
        </Link>
        <div className="mast-right">
          <nav className="nav" aria-label="Primary">
            {content.nav.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                aria-current={current === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <LocaleSwitch locale={locale} current={current} label={content.common.switchLanguage} />
        </div>
      </div>
    </header>
  );
}

export function Footer({ content, locale }: { content: Content; locale: Locale }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="col">
          <Link className="wordmark" href={`/${locale}`}>
            {site.wordmark}
          </Link>
          <span className="meta">{content.site.tagline}</span>
        </div>
        <div className="col">
          {content.nav.map((item) => (
            <Link key={item.href} href={`/${locale}${item.href}`}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="col">
          <a href={site.upwork}>{content.common.upwork}</a>
        </div>
      </div>
    </footer>
  );
}
