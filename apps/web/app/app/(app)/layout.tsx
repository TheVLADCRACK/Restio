import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Bell, BookOpen, ChartColumn, House, QrCode, ReceiptText, Settings } from 'lucide-react';
import { requireMembership } from '@/lib/auth/session';
import { getPendingCount, getRestaurantSummary } from '@/lib/dashboard/queries';
import { NavLink } from './_components/nav-link';
import { PublicMenuLink, RestaurantMonogram } from './_components/public-menu';

type NavItem = { href: string; label: string; short?: string; icon: LucideIcon; badge?: boolean };

const MAIN: NavItem[] = [
  { href: '/', label: 'Accueil', icon: House },
  { href: '/commandes', label: 'Commandes', icon: ReceiptText, badge: true },
  { href: '/menu', label: 'Menu', icon: BookOpen },
  { href: '/statistiques', label: 'Statistiques', short: 'Stats', icon: ChartColumn },
  { href: '/qr-code', label: 'QR Code', icon: QrCode },
];
const OTHER: NavItem[] = [{ href: '/reglages', label: 'Réglages', icon: Settings }];
const TABBAR = [...MAIN.filter((i) => i.href !== '/qr-code'), ...OTHER];

// Pages liées à la session : pas de tentative de rendu statique au build.
export const dynamic = 'force-dynamic';

const pastille ='grid h-5 min-w-5 place-items-center rounded-full border-2 bg-status-danger px-1 text-xs font-bold leading-none text-surface tabular';

// Toute page de l'application restaurateur exige une session vérifiée ET un restaurant.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { restaurantId } = await requireMembership();
  const [restaurant, pending] = await Promise.all([getRestaurantSummary(restaurantId), getPendingCount(restaurantId)]);
  const pendingLabel = pending > 0 ? `, ${pending} ${pending > 1 ? 'nouvelles' : 'nouvelle'}` : '';

  // Barre latérale : rail d'icônes de 768 à 1023 px, barre complète à partir de 1024 px.
  const sideLink = (item: NavItem) => (
    <li key={item.href}>
      <NavLink
        href={item.href}
        className="relative mx-auto flex size-12 items-center justify-center rounded-md text-[0.9375rem] font-medium text-text-2 transition-colors hover:bg-sunken hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:font-bold aria-[current=page]:text-surface lg:mx-0 lg:h-11 lg:w-full lg:justify-start lg:gap-3 lg:rounded-[12px] lg:px-3"
      >
        <item.icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.75} />
        <span className="sr-only lg:not-sr-only">{item.label}</span>
        {item.badge && pending > 0 && (
          <>
            <span className="sr-only">{pendingLabel}</span>
            <span aria-hidden="true" className={`${pastille} absolute -right-1 -top-1 border-surface lg:hidden`}>{pending}</span>
            <span aria-hidden="true" className="ml-auto hidden h-6 min-w-6 place-items-center rounded-full bg-status-danger px-[7px] text-xs font-bold text-surface tabular lg:grid">{pending}</span>
          </>
        )}
      </NavLink>
    </li>
  );

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[248px_minmax(0,1fr)]">
      <a href="#contenu" className="sr-only z-50 rounded-full bg-ink px-4 py-3 font-bold text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Aller au contenu
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-line bg-surface px-5 pb-4 pt-6 md:flex lg:px-4">
        <div className="flex h-10 items-center justify-center gap-2.5 lg:justify-start lg:px-2">
          <Image src="/brand/restio-mark-ink.png" alt="" width={32} height={32} className="size-8 lg:size-[30px]" />
          <span className="sr-only text-[1.3125rem] font-bold tracking-[-0.02em] lg:not-sr-only">Restio</span>
        </div>
        <p className="hidden px-3 pb-2 pt-7 text-[0.8125rem] font-medium text-text-3 lg:block">Menu principal</p>
        <nav aria-label="Navigation principale" className="mt-5 lg:mt-0">
          <ul className="grid gap-1.5 lg:gap-0.5">{MAIN.map(sideLink)}</ul>
        </nav>
        <hr className="mx-auto my-3 w-8 border-line lg:hidden" />
        <p className="hidden px-3 pb-2 pt-7 text-[0.8125rem] font-medium text-text-3 lg:block">Autres</p>
        <nav aria-label="Autres pages">
          <ul className="grid gap-0.5">{OTHER.map(sideLink)}</ul>
        </nav>

        <div className="mt-auto hidden gap-3 rounded-lg bg-ground p-3.5 lg:grid">
          <div className="flex min-w-0 items-center gap-2.5">
            <RestaurantMonogram name={restaurant.name} />
            <div className="grid min-w-0">
              <b className="truncate text-[0.9375rem]">{restaurant.name}</b>
              <span className="truncate text-sm text-text-2">@{restaurant.slug}</span>
            </div>
          </div>
          <PublicMenuLink slug={restaurant.slug} isPublished={restaurant.isPublished} compact className="w-full" />
        </div>
        <div className="mx-auto mt-auto lg:hidden" title={restaurant.name}>
          <RestaurantMonogram name={restaurant.name} />
          <span className="sr-only">{restaurant.name}</span>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-2.5 bg-ground px-4 pb-3 pt-[max(8px,env(safe-area-inset-top))] md:hidden">
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-ink">
            <Image src="/brand/restio-mark-lime.png" alt="Restio" width={26} height={26} className="size-[26px]" />
          </span>
          <b className="min-w-0 flex-1 truncate text-base">{restaurant.name}</b>
          <Link href="/commandes" aria-label={`Nouvelles commandes${pendingLabel || ' : aucune'}`} className="relative grid size-12 shrink-0 place-items-center rounded-full hover:bg-sunken">
            <Bell aria-hidden="true" className="size-[22px]" strokeWidth={1.75} />
            {pending > 0 && (
              <span aria-hidden="true" className={`${pastille} absolute right-1 top-1 border-ground`}>
                {pending}
              </span>
            )}
          </Link>
        </header>

        <main id="contenu" className="mx-auto w-full max-w-[1400px] px-4 pb-[calc(104px+env(safe-area-inset-bottom))] pt-2 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-30 bg-ink px-1.5 pb-[max(14px,env(safe-area-inset-bottom))] pt-2 md:hidden">
        <ul className="grid grid-cols-5">
          {TABBAR.map((item) => (
            <li key={item.href} className="min-w-0">
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
                <span className="max-w-full truncate">{item.short ?? item.label}</span>
                {item.badge && pending > 0 && <span className="sr-only">{pendingLabel}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
