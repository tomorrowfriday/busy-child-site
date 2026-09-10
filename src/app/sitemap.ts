import type { MetadataRoute } from 'next';
import { getContent, site, LOCALES } from '@/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    const content = getContent(locale);
    const paths = ['', ...content.nav.map((item) => item.href)];

    for (const path of paths) {
      entries.push({
        url: `${site.url}/${locale}${path}/`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: path === '' ? 1 : 0.8,
        // Tell search engines the two languages are the same page.
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${site.url}/${l}${path}/`]),
          ),
        },
      });
    }
  }

  return entries;
}
