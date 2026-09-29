import { GateRunner } from '@/components/GateRunner';
import { SpecEditor } from '@/components/SpecEditor';
import { Footer, Masthead } from '@/components/Chrome';
import { Fold, Folds } from '@/components/Fold';
import { Link } from '@/components/Link';
import { Literals, Note, Section } from '@/components/Primitives';
import { clientProjects, getContent, isLocale, site, LOCALES } from '@/content';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * The home page is the whole argument, folded.
 *
 * Every claim the site makes is one readable line, and the evidence for it is
 * one click down rather than several screens away — the same shape as the
 * specification this team sells. The first row of each cascade is open, so
 * the pattern explains itself and the page never reads as a list of teasers.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const home = c.home;
  const base = `/${locale}`;

  return (
    <>
      <header className="home-head">
        <div className="home-bar">
          <nav className="anchors" aria-label="Sections">
            {home.anchors.map((anchor) => (
              <a key={anchor.href} href={anchor.href}>
                {anchor.label}
              </a>
            ))}
          </nav>
          <LocaleSwitch locale={locale} label={c.common.switchLanguage} />
        </div>

        <Link className="home-mark" href={base}>
          {site.wordmark}
          <span className="dot">.</span>
        </Link>

        <div className="home-lede">
          <p>{home.headline}</p>
          <div className="cta">
            <Link className="button" href={`${base}/contact`}>
              {c.common.sendBrief}
            </Link>
            <a className="button ghost" href="#work">
              {c.common.seeWork}
            </a>
          </div>
        </div>

        {/* 02 · four literals — the whole picture in numbers */}
        <Section>
          <Literals items={c.literals} />
        </Section>

        {/* 03 · what you get — business outcomes, before any technical proof */}
        <Section id="what-you-get" marker={home.outcomes.marker}>
          <h2>{home.outcomes.title}</h2>
          <p className="lead">{home.outcomes.lead}</p>
          <p className="fold-lede">{c.common.foldHint}</p>
          <Folds>
            {home.outcomes.items.map((item, index) => (
              <Fold
                key={item.title}
                group="outcomes"
                claim={item.title}
                figure={item.proof}
                figureCaption={item.proofCaption}
                open={index === 0}
              >
                <p>{item.detail}</p>
              </Fold>
            ))}
          </Folds>
          {home.outcomes.note ? (
            <Note tag={home.outcomes.note.tag} text={home.outcomes.note.text} />
          ) : null}
          <p>
            <Link href={`${base}/work`}>{home.outcomes.link}</Link>
          </p>
        </Section>

        {/* 04 · the work — domain, claim and number on the surface */}
        <Section marker={home.work.marker}>
          <h2>{home.work.title}</h2>
          <p>{home.work.lead}</p>
          <Folds>
            {clientProjects(c).map((project, index) => (
              <Fold
                key={project.slug}
                group="work"
                eyebrow={project.domain}
                claim={project.title}
                figure={project.metric.value}
                figureCaption={project.metric.caption}
                open={index === 0}
              >
                <p>{project.context}</p>
                <div>
                  <h4>{c.workPage.shippedHeading}</h4>
                  <ul className="shipped">
                    {project.shipped.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                {project.outcome ? (
                  <Note tag={c.workPage.outcomeTag} text={project.outcome} />
                ) : null}
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
              </Fold>
            ))}
          </Folds>
          <p>
            <Link href={`${base}/work`}>{home.work.link}</Link>
          </p>
        </Section>

        {/* 05 · the specimen, running — heavy, so it stays folded until asked for */}
        <Section marker={home.specimen.marker}>
          <Folds>
            <Fold
              group="proof-spec"
              claim={home.specimen.title}
              badge={c.common.liveBadge}
              heading
            >
              <p>{home.specimen.lead}</p>
              <SpecEditor scenarios={c.scenarios} t={home.editor} />
              <p className="caption">{home.specimen.caption}</p>
              <p>
                <Link href={`${base}/method`}>{home.specimen.link}</Link>
              </p>
            </Fold>
          </Folds>
        </Section>

        {/* 06 · the gates */}
        <Section marker={home.gates.marker}>
          <Folds>
            <Fold
              group="proof-gates"
              claim={home.gates.title}
              badge={c.common.liveBadge}
              heading
            >
              <p>{home.gates.lead}</p>
              <GateRunner gates={c.gates} t={home.runner} />
              <p className="caption">{home.gates.caption}</p>
            </Fold>
          </Folds>
        </Section>

        {/* 07 · six refusals */}
        <Section marker={home.promises.marker}>
          <h2>{home.promises.title}</h2>
          <Folds>
            {c.promises.map((promise, index) => (
              <Fold
                key={promise.refusal}
                group="promises"
                claim={promise.refusal}
                open={index === 0}
              >
                <p>{promise.detail}</p>
              </Fold>
            ))}
          </Folds>
          <p>
            <Link href={`${base}/working-with-us`}>{home.promises.link}</Link>
          </p>
        </Section>

        {/* 08 · send a brief — the one section that is never folded */}
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
        </section>
      </main>

      <Footer content={c} locale={locale} />
    </>
  );
}

/** Positional, like the rail hues — glyphs carry no meaning a translator owns. */
const MARKS = ['↻', '◉', '$', '✓', '⇄', '↗'] as const;
