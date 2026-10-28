import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Band, PageShell } from '@/components/PageShell';
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

/** One hue per case, in the deck's order, so a project keeps its colour. */
const HUES = ['var(--num)', 'var(--fn)', 'var(--kw)', 'var(--str)', 'var(--com)'] as const;

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const w = c.workPage;
  const total = String(c.projects.length).padStart(2, '0');

  return (
    <PageShell content={c} locale={locale} current="/work">
      <Band head eyebrow={w.hero.marker} title={w.hero.title} lead={w.hero.lead} />

      {c.projects.map((project, index) => (
        <Band key={project.slug} id={project.slug} hue={HUES[index % HUES.length]}>
          <div className="case-band">
            <div className="case-side">
              <span className="case-tagline">
                <span className="muted">
                  {String(index + 1).padStart(2, '0')} / {total}
                </span>
                <span className="chip">{project.domain}</span>
              </span>
              <h2>{project.title}</h2>
              <p className="band-lead">{project.context}</p>

              <div className="case-stack">
                {project.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>

              {project.externalUrl ? (
                <div>
                  <a className="pill hue" href={project.externalUrl}>
                    {project.externalLabel}
                  </a>
                </div>
              ) : null}
            </div>

            <div className="case-side">
              <div
                className="case-metric"
                style={{ '--chars': String(project.metric.value.length) } as React.CSSProperties}
              >
                <b>{project.metric.value}</b>
                <span>{project.metric.caption}</span>
              </div>

              <div className="sheet-block">
                <h3>{w.shippedHeading}</h3>
                <ul className="ticks">
                  {project.shipped.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {project.outcome ? (
                <div className="sheet-outcome">
                  <span className="tag">{w.outcomeTag}</span>
                  <p>{project.outcome}</p>
                </div>
              ) : null}
            </div>
          </div>
        </Band>
      ))}
    </PageShell>
  );
}
