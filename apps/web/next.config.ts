import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// shortcut: 'unsafe-inline' pour les scripts de Next.js ; passer à des nonces générés dans le proxy avant d'ajouter du contenu tiers (Phase 6).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@restio/core', '@restio/db', '@restio/ui'],
  // Photos compressées dans le navigateur avant l'envoi ; Vercel plafonne le corps à 4,5 Mo.
  serverExternalPackages: ['sharp'],
  experimental: { serverActions: { bodySizeLimit: '4.5mb' } },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default createNextIntlPlugin('./i18n/request.ts')(config);
