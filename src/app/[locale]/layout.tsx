import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent, isLocale, site, LOCALES } from '@/content';
import type { Locale } from '@/content/schema';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Only en and uk exist. Without this, any unmatched top-level path — a
 * browser probing /favicon.ico, a stray link — is treated as a locale Next
 * must generate, which throws under output: export. false makes it a 404.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = getContent(locale);

  return {
    title: {
      default: `${site.name} — ${content.site.tagline.toLowerCase()}`,
      template: `%s — ${site.name}`,
    },
    description: content.site.description,
    alternates: {
      canonical: `${site.url}/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${site.url}/${l}`])),
    },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: locale === 'uk' ? 'uk_UA' : 'en_US',
      title: `${site.name} — ${content.site.tagline.toLowerCase()}`,
      description: content.site.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <LocaleShell locale={locale}>{children}</LocaleShell>;
}

/**
 * `lang` belongs on <html>, but the root layout is locale-agnostic, so this
 * sets it from the segment. A wrapper keeps the async params handling above
 * readable.
 */
function LocaleShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const content = getContent(locale);
  return (
    <div data-locale={locale} lang={locale}>
      <a className="skip-link" href="#main">
        {content.common.skipToContent}
      </a>
      {children}
    </div>
  );
}
