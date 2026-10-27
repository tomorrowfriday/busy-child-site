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
      // The site is dark for everyone, not only for people whose OS is.
      // The light palette below it is intact — drop this attribute and the
      // whole site follows prefers-color-scheme again.
      data-theme="dark"
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
            __html:
              `<style>.reveal{opacity:1!important;transform:none!important}` +
              // The deck stacks ten screens and shows one. Without JavaScript
              // nothing can advance it, so it unstacks into an ordinary page.
              `body:has(.deck){overflow:auto}` +
              `.deck,.stage{position:static;overflow:visible;height:auto;left:0}` +
              `.screen{position:static;opacity:1!important;transform:none!important;` +
              `visibility:visible!important;clip-path:none!important;` +
              `border-bottom:1px solid var(--line)}` +
              `.screen-inner{height:auto;overflow:visible;padding-block:2.5rem}` +
              `.deck-bar,.top-progress{display:none}` +
              `.deck-top{position:static;height:auto;flex-wrap:wrap;padding:.8rem 1rem}` +
              `.deck-strip{display:none}</style>`,
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
