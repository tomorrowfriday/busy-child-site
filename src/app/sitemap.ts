import type { MetadataRoute } from 'next';
import { site, LANG, LOCALES } from '@/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // Everything else the site says is a deck screen, so each locale is two
    // URLs: the deck and the page behind "send a brief".
    const paths = ['', '/contact'];

    for (const path of paths) {
      entries.push({
        url: `${site.url}/${locale}${path}/`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: path === '' ? 1 : 0.8,
        // Tell search engines the two languages are the same page.
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [LANG[l], `${site.url}/${l}${path}/`]),
          ),
        },
      });
    }
  }

  return entries;
}
