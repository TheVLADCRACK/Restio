import 'server-only';
import { ExternalLink } from 'lucide-react';
import { buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { env } from '@/lib/env';

/** Adresse publique du menu, construite depuis l'hôte racine configuré (restio-app.com en production). */
export function publicMenuUrl(slug: string): { href: string; label: string } {
  const host = env().ROOT_HOST;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return { href: `${protocol}://${host}/@${slug}`, label: `${host}/@${slug}` };
}

/** « Voir mon menu » : lien actif seulement une fois le menu publié, sinon désactivé avec « Bientôt ». */
export function PublicMenuLink({ slug, isPublished, compact = false, className }: { slug: string; isPublished: boolean; compact?: boolean; className?: string }) {
  if (!isPublished) {
    return (
      <a aria-disabled="true" title={compact ? 'Disponible après publication du menu' : undefined} className={cn(buttonClass({ size: 'sm' }), 'cursor-not-allowed border-sunken bg-sunken text-text-3 hover:bg-sunken', className)}>
        <ExternalLink aria-hidden="true" className="size-4" strokeWidth={1.75} />
        Voir mon menu
        {/* Dans la barre latérale (étroite), la mention passe en info-bulle pour ne pas déborder. */}
        {compact ? <span className="sr-only">(disponible après publication)</span> : <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-text-2">Bientôt</span>}
      </a>
    );
  }
  return (
    <a href={publicMenuUrl(slug).href} target="_blank" rel="noopener noreferrer" className={cn(buttonClass({ size: 'sm' }), className)}>
      <ExternalLink aria-hidden="true" className="size-4" strokeWidth={1.75} />
      Voir mon menu
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}

/** Monogramme du restaurant : initiale citron sur Ink (DESIGN.md). */
export function RestaurantMonogram({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-[12px] bg-ink text-lg font-black text-lime', className)}>
      {name.trim().charAt(0).toUpperCase() || 'R'}
    </span>
  );
}
