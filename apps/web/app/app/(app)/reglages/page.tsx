import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import { Bell, Globe, LifeBuoy, Link as LinkIcon, Lock, MessageCircle, Palette, QrCode, Store, User } from 'lucide-react';
import { signOutAction } from '@/lib/auth/actions';
import { requireMembership } from '@/lib/auth/session';
import { getRestaurantSummary } from '@/lib/dashboard/queries';
import { getProfile } from '@/lib/onboarding/state';
import { PageHeader } from '../_components/page-header';
import { PublicMenuLink, publicMenuUrl, RestaurantMonogram } from '../_components/public-menu';
import { SignOutButton } from '../_components/sign-out-button';

export const metadata: Metadata = { title: 'Réglages' };

type Row = { icon: LucideIcon; label: string; value?: string; sub?: string };

const list = 'overflow-hidden rounded-lg border border-line bg-surface';

// Lignes visibles mais pas encore actives (aria-disabled) : seule la déconnexion fonctionne.
function SettingsGroup({ title, rows, className }: { title: string; rows: Row[]; className?: string }) {
  const id = `reglages-${title.toLowerCase()}`;
  return (
    <section aria-labelledby={id} className={`grid gap-2 ${className ?? ''}`}>
      <h2 id={id} className="px-1 text-sm font-medium text-text-2">
        {title}
      </h2>
      <ul className={list}>
        {rows.map((row) => (
          <li key={row.label} className="border-t border-line first:border-t-0">
            <div role="link" aria-disabled="true" className="flex min-h-14 cursor-not-allowed items-center gap-3 px-3 py-2 md:min-h-[60px] md:gap-3.5 md:px-3.5 md:py-2.5">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-sm bg-sunken">
                <row.icon className="size-[18px]" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-[0.9375rem] font-medium md:text-base">
                {row.label}
                {row.sub && <small className="block truncate text-sm font-normal text-text-2">{row.sub}</small>}
              </span>
              {row.value && <span className="max-w-[40%] truncate text-sm text-text-2 md:text-[0.9375rem]">{row.value}</span>}
              <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-xs font-bold text-text-2">Bientôt</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function SettingsPage() {
  const { restaurantId, user } = await requireMembership();
  const [restaurant, profile] = await Promise.all([getRestaurantSummary(restaurantId), getProfile(user.id)]);
  const address = publicMenuUrl(restaurant.slug).label;
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');

  return (
    <>
      <PageHeader title="Réglages" subtitle="Votre restaurant, votre compte et l’assistance." />

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center md:mt-8 md:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <RestaurantMonogram name={restaurant.name} className="size-[52px] rounded-[16px] text-[22px] md:size-16 md:rounded-[18px] md:text-[26px]" />
          <div className="min-w-0">
            <b className="block truncate text-[1.0625rem] font-bold tracking-[-0.01em] md:text-xl">{restaurant.name}</b>
            <span className="block truncate text-sm text-text-2">{address}</span>
          </div>
        </div>
        <PublicMenuLink slug={restaurant.slug} isPublished={restaurant.isPublished} className="h-12 shrink-0 px-5 text-base" />
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
        <SettingsGroup
          title="Restaurant"
          className="lg:col-start-1 lg:row-start-1"
          rows={[
            { icon: Store, label: 'Informations', value: restaurant.name },
            { icon: LinkIcon, label: 'Adresse publique', sub: address },
            { icon: Palette, label: 'Apparence du menu' },
            { icon: QrCode, label: 'QR Code et supports' },
          ]}
        />
        <SettingsGroup
          title="Compte"
          className="lg:col-start-2 lg:row-start-1"
          rows={[
            { icon: User, label: 'Profil', value: fullName || user.email },
            { icon: Lock, label: 'Mot de passe' },
            { icon: Bell, label: 'Notifications' },
            { icon: Globe, label: 'Langue', value: 'Français' },
          ]}
        />
        <SettingsGroup
          title="Assistance"
          className="lg:col-start-1 lg:row-start-2"
          rows={[
            { icon: MessageCircle, label: 'Rejoindre la communauté WhatsApp' },
            { icon: LifeBuoy, label: 'Centre d’aide' },
          ]}
        />
        <section aria-label="Session" className="lg:col-start-2 lg:row-start-2 lg:mt-7">
          <form action={signOutAction} className={list}>
            <SignOutButton />
          </form>
        </section>
      </div>
    </>
  );
}
