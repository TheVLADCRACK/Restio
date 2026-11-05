'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const publicPath = (path: string | null) => (path ?? '/').replace(/^\/app(?=\/|$)/, '') || '/';

/** Planche : l'en-tête du restaurant n'existe que sur l'accueil et les commandes ; les autres pages ont leur barre de titre. */
export function HomeOnly({ children }: { children: ReactNode }) {
  const path = publicPath(usePathname());
  return path === '/' || path === '/commandes' ? children : null;
}

/** Commandes : la barre latérale se replie en rail pour laisser la place aux tickets (« passe de cuisine »). */
export function ShellFrame({ className, children }: { className: string; children: ReactNode }) {
  const rail = publicPath(usePathname()).startsWith('/commandes');
  return (
    <div data-side={rail ? 'rail' : 'full'} className={className}>
      {children}
    </div>
  );
}

/** Planche : pas de barre d'onglets sur les écrans secondaires, qui ont leur bouton retour. */
export function TabBarFrame({ children }: { children: ReactNode }) {
  const path = publicPath(usePathname());
  const secondary = path.startsWith('/reglages/') || path === '/qr-code' || path === '/notifications';
  return secondary ? null : children;
}
