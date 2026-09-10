import { GateRunner } from '@/components/GateRunner';
import { SpecEditor } from '@/components/SpecEditor';
import { Footer, Masthead } from '@/components/Chrome';
import { Link } from '@/components/Link';
import { Literals, Note, Outcomes, Section } from '@/components/Primitives';
import { clientProjects, getContent, isLocale, site, LOCALES } from '@/content';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const home = c.home;
  const base = `/${locale}`;

  return (
    <>
      <Masthead content={c} locale={locale} />
      <main id="main">
        {/* 01 · statement */}
        <Section hero>
          <div className="sectors">
            {c.site.sectors.map((sector) => (
              <span key={sector}>{sector}</span>
            ))}
          </div>
          <h1>{c.site.statement}</h1>
          <p className="sub">{c.site.description}</p>
          <div className="cta">
            <Link className="button" href={`${base}/contact`}>
              {c.common.sendBrief}
            </Link>
            <Link className="button ghost" href={`${base}/work`}>
              {c.common.seeWork}
            </Link>
          </div>
        </Section>

        {/* 02 · four literals */}
        <Section>
          <Literals items={c.literals} />
        </Section>

        {/* 03 · what you get — business outcomes, before any technical proof */}
        <Section id="what-you-get" marker={home.outcomes.marker}>
          <h2>{home.outcomes.title}</h2>
          <p className="lead">{home.outcomes.lead}</p>
          <Outcomes items={home.outcomes.items} />
          {home.outcomes.note ? (
            <Note tag={home.outcomes.note.tag} text={home.outcomes.note.text} />
          ) : null}
          <p>
            <Link href={`${base}/work`}>{home.outcomes.link}</Link>
          </p>
        </Section>

        {/* 04 · the specimen, running */}
        <Section marker={home.specimen.marker}>
          <h2>{home.specimen.title}</h2>
          <p className="lead">{home.specimen.lead}</p>
          <SpecEditor scenarios={c.scenarios} t={home.editor} />
          <p className="caption">{home.specimen.caption}</p>
          <p>
            <Link href={`${base}/method`}>{home.specimen.link}</Link>
          </p>
        </Section>

        {/* 05 · four platforms */}
        <Section marker={home.work.marker}>
          <h2>{home.work.title}</h2>
          <p>{home.work.lead}</p>
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
                <div className="stack">
                  {project.stack.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p>
            <Link href={`${base}/work`}>{home.work.link}</Link>
          </p>
        </Section>

        {/* 06 · the gates */}
        <Section marker={home.gates.marker}>
          <h2>{home.gates.title}</h2>
          <p className="lead">{home.gates.lead}</p>
          <GateRunner gates={c.gates} t={home.runner} />
          <p className="caption">{home.gates.caption}</p>
        </Section>

        {/* 07 · six refusals */}
        <Section marker={home.promises.marker}>
          <h2>{home.promises.title}</h2>
          <div className="refusals">
            {c.promises.map((promise) => (
              <div className="refusal" key={promise.refusal}>
                <h3>{promise.refusal}</h3>
                <p>{promise.detail}</p>
              </div>
            ))}
          </div>
          <p>
            <Link href={`${base}/working-with-us`}>{home.promises.link}</Link>
          </p>
        </Section>

        {/* 08 · send a brief */}
        <Section marker={home.contact.marker}>
          <h2>{home.contact.title}</h2>
          <p className="lead">{home.contact.lead}</p>
          <div className="cta">
            <Link className="button" href={`${base}/contact`}>
              {c.common.sendBrief}
            </Link>
            <a className="button ghost" href={site.upwork}>
              {c.common.upworkAlt}
            </a>
          </div>
        </Section>
      </main>
      <Footer content={c} locale={locale} />
    </>
  );
}
