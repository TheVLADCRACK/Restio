import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ArrowLeft, Bell, ChevronRight, Globe, Link as LinkIcon, Lock, Palette, QrCode, Store, User, type LucideIcon } from 'lucide-react';
import { NavLink } from '../../_components/nav-link';

const GROUPS: { title: 'groups.restaurant' | 'groups.account'; rows: { href: string; label: 'info' | 'address' | 'appearance' | 'qr' | 'profile' | 'password' | 'notifications' | 'language'; icon: LucideIcon }[] }[] = [
  {
    title: 'groups.restaurant',
    rows: [
      { href: '/reglages/informations', label: 'info', icon: Store },
      { href: '/reglages/adresse', label: 'address', icon: LinkIcon },
      { href: '/reglages/apparence', label: 'appearance', icon: Palette },
      { href: '/qr-code', label: 'qr', icon: QrCode },
    ],
  },
  {
    title: 'groups.account',
    rows: [
      { href: '/reglages/profil', label: 'profile', icon: User },
      { href: '/reglages/mot-de-passe', label: 'password', icon: Lock },
      { href: '/reglages/notifications', label: 'notifications', icon: Bell },
      { href: '/reglages/langue', label: 'language', icon: Globe },
    ],
  },
];

/** Gabarit commun : fil d'Ariane et menu à gauche sur ordinateur ; barre de titre avec retour sur mobile. */
export async function SettingsShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const t = await getTranslations('settings');
  return (
    <>
      <div className="-mx-4 -mt-2 grid h-[calc(52px+env(safe-area-inset-top))] grid-cols-[48px_minmax(0,1fr)_48px] items-center px-1 pt-[env(safe-area-inset-top)] md:hidden">
        <Link href="/reglages" aria-label={t('back')} className="grid size-12 place-items-center rounded-full hover:bg-sunken">
          <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </Link>
        <h1 className="truncate text-center text-[1.0625rem] font-bold">{title}</h1>
      </div>
      <header className="hidden min-h-14 md:block">
        <nav aria-label={t('breadcrumb')} className="mb-1 flex items-center gap-1 text-sm text-text-2">
          <Link href="/reglages" className="hover:text-ink">{t('title')}</Link>
          <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
          <span aria-current="page">{title}</span>
        </nav>
        <h1 className="text-[1.875rem] font-bold leading-[1.15] tracking-[-0.02em]">{title}</h1>
        <p className="mt-1 text-[0.9375rem] text-text-2">{subtitle}</p>
      </header>
      <div className="mt-1 md:mt-6 lg:grid lg:grid-cols-[280px_minmax(0,760px)] lg:items-start lg:gap-6">
        <nav aria-label={t('title')} className="hidden gap-0.5 rounded-lg border border-line bg-surface p-3 lg:grid">
          {GROUPS.map((group) => (
            <div key={group.title} className="grid gap-0.5 [&:not(:first-child)]:mt-3">
              <p className="px-3 pb-1 pt-1.5 text-[0.8125rem] font-medium text-text-3">{t(group.title)}</p>
              {group.rows.map((row) => (
                <NavLink key={row.href} href={row.href} className="flex h-11 items-center gap-3 rounded-[12px] px-3 text-[0.9375rem] font-medium text-text-2 hover:bg-sunken hover:text-ink aria-[current=page]:bg-lime-soft aria-[current=page]:font-bold aria-[current=page]:text-ink">
                  <row.icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                  {t(`rows.${row.label}`)}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
