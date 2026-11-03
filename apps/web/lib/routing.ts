import { isValidSlug } from '@restio/core';

export type RouteDecision =
  | { kind: 'next' }
  | { kind: 'rewrite'; pathname: string }
  | { kind: 'redirect'; pathname: string }
  | { kind: 'not-found' };

type Hosts = { rootHost: string; appHost: string };

const INTERNAL_PREFIXES = ['/app', '/m/'];

/**
 * Un seul projet Next.js sert trois surfaces :
 * - app.<domaine>        → application restaurateur (dossier interne /app)
 * - <domaine>/@slug      → menu public (dossier interne /m/[slug]) ; un dossier « @x » serait un slot parallèle Next.js
 * - <domaine>            → site vitrine
 */
export function resolveRoute(host: string | null, rawPathname: string, { rootHost, appHost }: Hosts): RouteDecision {
  // Décodé avant toute règle : « /%61pp » ne doit pas contourner le blocage de « /app ».
  const pathname = decodeSafe(rawPathname);
  if (pathname === null) return { kind: 'not-found' };
  if (pathname.startsWith('/api/')) return { kind: 'next' };

  const h = (host ?? '').toLowerCase();
  if (h === appHost) {
    // Pages légales communes aux deux hôtes (liens depuis l'inscription).
    if (pathname.startsWith('/legal/')) return { kind: 'next' };
    return { kind: 'rewrite', pathname: pathname === '/' ? '/app' : `/app${pathname}` };
  }

  if (h !== rootHost) {
    // Hôte inconnu (prévisualisation) : traité comme le site public, jamais comme l'application.
  }

  const menu = /^\/@([^/]+)\/?$/.exec(pathname);
  if (menu?.[1]) {
    const raw = menu[1];
    const slug = raw.toLowerCase();
    if (!isValidSlug(slug)) return { kind: 'not-found' };
    if (slug !== raw || pathname.endsWith('/')) return { kind: 'redirect', pathname: `/@${slug}` };
    return { kind: 'rewrite', pathname: `/m/${slug}` };
  }
  // Tout autre chemin en « /@… » (sous-chemin, slug décodé contenant « / ») n'existe pas.
  if (pathname.startsWith('/@')) return { kind: 'not-found' };

  if (INTERNAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`))) {
    return { kind: 'not-found' };
  }
  return { kind: 'next' };
}

function decodeSafe(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
