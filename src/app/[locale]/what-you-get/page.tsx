import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer, Masthead } from '@/components/Chrome';
import { Link } from '@/components/Link';
import { Note, Outcomes, Section } from '@/components/Primitives';
import { clientProjects, getContent, isLocale, LOCALES } from '@/content';

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
  return { title: c.home.outcomes.marker, description: c.home.outcomes.lead };
}

/**
 * The same outcomes as the homepage section, given their own page and URL so a
 * non-technical reader can be sent straight here without scrolling past a
 * compiler demo first.
 */
export default async function WhatYouGetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const o = c.home.outcomes;
  const base = `/${locale}`;

  return (
    <>
      <Masthead content={c} locale={locale} current="/what-you-get" />
      <main id="main">
        <Section hero marker={o.marker}>
          <h1>{o.title}</h1>
          <p className="sub">{o.lead}</p>
        </Section>

        <Section>
          <Outcomes items={o.items} />
          {o.note ? <Note tag={o.note.tag} text={o.note.text} /> : null}
        </Section>

        <Section marker={c.home.work.marker}>
          <h2>{c.home.work.title}</h2>
          <p>{c.home.work.lead}</p>
          <div className="projects">
            {clientProjects(c).map((project) => (
              <article className="project" key={project.slug}>
                <span className="domain">{project.domain}</span>
                <h3>{project.title}</h3>
                <div className="metric">
                  {project.metric.value}
                  <small>{project.metric.caption}</small>
                </div>
                <p>{project.summary}</p>
              </article>
            ))}
          </div>
          <p>
            <Link href={`${base}/work`}>{c.home.work.link}</Link>
          </p>
        </Section>

        <Section marker={c.home.contact.marker}>
          <h2>{c.home.contact.title}</h2>
          <p className="lead">{c.home.contact.lead}</p>
          <div className="cta">
            <Link className="button" href={`${base}/contact`}>
              {c.common.sendBrief}
            </Link>
          </div>
        </Section>
      </main>
      <Footer content={c} locale={locale} />
    </>
  );
}
