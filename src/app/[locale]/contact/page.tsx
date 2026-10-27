import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/components/Link';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { getContent, isLocale, site, LOCALES } from '@/content';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = getContent(locale);
  return { title: c.contactPage.metaTitle, description: c.contactPage.metaDescription };
}

/**
 * The only page the deck links out to.
 *
 * It is built as one more screen rather than a document: the deck's closing
 * screen is a full-bleed colour, and arriving here should feel like stepping
 * through it, not leaving for an older site. Everything a visitor needs is
 * above the fold — the address, three lines on what to include, and the way
 * back.
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const p = c.contactPage;
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(p.mailSubject)}`;

  return (
    <main id="main" className="contact">
      <div className="contact-inner">
        <header className="contact-top">
          <Link className="top-mark" href={`/${locale}`}>
            {site.wordmark}
            <span className="dot">.</span>
          </Link>
          <LocaleSwitch locale={locale} current="/contact" label={c.common.switchLanguage} />
        </header>

        <div className="contact-body">
          <span className="eyebrow">{p.hero.marker}</span>
          <h1 className="closing-title">{p.hero.title}</h1>
          <p className="closing-lede">{p.hero.lead}</p>

          <div className="deck-cta">
            <a className="pill invert" href={mailto}>
              {site.email}
            </a>
            <a className="pill ghost-invert" href={site.upwork}>
              {c.common.upworkAlt}
            </a>
          </div>

          <div className="contact-include">
            <h2>{p.includeLabel}</h2>
            <ul>
              {p.include.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="contact-foot">
          <Link href={`/${locale}`}>← {p.back}</Link>
          <span>© {site.name}</span>
        </footer>
      </div>
    </main>
  );
}
