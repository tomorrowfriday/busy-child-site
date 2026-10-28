import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
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
 * The page behind "send a brief", and the deck's last screen, read from the
 * same copy — so the two cannot drift. Everything a visitor needs is above
 * the fold: the address, three lines on what is worth including, nothing else.
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const p = c.contactPage;
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(p.mailSubject)}`;

  return (
    <PageShell content={c} locale={locale}>
      <div className="contact">
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
      </div>
    </PageShell>
  );
}
