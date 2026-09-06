import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

/**
 * Social card, generated at build time.
 *
 * Yours is a referral business — links get pasted into Slack and email. Without
 * this, every one of those renders as a bare grey URL. It is drawn in the same
 * syntax palette as the site, so a shared link looks like the thing it opens.
 */
// Rendered once at build time and written into out/ — no runtime image service.
export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${site.name} — ${site.tagline}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#171a17',
          color: '#dfe4dd',
          padding: '68px 72px',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, color: '#6e786d' }}>
          {'// '}
          {site.sectors.join(' · ').toLowerCase()}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 62,
            lineHeight: 1.22,
            letterSpacing: '-0.03em',
            color: '#dfe4dd',
            maxWidth: 1010,
          }}
        >
          {site.statement}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 34, color: '#dfe4dd' }}>{site.wordmark}</div>
          <div style={{ display: 'flex', gap: 34, fontSize: 26 }}>
            <span style={{ color: '#e3a36d' }}>$4M+/mo</span>
            <span style={{ color: '#e3a36d' }}>100% coverage</span>
            <span style={{ color: '#e3a36d' }}>15+ years</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
