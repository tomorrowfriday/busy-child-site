import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer, Masthead } from '@/components/Chrome';
import { Link } from '@/components/Link';
import { Bullets, Note, Section, Steps } from '@/components/Primitives';
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
  return { title: c.workingPage.metaTitle, description: c.workingPage.metaDescription };
}

export default async function WorkingWithUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const w = c.workingPage;
  const base = `/${locale}`;

  return (
    <>
      <Masthead content={c} locale={locale} current="/working-with-us" />
      <main id="main">
        <Section hero marker={w.hero.marker}>
          <h1>{w.hero.title}</h1>
          <p className="sub">{w.hero.lead}</p>
        </Section>

        <Section>
          <div className="refusals">
            {c.promises.map((promise) => (
              <div className="refusal" key={promise.refusal}>
                <h3>{promise.refusal}</h3>
                <p>{promise.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="engagement" marker={w.engagement.marker}>
          <h2>{w.engagement.title}</h2>
          <p className="lead">{w.engagement.lead}</p>
          <Steps items={c.engagement} />
        </Section>

        <Section id="bar" marker={w.bar.marker}>
          <h2>{w.bar.title}</h2>
          {w.bar.bullets ? <Bullets items={w.bar.bullets} /> : null}
          {w.bar.note ? <Note tag={w.bar.note.tag} text={w.bar.note.text} /> : null}
          <p>
            <Link href={`${base}/method`}>{w.bar.link}</Link>
          </p>
        </Section>

        <Section id="team" marker={w.team.marker}>
          <h2>{w.team.title}</h2>
          {w.team.body?.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          {w.team.bullets ? <Bullets items={w.team.bullets} /> : null}
          <div className="cta">
            <Link className="button" href={`${base}/contact`}>
              {c.common.sendBrief}
            </Link>
            <Link className="button ghost" href={`${base}/work`}>
              {c.common.seeWork}
            </Link>
          </div>
        </Section>
      </main>
      <Footer content={c} locale={locale} />
    </>
  );
}
