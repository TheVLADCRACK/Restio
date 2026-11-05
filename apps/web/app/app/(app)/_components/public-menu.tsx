import 'server-only';
import { getTranslations } from 'next-intl/server';
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

/** « Voir mon menu » (planche : bouton secondaire) : actif une fois le menu publié, sinon atténué avec une info-bulle. */
export async function PublicMenuLink({ slug, isPublished, className }: { slug: string; isPublished: boolean; className?: string }) {
  const t = await getTranslations('publicMenu');
  const tc = await getTranslations('common');
  const base = cn(buttonClass({ size: 'sm' }), className);
  if (!isPublished) {
    return (
      <a aria-disabled="true" title={t('availableAfter')} className={cn(base, 'cursor-not-allowed text-text-3 hover:bg-surface')}>
        <ExternalLink aria-hidden="true" className="size-4" strokeWidth={1.75} />
        {t('view')}
        <span className="sr-only"> {t('availableAfterSr')}</span>
      </a>
    );
  }
  return (
    <a href={publicMenuUrl(slug).href} target="_blank" rel="noopener noreferrer" className={base}>
      <ExternalLink aria-hidden="true" className="size-4" strokeWidth={1.75} />
      {t('view')}
      <span className="sr-only"> {tc('newTab')}</span>
    </a>
  );
}

/** Logo du restaurant, sinon son initiale citron sur Ink (DESIGN.md). */
export function RestaurantMonogram({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className?: string }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- vignette déjà optimisée servie depuis le stockage
    return <img src={logoUrl} alt="" className={cn('size-10 shrink-0 rounded-[12px] object-cover', className)} />;
  }
  return (
    <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-[12px] bg-ink text-lg font-black text-lime', className)}>
      {name.trim().charAt(0).toUpperCase() || 'R'}
    </span>
  );
}
