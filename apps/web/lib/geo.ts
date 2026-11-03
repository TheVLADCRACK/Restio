import 'server-only';
import { headers } from 'next/headers';
import { isSupportedCountry } from 'libphonenumber-js';

/**
 * Suggestion de pays, jamais bloquante : en-tête de géolocalisation IP de Vercel, sinon région de la langue du navigateur.
 * Aucune position précise n'est demandée ni stockée.
 */
export async function suggestCountry(): Promise<string | null> {
  const h = await headers();
  const fromIp = h.get('x-vercel-ip-country')?.toUpperCase();
  if (fromIp && isSupportedCountry(fromIp)) return fromIp;
  const region = /-([A-Za-z]{2})\b/.exec(h.get('accept-language') ?? '')?.[1]?.toUpperCase();
  return region && isSupportedCountry(region) ? region : null;
}
