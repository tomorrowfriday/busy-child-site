import type { Metadata } from 'next';
import { Link } from '@/components/Link';
import { Footer, Masthead } from '@/components/Chrome';
import { Section } from '@/components/Primitives';
import { projects } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Four production platforms in fund administration, healthcare scheduling and insurance claims — plus a consumer iOS product. Client names withheld; architecture and numbers published.',
};

export default function WorkPage() {
  return (
    <>
      <Masthead current="/work" />
      <main id="main">
        <Section hero marker="selected work">
          <h1>Four platforms in production, and one product of our own.</h1>
          <p className="sub">
            We don&apos;t publish client names. What we can publish is the domain, the
            architecture, what shipped, and the numbers — which is most of what tells you whether
            we&apos;ve built your shape of system before.
          </p>
        </Section>

        {projects.map((project) => (
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

              <h3>What we shipped</h3>
              <ul className="shipped">
                {project.shipped.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {project.outcome ? (
                <div className="note">
                  <span className="tag">Outcome</span>
                  <p>{project.outcome}</p>
                </div>
              ) : null}

              <div className="stack">
                {project.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>

              {project.externalUrl ? (
                <div className="cta">
                  <a className="button ghost" href={project.externalUrl}>
                    Find {project.title.split(' — ')[0]} on the App Store
                  </a>
                </div>
              ) : null}
            </div>
          </Section>
        ))}

        <Section marker="next">
          <h2>Building something in this territory?</h2>
          <p className="lead">Send a brief and you&apos;ll hear back the same business day.</p>
          <div className="cta">
            <Link className="button" href="/contact">
              Send a brief
            </Link>
            <Link className="button ghost" href="/method">
              How we build it
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
