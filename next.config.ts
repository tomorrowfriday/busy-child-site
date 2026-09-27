import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export: the whole site is HTML/CSS/JS on a CDN. No server, no runtime cost.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  typedRoutes: true,
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
