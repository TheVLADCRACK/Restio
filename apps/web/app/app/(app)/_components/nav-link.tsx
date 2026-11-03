'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Lien de navigation : seul composant client de la coquille, il marque la page courante (aria-current). */
export function NavLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  // Le proxy réécrit app.<domaine>/x en /app/x : on compare le chemin public.
  const path = (usePathname() ?? '/').replace(/^\/app(?=\/|$)/, '') || '/';
  const active = href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={className}>
      {children}
    </Link>
  );
}
