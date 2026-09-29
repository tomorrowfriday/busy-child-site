import { HomeDeck } from '@/components/HomeDeck';
import { clientProjects, getContent, isLocale, LOCALES } from '@/content';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * The home page — "Busy Child Home v7".
 *
 * A ten-screen deck rather than a scrolling page. Everything below is rendered
 * on the server into one static document; `HomeDeck` only decides which screen
 * is on top. The other four routes are unchanged and still carry the long-form
 * argument — this page is the walkthrough.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = getContent(locale);

  return (
    <main id="main">
      <HomeDeck content={content} projects={clientProjects(content)} locale={locale} />
    </main>
  );
}
