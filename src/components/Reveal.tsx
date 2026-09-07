'use client';

import { useEffect } from 'react';

/**
 * Reveals elements marked `.reveal` as they scroll in, once each.
 *
 * Mounted once in the layout rather than wrapping every section in a component,
 * so the markup stays server-rendered and the whole page is readable with
 * JavaScript off — the CSS only hides `.reveal` when motion is welcome, and this
 * adds the class that shows it.
 */
export function Reveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.reveal');
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
  }, []);

  return null;
}
