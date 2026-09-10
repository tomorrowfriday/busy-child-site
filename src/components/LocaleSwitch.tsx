import { Link } from '@/components/Link';
import { LOCALES } from '@/content';
import en from '@/content/locales/en';
import uk from '@/content/locales/uk';
import type { Locale } from '@/content/schema';

const LABELS: Record<Locale, { label: string; name: string }> = {
  en: { label: en.localeLabel, name: en.localeName },
  uk: { label: uk.localeLabel, name: uk.localeName },
};

/**
 * Swaps locale while staying on the same page, so a reader who switches
 * language does not get dumped back on the homepage.
 */
export function LocaleSwitch({
  locale,
  current,
  label,
}: {
  locale: Locale;
  current?: string;
  label: string;
}) {
  return (
    <div className="locale-switch">
      <span className="visually-hidden">{label}</span>
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={`/${code}${current ?? ''}`}
          hrefLang={code}
          lang={code}
          aria-current={code === locale ? 'true' : undefined}
          className={code === locale ? 'is-active' : undefined}
        >
          {LABELS[code].label}
          <span className="visually-hidden"> — {LABELS[code].name}</span>
        </Link>
      ))}
    </div>
  );
}
