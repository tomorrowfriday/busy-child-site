import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export: the whole site is HTML/CSS/JS on a CDN. No server, no runtime cost.
  output: 'export',
  // Empty by default (site at the domain root). The skravets hub builds with
  // NEXT_PUBLIC_BASE_PATH=/busy-child to serve the site from that subfolder.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  images: { unoptimized: true },
  typedRoutes: true,
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
