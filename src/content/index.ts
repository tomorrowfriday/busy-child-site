import en from './locales/en';
import ua from './locales/ua';
import { LOCALES, type Content, type Locale } from './schema';

export { LOCALES };
export type { Content, Locale };

const dictionaries: Record<Locale, Content> = { en, ua };

export function getContent(locale: Locale): Content {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * The BCP 47 tag for each route segment.
 *
 * The Ukrainian pages live at /ua because that is what a Ukrainian reader
 * recognises, but `ua` is a country code — the language is `uk`. Anything a
 * machine reads (lang, hreflang, og:locale) uses this map, so the URL stays
 * friendly without lying to screen readers or search engines.
 */
export const LANG: Record<Locale, string> = { en: 'en', ua: 'uk' };

/** The locale served at the bare domain, and the one search engines canonicalise to. */
export const DEFAULT_LOCALE: Locale = 'en';

export const site = {
  name: 'Busy Child',
  wordmark: 'busychild',
  upwork: 'https://www.upwork.com/agencies/2029955071357100515/',
  email: 'kravets.s.mail@gmail.com',
  // TODO: set once the domain is registered — used for canonical + OG URLs.
  url: 'https://busychild.com',
} as const;

export function clientProjects(content: Content) {
  return content.projects.filter((project) => !project.named);
}

export function ownProducts(content: Content) {
  return content.projects.filter((project) => project.named);
}
