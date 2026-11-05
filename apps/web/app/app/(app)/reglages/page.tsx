import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { LucideIcon } from 'lucide-react';
import { Bell, ChevronRight, ExternalLink, Globe, LifeBuoy, Link as LinkIcon, Lock, MessageCircle, Palette, QrCode, Store, User } from 'lucide-react';
import { signOutAction } from '@/lib/auth/actions';
import { requireMembership } from '@/lib/auth/session';
import { getRestaurantSummary } from '@/lib/dashboard/queries';
import { env } from '@/lib/env';
import { getProfile } from '@/lib/onboarding/state';
import { MobileHead } from '../_components/mobile-head';
import { PageHeader } from '../_components/page-header';
import { PublicMenuLink, publicMenuUrl, RestaurantMonogram } from '../_components/public-menu';
import { SignOutButton } from '../_components/sign-out-button';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('settings'))('metaTitle') };
}

type Row = { key: string; icon: LucideIcon; label: string; value?: string; sub?: string; href?: string; external?: boolean };

const list = 'overflow-hidden rounded-lg border border-line bg-surface';
const rowClass = 'flex min-h-14 items-center gap-3 px-3 py-2 transition-colors hover:bg-ground md:min-h-[60px] md:gap-3.5 md:px-3.5 md:py-2.5';

function SettingsGroup({ id, title, rows, newTab, className }: { id: string; title: string; rows: Row[]; newTab: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={`grid gap-2 ${className ?? ''}`}>
      <h2 id={id} className="px-1 text-sm font-medium text-text-2">{title}</h2>
      <ul className={list}>
        {rows.filter((row) => row.href).map((row) => {
          const body = (
            <>
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-sm bg-sunken">
                <row.icon className="size-[18px]" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-[0.9375rem] font-medium md:text-base">
                {row.label}
                {row.sub && <small className="block truncate text-sm font-normal text-text-2">{row.sub}</small>}
              </span>
              {row.value && <span className="max-w-[40%] truncate text-sm text-text-2 md:text-[0.9375rem]">{row.value}</span>}
            </>
          );
          return (
            <li key={row.key} className="border-t border-line first:border-t-0">
              {row.external ? (
                <a href={row.href} target="_blank" rel="noopener noreferrer" className={rowClass}>
                  {body}
                  <ExternalLink aria-hidden="true" className="size-[18px] shrink-0 text-text-2" strokeWidth={1.75} />
                  <span className="sr-only">{newTab}</span>
                </a>
              ) : (
                <Link href={row.href ?? '/reglages'} className={rowClass}>
                  {body}
                  <ChevronRight aria-hidden="true" className="size-[18px] shrink-0 text-text-2" strokeWidth={1.75} />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function SettingsPage() {
  const { restaurantId, user } = await requireMembership();
  const [restaurant, profile, t, tc, locale] = await Promise.all([getRestaurantSummary(restaurantId), getProfile(user.id), getTranslations('settings'), getTranslations('common'), getLocale()]);
  const address = publicMenuUrl(restaurant.slug).label;
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
  const { WHATSAPP_COMMUNITY_URL, HELP_CENTER_URL } = env();
  const assistance: Row[] = [
    { key: 'whatsapp', icon: MessageCircle, label: t('rows.whatsapp'), href: WHATSAPP_COMMUNITY_URL, external: true },
    { key: 'help', icon: LifeBuoy, label: t('rows.helpCenter'), href: HELP_CENTER_URL, external: true },
  ];

  return (
    <>
      <MobileHead title={t('title')} />
      <div className="hidden md:block">
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center md:mt-8 md:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <RestaurantMonogram name={restaurant.name} logoUrl={restaurant.logoUrl} className="size-[52px] rounded-[16px] text-[22px] md:size-16 md:rounded-[18px] md:text-[26px]" />
          <div className="min-w-0">
            <b className="block truncate text-[1.0625rem] font-bold tracking-[-0.01em] md:text-xl">{restaurant.name}</b>
            <span className="block truncate text-sm text-text-2">{address}</span>
          </div>
        </div>
        <PublicMenuLink slug={restaurant.slug} isPublished={restaurant.isPublished} className="h-12 shrink-0 px-5 text-base" />
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
        <SettingsGroup
          id="reglages-restaurant"
          title={t('groups.restaurant')}
          newTab={tc('newTab')}
          className="lg:col-start-1 lg:row-start-1"
          rows={[
            { key: 'info', icon: Store, label: t('rows.info'), value: restaurant.name, href: '/reglages/informations' },
            { key: 'address', icon: LinkIcon, label: t('rows.address'), sub: address, href: '/reglages/adresse' },
            { key: 'appearance', icon: Palette, label: t('rows.appearance'), href: '/reglages/apparence' },
            { key: 'qr', icon: QrCode, label: t('rows.qr'), href: '/qr-code' },
          ]}
        />
        <SettingsGroup
          id="reglages-compte"
          title={t('groups.account')}
          newTab={tc('newTab')}
          className="lg:col-start-2 lg:row-start-1"
          rows={[
            { key: 'profile', icon: User, label: t('rows.profile'), value: fullName || user.email, href: '/reglages/profil' },
            { key: 'password', icon: Lock, label: t('rows.password'), href: '/reglages/mot-de-passe' },
            { key: 'notifications', icon: Bell, label: t('rows.notifications'), href: '/reglages/notifications' },
            { key: 'language', icon: Globe, label: t('rows.language'), value: tc(`languages.${locale as 'fr' | 'en'}`), href: '/reglages/langue' },
          ]}
        />
        {assistance.some((row) => row.href) && <SettingsGroup id="reglages-assistance" title={t('groups.help')} newTab={tc('newTab')} className="lg:col-start-1 lg:row-start-2" rows={assistance} />}
        <section aria-label={t('session')} className="lg:col-start-2 lg:row-start-2 lg:mt-7">
          <form action={signOutAction} className={list}>
            <SignOutButton />
          </form>
        </section>
      </div>
    </>
  );
}
