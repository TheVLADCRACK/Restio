import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { LucideIcon } from 'lucide-react';
import { Bell, BookOpen, ChartColumn, CircleHelp, House, QrCode, ReceiptText, Settings } from 'lucide-react';
import { cn } from '@restio/ui/cn';
import { requireMembership } from '@/lib/auth/session';
import { getPendingCount, getRestaurantSummary } from '@/lib/dashboard/queries';
import { getUnreadCount } from '@/lib/notifications/queries';
import { env } from '@/lib/env';
import { HomeOnly, ShellFrame, TabBarFrame } from './_components/home-only';
import { NavLink } from './_components/nav-link';
import { PublicMenuLink, RestaurantMonogram } from './_components/public-menu';

type NavKey = 'home' | 'orders' | 'menu' | 'stats' | 'qr' | 'settings' | 'help';
type NavItem = { key: NavKey; href: string; icon: LucideIcon; short?: 'statsShort'; badge?: boolean; external?: boolean };

const MAIN: NavItem[] = [
  { key: 'home', href: '/', icon: House },
  { key: 'orders', href: '/commandes', icon: ReceiptText, badge: true },
  { key: 'menu', href: '/menu', icon: BookOpen },
  { key: 'stats', href: '/statistiques', icon: ChartColumn, short: 'statsShort' },
  { key: 'qr', href: '/qr-code', icon: QrCode },
];
const SETTINGS: NavItem = { key: 'settings', href: '/reglages', icon: Settings };
const TABBAR = [...MAIN.filter((i) => i.key !== 'qr'), SETTINGS];

// Pages liées à la session : pas de tentative de rendu statique au build.
export const dynamic = 'force-dynamic';

const pastille = 'grid h-5 min-w-5 place-items-center rounded-full border-2 bg-status-danger px-1 text-xs font-bold leading-none text-surface tabular';
// Planche « .side nav a » : 44 px, rayon 12 ; rail : 48 px, rayon 14.
const sideLinkClass =
  'relative mx-auto flex size-12 items-center justify-center rounded-[14px] text-[0.9375rem] font-medium text-text-2 transition-colors hover:bg-sunken hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:font-bold aria-[current=page]:text-surface side-full:mx-0 side-full:h-11 side-full:w-full side-full:justify-start side-full:gap-3 side-full:rounded-[12px] side-full:px-3';

// Toute page de l'application restaurateur exige une session vérifiée ET un restaurant.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { restaurantId } = await requireMembership();
  const [restaurant, pending, unread, t] = await Promise.all([getRestaurantSummary(restaurantId), getPendingCount(restaurantId), getUnreadCount(restaurantId), getTranslations('shell')]);
  const pendingLabel = t('pending', { count: pending });
  const helpUrl = env().HELP_CENTER_URL;
  const other: NavItem[] = [SETTINGS, ...(helpUrl ? [{ key: 'help', href: helpUrl, icon: CircleHelp, external: true } as const] : [])];

  // Barre latérale : rail d'icônes de 768 à 1023 px, barre complète à partir de 1024 px.
  const sideLink = (item: NavItem) => {
    const content = (
      <>
        <item.icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.75} />
        <span className="sr-only side-full:not-sr-only">{t(`nav.${item.key}`)}</span>
        {item.badge && pending > 0 && (
          <>
            <span className="sr-only">, {pendingLabel}</span>
            <span aria-hidden="true" className={`${pastille} absolute -right-1 -top-1 border-surface side-full:hidden`}>{pending}</span>
            <span aria-hidden="true" className="ml-auto hidden h-6 min-w-6 place-items-center rounded-full bg-status-danger px-[7px] text-xs font-bold text-surface tabular side-full:grid">{pending}</span>
          </>
        )}
      </>
    );
    return (
      <li key={item.key}>
        {item.external ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" title={t(`nav.${item.key}`)} className={sideLinkClass}>
            {content}
          </a>
        ) : (
          <NavLink href={item.href} className={sideLinkClass}>
            {content}
          </NavLink>
        )}
      </li>
    );
  };

  return (
    <ShellFrame className="min-h-dvh md:grid md:grid-cols-[76px_minmax(0,1fr)] side-full:grid-cols-[248px_minmax(0,1fr)]">
      <a href="#contenu" className="sr-only z-50 rounded-full bg-ink px-4 py-3 font-bold text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t('skip')}
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-line bg-surface px-3.5 pb-4 pt-6 md:flex side-full:px-4">
        <div className="flex h-10 items-center justify-center gap-2.5 side-full:justify-start side-full:px-2">
          <Image src="/brand/restio-mark-ink.png" alt="" width={32} height={32} className="size-8 side-full:size-[30px]" />
          <span className="sr-only text-[1.3125rem] font-bold tracking-[-0.02em] side-full:not-sr-only">Restio</span>
        </div>
        <p className="hidden px-3 pb-2 pt-7 text-[0.8125rem] font-medium text-text-3 side-full:block">{t('mainGroup')}</p>
        <nav aria-label={t('mainNav')} className="mt-5 side-full:mt-0">
          <ul className="grid gap-1.5 side-full:gap-0.5">{MAIN.map(sideLink)}</ul>
        </nav>
        <hr className="mx-auto my-3 w-8 border-line side-full:hidden" />
        <p className="hidden px-3 pb-2 pt-7 text-[0.8125rem] font-medium text-text-3 side-full:block">{t('otherGroup')}</p>
        <nav aria-label={t('otherNav')}>
          <ul className="grid gap-1.5 side-full:gap-0.5">{other.map(sideLink)}</ul>
        </nav>

        <div className="mt-auto hidden gap-3 rounded-lg bg-ground p-3.5 side-full:grid">
          <div className="flex min-w-0 items-center gap-2.5">
            <RestaurantMonogram name={restaurant.name} logoUrl={restaurant.logoUrl} />
            <div className="grid min-w-0">
              <b className="truncate text-[0.9375rem]">{restaurant.name}</b>
              {/* Planche « Service ouvert » : en attendant les horaires de service, l'état réel du menu. */}
              <span className={cn('inline-flex items-center gap-1.5 text-[0.8125rem] font-bold', restaurant.isPublished ? 'text-status-ok' : 'text-text-2')}>
                <i aria-hidden="true" className={cn('size-2 rounded-full', restaurant.isPublished ? 'bg-status-ok' : 'bg-text-3')} />
                {restaurant.isPublished ? t('menuOnline') : t('menuOffline')}
              </span>
            </div>
          </div>
          <PublicMenuLink slug={restaurant.slug} isPublished={restaurant.isPublished} className="w-full" />
        </div>
        <div className="mx-auto mt-auto side-full:hidden" title={restaurant.name}>
          <RestaurantMonogram name={restaurant.name} logoUrl={restaurant.logoUrl} />
          <span className="sr-only">{restaurant.name}</span>
        </div>
      </aside>

      <div className="min-w-0">
        <HomeOnly>
        <header className="sticky top-0 z-20 flex items-center gap-2.5 bg-ground px-4 pb-3 pt-[max(8px,env(safe-area-inset-top))] md:hidden">
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-ink">
            <Image src="/brand/restio-mark-lime.png" alt="Restio" width={26} height={26} className="size-[26px]" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-base">{restaurant.name}</b>
            <span className={cn('inline-flex items-center gap-1.5 text-[0.8125rem] font-bold', restaurant.isPublished ? 'text-status-ok' : 'text-text-2')}>
              <i aria-hidden="true" className={cn('size-2 rounded-full', restaurant.isPublished ? 'bg-status-ok' : 'bg-text-3')} />
              {restaurant.isPublished ? t('menuOnline') : t('menuOffline')}
            </span>
          </div>
          <Link href="/notifications" aria-label={t('newOrders', { count: unread })} className="relative grid size-12 shrink-0 place-items-center rounded-full hover:bg-sunken">
            <Bell aria-hidden="true" className="size-[22px]" strokeWidth={1.75} />
            {unread > 0 && (
              <span aria-hidden="true" className={`${pastille} absolute right-1 top-1 border-ground`}>
                {unread}
              </span>
            )}
          </Link>
        </header>
        </HomeOnly>

        <main id="contenu" className="mx-auto w-full side-full:max-w-[1400px] px-4 pb-[calc(104px+env(safe-area-inset-bottom))] pt-2 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      <TabBarFrame>
      <nav aria-label={t('mainNav')} className="fixed inset-x-0 bottom-0 z-30 bg-ink px-1.5 pb-[max(14px,env(safe-area-inset-bottom))] pt-2 md:hidden">
        <ul className="grid grid-cols-5">
          {TABBAR.map((item) => (
            <li key={item.key} className="min-w-0">
              <NavLink
                href={item.href}
                className="group grid min-h-12 justify-items-center gap-1 rounded-[14px] py-1 text-xs font-bold text-on-dark-2 focus-visible:outline-lime aria-[current=page]:text-surface"
              >
                <span className="relative grid h-[30px] w-12 place-items-center rounded-full group-aria-[current=page]:bg-lime group-aria-[current=page]:text-ink">
                  <item.icon aria-hidden="true" className="size-[22px]" strokeWidth={1.75} />
                  {item.badge && pending > 0 && (
                    <span aria-hidden="true" className={`${pastille} absolute -top-1.5 right-0 border-ink`}>
                      {pending}
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate">{t(`nav.${item.short ?? item.key}`)}</span>
                {item.badge && pending > 0 && <span className="sr-only">, {pendingLabel}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      </TabBarFrame>
    </ShellFrame>
  );
}
