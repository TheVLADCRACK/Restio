import { qrPath } from '@/lib/qr/build';

/** QR Code affiché à l'écran : vectoriel, net à toute taille, logo Restio au centre. */
export function QrImage({ url, className, label }: { url: string; className?: string; label: string }) {
  const { viewBox, d, logo } = qrPath(url);
  const pad = logo.size * 0.12;
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${viewBox} ${viewBox}`} className={className}>
      <rect width={viewBox} height={viewBox} fill="#fff" />
      <path d={d} fill="#0F0F0F" />
      <image href="/brand/restio-mark-ink.png" x={logo.x + pad} y={logo.x + pad} width={logo.size - pad * 2} height={logo.size - pad * 2} />
    </svg>
  );
}
