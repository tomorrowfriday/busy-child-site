import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Masthead } from '@/components/Chrome';
import { Section, Steps } from '@/components/Primitives';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Send a brief and you will hear back the same business day. Tell us what you are building and what it has to do.',
};

const BRIEF = [
  {
    title: 'What you are building',
    detail: 'The system and the business it serves. One paragraph is plenty.',
  },
  {
    title: 'What it has to do',
    detail: 'The two or three things that would make it a failure if they did not work.',
  },
  {
    title: 'What exists today',
    detail: 'A running system, a prototype, spreadsheets, or nothing yet. All four are normal.',
  },
  {
    title: 'Constraints that are real',
    detail:
      'A date, a compliance regime, an incumbent stack you have to live with, a budget shape.',
  },
  {
    title: 'Who we would be working with',
    detail: 'Whether there is an in-house team, and whether they will own it afterwards.',
  },
];

export default function ContactPage() {
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent('Project brief')}`;

  return (
    <>
      <Masthead current="/contact" />
      <main id="main">
        <Section hero marker="let's build it">
          <h1>Send a brief — you&apos;ll hear back the same business day.</h1>
          <p className="sub">
            Tell us what you&apos;re building and what it has to do. That&apos;s genuinely all we
            need to start a useful conversation, and you&apos;ll be talking to the person who would
            do the work.
          </p>
          <div className="cta">
            <a className="button" href={mailto}>
              {site.email}
            </a>
            <a className="button ghost" href={site.upwork}>
              Or invite us on Upwork
            </a>
          </div>
        </Section>

        <Section marker="what to put in it">
          <h2>A useful brief is about five sentences.</h2>
          <p className="lead">
            Not a specification — we&apos;ll write that with you. Enough for us to tell you honestly
            whether we&apos;re the right team.
          </p>
          <Steps items={BRIEF} />
          <div className="note">
            <span className="tag">What happens next</span>
            <p>
              You get a reply the same business day from a senior engineer, not a form response. If
              we&apos;re not the right fit we&apos;ll say so in that first reply rather than booking
              a call to find out.
            </p>
          </div>
        </Section>

        <Section marker="straight answers">
          <h2>Before you write it.</h2>
          <ul className="dash">
            <li>
              <strong>Do you take small projects?</strong> Yes, if they&apos;re real. One service
              end to end is our preferred way to start —{' '}
              <Link href="/working-with-us">how an engagement begins</Link>.
            </li>
            <li>
              <strong>Can our team own the code afterwards?</strong> That&apos;s the intended
              outcome. The specification is the handover artefact.
            </li>
            <li>
              <strong>Do you work with an existing in-house team?</strong> Regularly. We work behind
              your gates, in your process, on your infrastructure.
            </li>
            <li>
              <strong>Why don&apos;t you name your clients?</strong> Most of our work is under NDA
              and we&apos;d rather respect that than trade it for a logo wall.{' '}
              <Link href="/work">The work</Link> is published with its architecture and its numbers.
            </li>
            <li>
              <strong>Is there anything we can actually try?</strong> Yes —{' '}
              <Link href="/work">Mines</Link> is ours, it&apos;s on the App Store, and it&apos;s the
              same team.
            </li>
          </ul>
          <div className="cta">
            <a className="button" href={mailto}>
              Send a brief
            </a>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
