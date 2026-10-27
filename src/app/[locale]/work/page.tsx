import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer, Masthead } from '@/components/Chrome';
import { Link } from '@/components/Link';
import { Note, Section } from '@/components/Primitives';
import { getContent, isLocale, LOCALES } from '@/content';

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
  return { title: c.workPage.metaTitle, description: c.workPage.metaDescription };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const w = c.workPage;
  const base = `/${locale}`;

  return (
    <>
      <Masthead content={c} locale={locale} current="/work" />
      <main id="main">
        <Section hero marker={w.hero.marker}>
          <h1>{w.hero.title}</h1>
          <p className="sub">{w.hero.lead}</p>
        </Section>

        {c.projects.map((project) => (
          <Section key={project.slug} id={project.slug}>
            <div className="case">
              <div className="case-head">
                <span className="domain">{project.domain}</span>
                <h2>{project.title}</h2>
                <div className="figure">
                  {project.metric.value}
                  <small>{project.metric.caption}</small>
                </div>
              </div>

              <p>{project.context}</p>

              <h3>{w.shippedHeading}</h3>
              <ul className="shipped">
                {project.shipped.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {project.outcome ? <Note tag={w.outcomeTag} text={project.outcome} /> : null}

              <div className="stack">
                {project.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>

              {project.externalUrl ? (
                <div className="cta">
                  <a className="button ghost" href={project.externalUrl}>
                    {project.externalLabel}
                  </a>
                </div>
              ) : null}
            </div>
          </Section>
        ))}

        <Section marker={w.next.marker}>
          <h2>{w.next.title}</h2>
          <p className="lead">{w.next.lead}</p>
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
