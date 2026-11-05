import Image from 'next/image';
import { LayoutDashboard, LogOut, Settings, Store, Users, type LucideIcon } from 'lucide-react';
import { buttonClass } from '@restio/ui/components/button';
import { adminSignOutAction } from '@/lib/auth/actions';
import { requireAdmin } from '@/lib/auth/session';
import { initials } from './_components/ui';
import { NavLink } from './_components/nav-link';

export const dynamic = 'force-dynamic';

type Item = { href: string; label: string; short?: string; icon: LucideIcon };
const MAIN: Item[] = [
  { href: '/', label: 'Vue d’ensemble', short: 'Accueil', icon: LayoutDashboard },
  { href: '/restaurants', label: 'Restaurants', icon: Store },
  { href: '/comptes', label: 'Comptes', icon: Users },
];
const OTHER: Item[] = [{ href: '/reglages', label: 'Réglages', icon: Settings }];
const sideLink = 'flex h-11 items-center gap-3 rounded-[12px] px-3 text-[0.9375rem] font-medium text-text-2 transition-colors hover:bg-sunken hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:font-bold aria-[current=page]:text-surface';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const name = admin.email.split('@')[0] ?? admin.email;
  const link = (item: Item) => (
    <NavLink key={item.href} href={item.href} className={sideLink}>
      <item.icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.75} />
      {item.label}
    </NavLink>
  );
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-line bg-surface px-4 pb-4 pt-6 lg:flex">
        <span className="flex h-10 items-center gap-2.5 px-2">
          <Image src="/brand/restio-mark-ink.png" alt="" width={30} height={30} />
          <b className="text-[1.3125rem] font-bold tracking-[-0.02em]">Restio</b>
          <span className="grid h-[22px] place-items-center rounded-full bg-ink px-2 text-[0.6875rem] font-black tracking-[.04em] text-lime">Admin</span>
        </span>
        <p className="px-3 pb-2 pt-7 text-[0.8125rem] font-medium text-text-3">Pilotage</p>
        <nav aria-label="Navigation de l’administration" className="grid gap-0.5">{MAIN.map(link)}</nav>
        <p className="px-3 pb-2 pt-7 text-[0.8125rem] font-medium text-text-3">Autres</p>
        <nav aria-label="Autres pages" className="grid gap-0.5">{OTHER.map(link)}</nav>
        <div className="mt-auto grid gap-3 rounded-lg bg-ground p-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken font-bold">{initials(name)}</span>
            <div className="min-w-0">
              <b className="block truncate text-[0.9375rem]">{name}</b>
              <span className="block text-[0.8125rem] text-text-2">Administrateur</span>
            </div>
          </div>
          <form action={adminSignOutAction}>
            <button type="submit" className={buttonClass({ size: 'sm', block: true })}>
              <LogOut aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <main id="contenu" className="mx-auto grid w-full max-w-[1400px] content-start gap-4 px-4 pb-[calc(104px+env(safe-area-inset-bottom))] pt-2 lg:gap-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
      <nav aria-label="Navigation de l’administration" className="fixed inset-x-0 bottom-0 z-30 bg-ink px-1.5 pb-[max(14px,env(safe-area-inset-bottom))] pt-2 lg:hidden">
        <ul className="grid grid-cols-4">
          {[...MAIN, ...OTHER].map((item) => (
            <li key={item.href} className="min-w-0">
              <NavLink href={item.href} className="group grid min-h-12 justify-items-center gap-1 rounded-[14px] py-1 text-xs font-bold text-on-dark-2 aria-[current=page]:text-surface">
                <span className="grid h-[30px] w-12 place-items-center rounded-full group-aria-[current=page]:bg-lime group-aria-[current=page]:text-ink">
                  <item.icon aria-hidden="true" className="size-[22px]" strokeWidth={1.75} />
                </span>
                <span className="max-w-full truncate">{item.short ?? item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
