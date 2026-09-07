import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * `next/link` with prefetching off.
 *
 * Next 16's router prefetches an RSC payload per route. Under `output: export`
 * those payloads are written to a nested path (`work/__next.work/__PAGE__.txt`)
 * while the router asks for a flat one (`work/__next.work.__PAGE__.txt`), so
 * every prefetch 404s. Navigation is unaffected, but a site that argues for
 * rigour should not ship a console full of failed requests.
 *
 * The cost of turning it off is negligible here: five static pages on a CDN.
 * If a later Next release lines those paths up, delete this and import
 * `next/link` directly.
 */
export function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
