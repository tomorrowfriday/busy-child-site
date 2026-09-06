import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Masthead } from '@/components/Chrome';
import { Section, Steps } from '@/components/Primitives';
import { engagement, promises } from '@/content/site';

export const metadata: Metadata = {
  title: 'Working with us',
  description:
    'Six promises that keep clients with us, what an engagement looks like, and the quality bar every service ships against.',
};

export default function WorkingWithUsPage() {
  return (
    <>
      <Masthead current="/working-with-us" />
      <main id="main">
        <Section hero marker="how we work">
          <h1>Six promises that keep clients with us.</h1>
          <p className="sub">
            Every one of them is a refusal. That&apos;s deliberate — a promise about what we
            won&apos;t do is harder to fake than a claim about what we will.
          </p>
        </Section>

        <Section>
          <div className="refusals">
            {promises.map((promise) => (
              <div className="refusal" key={promise.refusal}>
                <h3>{promise.refusal}</h3>
                <p>{promise.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="engagement" marker="a sensible way to start">
          <h2>One service, end to end, in a short fixed window.</h2>
          <p className="lead">
            Rather than a long discovery phase or an open-ended retainer, the first engagement is
            scoped so you get a real answer quickly — and a working system either way.
          </p>
          <Steps items={engagement} />
        </Section>

        <Section id="bar" marker="the quality bar">
          <h2>These are build failures, not review comments.</h2>
          <ul className="dash">
            <li>Two test suites: unit, and end-to-end integration against a real database.</li>
            <li>
              <span className="lit">100%</span> coverage enforced on both — statements, branches,
              functions and lines.
            </li>
            <li>
              Every operation must be exercised by at least one end-to-end scenario, checked by the
              compiler.
            </li>
            <li>
              Response schemas enforced at runtime, so the published API description can&apos;t
              drift from what the service actually returns.
            </li>
          </ul>
          <div className="note">
            <span className="tag">Why we can hold the line at 100%</span>
            <p>
              Because most of the code is generated and its tests are generated with it. Full
              coverage isn&apos;t a heroic effort by the team — it&apos;s the default state of a
              compiled service, and it stays there as the service grows.
            </p>
          </div>
          <p>
            <Link href="/method">The method in full →</Link>
          </p>
        </Section>

        <Section id="team" marker="what it means for your team">
          <h2>Leverage, not headcount reduction.</h2>
          <p>
            Backend teams usually grow because volume outpaces the people who can absorb it — more
            endpoints, more validation, more tests, more review, more knowledge stuck in one
            person&apos;s head.
          </p>
          <ul className="dash">
            <li>
              <strong>Engineers work at the level they were hired for.</strong> Specs and judgment
              calls, rather than writing a fifth CRUD endpoint by hand and reviewing a sixth.
            </li>
            <li>
              <strong>Standards stop depending on seniority.</strong> Conventions, security rules
              and quality bars are encoded in a generator applied to every service.
            </li>
            <li>
              <strong>New hires ramp on the spec, not the codebase.</strong> A readable document
              instead of reconstructing intent from five thousand lines of handlers.
            </li>
            <li>
              <strong>Agent capacity turns into parallel work, not review burden.</strong> Which is
              the usual failure mode of adding AI to a team.
            </li>
          </ul>
          <div className="cta">
            <Link className="button" href="/contact">
              Send a brief
            </Link>
            <Link className="button ghost" href="/work">
              See the work
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
