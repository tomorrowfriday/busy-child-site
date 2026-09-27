import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer, Masthead } from '@/components/Chrome';
import { GateRunner } from '@/components/GateRunner';
import { Link } from '@/components/Link';
import { Pipeline } from '@/components/Pipeline';
import { Bullets, Note, Section, Specimen, Steps } from '@/components/Primitives';
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
  return { title: c.methodPage.metaTitle, description: c.methodPage.metaDescription };
}

/** Language-independent: this is source code, not copy. */
const AGENT_UNIT = `/** Validates that a template exists for the specified operation ID. */
const validateOperationId = async (context: Context, parameters: unknown): Promise<void> => {
  const operationId = got(parameters, 'mutation.operationId') as string;

  if (!config.has(\`templates.\${operationId}\`)) {
    throw new InvalidParametersError(\`Template for operation ID "\${operationId}" is not found\`);
  }
};`;

export default async function MethodPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const m = c.methodPage;
  const base = `/${locale}`;

  return (
    <>
      <Masthead content={c} locale={locale} current="/method" />
      <main id="main">
        <Section hero marker={m.hero.marker}>
          <h1>{m.hero.title}</h1>
          {m.hero.body?.map((paragraph) => (
            <p className="sub" key={paragraph.slice(0, 24)}>
              {paragraph}
            </p>
          ))}
        </Section>

        <Section id="pipeline" marker={m.pipeline.marker}>
          <h2>{m.pipeline.title}</h2>
          <Pipeline t={m.pipelineLabels} />
          <Steps items={m.stages} />
        </Section>

        <Section id="why-it-works" marker={m.whyItWorks.marker}>
          <h2>{m.whyItWorks.title}</h2>
          <p className="lead">{m.whyItWorks.lead}</p>
          {m.whyItWorks.body?.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          {m.whyItWorks.bullets ? <Bullets items={m.whyItWorks.bullets} /> : null}
          <p>{m.whyItWorks.link}</p>
          <Specimen source={AGENT_UNIT} />
          <p className="caption">{m.whyItWorks.caption}</p>
        </Section>

        <Section id="gates" marker={m.gates.marker}>
          <h2>{m.gates.title}</h2>
          <GateRunner gates={c.gates} t={c.home.runner} />
          <p className="caption">{m.gates.caption}</p>
        </Section>

        <Section id="standard" marker={m.standard.marker}>
          <h2>{m.standard.title}</h2>
          {m.standard.bullets ? <Bullets items={m.standard.bullets} /> : null}
          {m.standard.note ? <Note tag={m.standard.note.tag} text={m.standard.note.text} /> : null}
        </Section>

        <Section id="review" marker={m.review.marker}>
          <h2>{m.review.title}</h2>
          {m.review.body?.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          {m.review.bullets ? <Bullets items={m.review.bullets} /> : null}
        </Section>

        <Section id="economics" marker={m.economics.marker}>
          <h2>{m.economics.title}</h2>
          {m.economics.bullets ? <Bullets items={m.economics.bullets} /> : null}
        </Section>

        <Section id="api" marker={m.api.marker}>
          <h2>{m.api.title}</h2>
          {m.api.body?.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </Section>

        <Section id="fit" marker={m.fit.marker}>
          <h2>{m.fit.title}</h2>
          {m.fit.bullets ? <Bullets items={m.fit.bullets} /> : null}
        </Section>

        <Section id="start" marker={m.start.marker}>
          <h2>{m.start.title}</h2>
          <Steps items={c.engagement} />
          <p>{m.start.caption}</p>
          <div className="cta">
            <Link className="button" href={`${base}/contact`}>
              {c.common.sendBrief}
            </Link>
            <Link className="button ghost" href={`${base}/working-with-us`}>
              {c.workingPage.metaTitle}
            </Link>
          </div>
        </Section>
      </main>
      <Footer content={c} locale={locale} />
    </>
  );
}
