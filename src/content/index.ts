import en from './locales/en';
import uk from './locales/uk';
import { LOCALES, type Content, type Locale } from './schema';

export { LOCALES };
export type { Content, Locale };

const dictionaries: Record<Locale, Content> = { en, uk };

export function getContent(locale: Locale): Content {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

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
