import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer, Masthead } from '@/components/Chrome';
import { Bullets, Note, Section, Steps } from '@/components/Primitives';
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

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const p = c.contactPage;
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(p.mailSubject)}`;

  return (
    <>
      <Masthead content={c} locale={locale} current="/contact" />
      <main id="main">
        <Section hero marker={p.hero.marker}>
          <h1>{p.hero.title}</h1>
          <p className="sub">{p.hero.lead}</p>
          <div className="cta">
            <a className="button" href={mailto}>
              {site.email}
            </a>
            <a className="button ghost" href={site.upwork}>
              {c.common.upworkAlt}
            </a>
          </div>
        </Section>

        <Section marker={p.brief.marker}>
          <h2>{p.brief.title}</h2>
          <p className="lead">{p.brief.lead}</p>
          <Steps items={p.briefItems} />
          {p.brief.note ? <Note tag={p.brief.note.tag} text={p.brief.note.text} /> : null}
        </Section>

        <Section marker={p.answers.marker}>
          <h2>{p.answers.title}</h2>
          {p.answers.bullets ? <Bullets items={p.answers.bullets} /> : null}
          <div className="cta">
            <a className="button" href={mailto}>
              {c.common.sendBrief}
            </a>
          </div>
        </Section>
      </main>
      <Footer content={c} locale={locale} />
    </>
  );
}
