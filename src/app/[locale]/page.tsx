import { Footer } from '@/components/Chrome';
import { Link } from '@/components/Link';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { ProjectRail } from '@/components/ProjectRail';
import { ProofTabs } from '@/components/ProofTabs';
import { clientProjects, getContent, isLocale, site, LOCALES } from '@/content';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * The home page — "Busy Child Home v3".
 *
 * One screen-deep argument: what we built, what it changes for you, how it is
 * kept from breaking, and how we work. The five routes still exist and the
 * footer still links them; this page is the short version, and the masthead
 * here points at its own sections rather than at those routes.
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

        <div className="home-stats">
          {c.literals.map((literal) => (
            <div key={literal.value}>
              <b>{literal.value}</b>
              <span>{literal.caption}</span>
            </div>
          ))}
        </div>
      </header>

      <main id="main" className="home">
        {/* 01 · what we've built */}
        <section id="work" className="band reveal">
          <div className="wrap">
            <ProjectRail
              projects={clientProjects(c)}
              t={home.rail}
              sheet={home.sheet}
              locale={locale}
            />
          </div>
        </section>

        {/* 02 · what changes for you */}
        <section id="results" className="band reveal">
          <div className="wrap">
            <div className="band-head">
              <h2>{home.results.title}</h2>
              <p>{home.results.lead}</p>
            </div>
            <div className="results">
              {home.results.items.map((item, index) => (
                <div className="result" key={item.title}>
                  <span className="mark" aria-hidden="true">
                    {MARKS[index]}
                  </span>
                  <span className="result-body">
                    <b>{item.title}</b>
                    <span>{item.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 · how we keep it from breaking */}
        <section id="proof" className="band reveal">
          <div className="wrap">
            <div className="band-head">
              <h2>{home.proof.title}</h2>
              <p>{home.proof.lead}</p>
            </div>
            <ProofTabs
              t={home.proof}
              scenarios={c.scenarios}
              gates={c.gates}
              editor={home.editor}
              runner={home.runner}
            />
          </div>
        </section>

        {/* 04 · how we work */}
        <section id="how" className="band reveal">
          <div className="wrap">
            <h2>{home.working.title}</h2>
            <div className="promises">
              {home.working.items.map((item) => (
                <div className="promise" key={item}>
                  <span aria-hidden="true">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 05 · send a brief */}
        <section id="contact" className="band reveal">
          <div className="wrap">
            <div className="closing">
              <div className="closing-copy">
                <h2>{home.closing.title}</h2>
                <p>{home.closing.lead}</p>
              </div>
              <div className="cta">
                <Link className="button invert" href={`${base}/contact`}>
                  {c.common.sendBrief}
                </Link>
                <a className="button ghost-invert" href={site.upwork}>
                  {c.common.upwork}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer content={c} locale={locale} />
    </>
  );
}

/** Positional, like the rail hues — glyphs carry no meaning a translator owns. */
const MARKS = ['↻', '◉', '$', '✓', '⇄', '↗'] as const;
