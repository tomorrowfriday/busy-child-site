'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Reveals elements marked `.reveal` as they scroll in, once each.
 *
 * Mounted once in the layout rather than wrapping every section, so the markup
 * stays server-rendered and the page reads with JavaScript off (a `<noscript>`
 * block in `<head>` restores what the CSS hides).
 *
 * It re-runs on every route change. The App Router keeps the layout mounted
 * across client-side navigation and swaps only the page, so a mount-only
 * effect would observe the first page's sections and never the next one's —
 * leaving every section after the hero permanently at opacity 0.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)');
    if (targets.length === 0) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
