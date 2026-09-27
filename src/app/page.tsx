import { LOCALES, DEFAULT_LOCALE } from '@/content';
import en from '@/content/locales/en';
import uk from '@/content/locales/uk';

/**
 * The bare domain.
 *
 * Static export has no server, so there is no server-side redirect to make.
 * This sends a visitor to the language their browser asks for, falling back to
 * the default, and renders real links so the page still works with JavaScript
 * off or if the redirect is blocked. Search engines follow the links and the
 * canonical tags on each locale.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata = {
  robots: { index: false, follow: true },
};

const REDIRECT = `(function () {
  try {
    var supported = ${JSON.stringify(LOCALES)};
    var wanted = (navigator.languages || [navigator.language || ''])
      .map(function (tag) { return String(tag).slice(0, 2).toLowerCase(); })
      .filter(function (tag) { return supported.indexOf(tag) !== -1; })[0] || '${DEFAULT_LOCALE}';
    location.replace('${BASE}/' + wanted + '/');
  } catch (e) {
    location.replace('${BASE}/${DEFAULT_LOCALE}/');
  }
})();`;

export default function RootPage() {
  return (
    <div className="gateway">
      <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
      <p className="gateway-mark">busychild</p>
      <nav className="gateway-links" aria-label="Choose a language">
        <a href={`${BASE}/en/`} hrefLang="en" lang="en">
          {en.localeName}
        </a>
        <a href={`${BASE}/uk/`} hrefLang="uk" lang="uk">
          {uk.localeName}
        </a>
      </nav>
    </div>
  );
}
