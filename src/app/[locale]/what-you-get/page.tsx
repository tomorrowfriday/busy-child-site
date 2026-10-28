import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Band, PageShell } from '@/components/PageShell';
import { Link } from '@/components/Link';
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
  return { title: c.home.outcomes.marker, description: c.home.outcomes.lead };
}

const MARKS = ['◆', '●', '▲', '■', '◇', '○'] as const;
const HUES = ['var(--kw)', 'var(--num)', 'var(--str)', 'var(--fn)'] as const;

/**
 * The outcomes, for a reader who is not an engineer — the one page a
 * non-technical owner can be sent to directly. Short on purpose: the six
 * results, the plain-language note, and the way to write.
 */
export default async function WhatYouGetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const o = c.home.outcomes;

  return (
    <PageShell content={c} locale={locale} current="/what-you-get">
      <Band head eyebrow={o.marker} title={o.title} lead={o.lead} />

      <Band hue="var(--str)">
        <div className="results">
          {o.items.map((item, index) => (
            <div className="result" key={item.title}>
              <span
                className="mark"
                aria-hidden="true"
                style={{ '--hue': HUES[index % HUES.length] } as React.CSSProperties}
              >
                {MARKS[index % MARKS.length]}
              </span>
              <span className="result-body">
                <b>{item.title}</b>
                <span>{item.detail}</span>
              </span>
            </div>
          ))}
        </div>

        {o.note ? (
          <div className="sheet-outcome">
            <span className="tag">{o.note.tag}</span>
            <p>{o.note.text}</p>
          </div>
        ) : null}

        <div className="deck-cta">
          <Link className="pill" href={`/${locale}/contact`}>
            {c.common.sendBrief} →
          </Link>
          <Link className="pill ghost" href={`/${locale}/work`}>
            {c.common.seeWork}
          </Link>
        </div>
      </Band>
    </PageShell>
  );
}
