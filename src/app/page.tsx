import Link from 'next/link';
import { CompilerDemo } from '@/components/CompilerDemo';
import { Footer, Masthead } from '@/components/Chrome';
import { GateTable, Literals, Section } from '@/components/Primitives';
import { clientProjects } from '@/content/projects';
import { promises, scenarios, site } from '@/content/site';

export default function HomePage() {
  return (
    <>
      <Masthead />
      <main id="main">
        {/* 01 · statement */}
        <Section hero>
          <div className="sectors">
            {site.sectors.map((sector) => (
              <span key={sector}>{sector}</span>
            ))}
          </div>
          <h1>{site.statement}</h1>
          <p className="sub">{site.description}</p>
          <div className="cta">
            <Link className="button" href="/contact">
              Send a brief
            </Link>
            <Link className="button ghost" href="/work">
              See the work
            </Link>
          </div>
        </Section>

        {/* 02 · four literals */}
        <Section>
          <Literals />
        </Section>

        {/* 03 · the specimen, running */}
        <Section marker="how we know it works">
          <h2>The test assertions live in the specification.</h2>
          <p className="lead">
            A scenario is written the way a product owner would state it — in a document a
            non-engineer can read and check. The compiler turns it into an executable test that
            runs against a real database on every change.
          </p>

          <CompilerDemo scenarios={scenarios} />

          <p className="caption">
            Both panes above are computed in your browser by the same pure function the pipeline
            uses. Pick a different scenario and watch the test regenerate — nothing here is a
            screenshot. An agent cannot make a failing test pass by weakening the assertion,
            because the assertion isn&apos;t in the test file.
          </p>
          <p>
            <Link href="/method">How the whole pipeline works →</Link>
          </p>
        </Section>

        {/* 04 · four platforms */}
        <Section marker="selected work">
          <h2>Four platforms, in production.</h2>
          <p>
            Client names are withheld. What we can publish is the domain, the architecture, and
            the numbers.
          </p>

          <div className="projects">
            {clientProjects.map((project) => (
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
            <Link href="/work">Read the work in detail →</Link>
          </p>
        </Section>

        {/* 05 · the gates */}
        <Section marker="what stops it shipping broken">
          <h2>Every change runs the same stack of gates.</h2>
          <p className="lead">
            These are build failures, not review comments. Nothing reaches production by being
            waved through.
          </p>
          <GateTable />
          <p className="caption">
            That last row is the unusual one. Output schemas are enforced at request time, not only
            in CI — a service that returns something it never promised fails loudly rather than
            shipping malformed data downstream.
          </p>
        </Section>

        {/* 06 · six refusals */}
        <Section marker="how we work">
          <h2>Six promises that keep clients with us.</h2>
          <div className="refusals">
            {promises.map((promise) => (
              <div className="refusal" key={promise.refusal}>
                <h3>{promise.refusal}</h3>
                <p>{promise.detail}</p>
              </div>
            ))}
          </div>
          <p>
            <Link href="/working-with-us">What an engagement looks like →</Link>
          </p>
        </Section>

        {/* 07 · send a brief */}
        <Section marker="let's build it">
          <h2>Send a brief — you&apos;ll hear back the same business day.</h2>
          <p className="lead">
            Tell us what you&apos;re building and what it has to do. That&apos;s the only thing we
            need to start a useful conversation.
          </p>
          <div className="cta">
            <Link className="button" href="/contact">
              Send a brief
            </Link>
            <a className="button ghost" href={site.upwork}>
              Hire us on Upwork
            </a>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
