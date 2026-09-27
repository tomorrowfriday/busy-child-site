import type { Metadata } from 'next';
import { JetBrains_Mono, Martian_Mono } from 'next/font/google';
import { Reveal } from '@/components/Reveal';
import { site, DEFAULT_LOCALE } from '@/content';
import './globals.css';

/**
 * Fonts are self-hosted at build time by next/font — no request to Google at
 * runtime, no layout shift, and no third-party tracking on a page that argues
 * for restraint.
 */
const mono = JetBrains_Mono({ subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-mono' });

const display = Martian_Mono({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  weight: ['400', '600', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  robots: { index: true, follow: true },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The root layout is locale-agnostic — it wraps both languages — so `lang`
    // is set here to the default and narrowed per-locale on the wrapper in
    // app/[locale]/layout.tsx. `data-scroll-behavior` tells Next the smooth
    // scroll is deliberate, so it suppresses it during route transitions.
    <html
      lang={DEFAULT_LOCALE}
      className={`${mono.variable} ${display.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        {/*
          Scroll-reveal hides sections until JavaScript reveals them, which
          would leave a reader without JavaScript looking at a blank page.
          This puts the content back for them. It is static markup rather than
          a script, so it costs no execution and cannot desync at hydration.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>.reveal{opacity:1!important;transform:none!important}</style>`,
          }}
        />
      </head>
      <body>
        {children}
        <Reveal />
      </body>
    </html>
  );
}
