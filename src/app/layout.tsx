import type { Metadata } from 'next';
import { JetBrains_Mono, Martian_Mono } from 'next/font/google';
import { Reveal } from '@/components/Reveal';
import { site } from '@/content/site';
import './globals.css';

/**
 * Fonts are self-hosted at build time by next/font — no request to Google at
 * runtime, no layout shift, and no third-party tracking on a page that argues
 * for restraint.
 */
const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const display = Martian_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline.toLowerCase()}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline.toLowerCase()}`,
    description: site.description,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${display.variable}`}>
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
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <Reveal />
      </body>
    </html>
  );
}
