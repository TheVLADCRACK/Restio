import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExternalLink, TriangleAlert } from 'lucide-react';
import { formatMoney, isValidSlug } from '@restio/core';
import { buttonClass } from '@restio/ui/components/button';
import { requireAdmin } from '@/lib/auth/session';
import { getRestaurantDetail } from '@/lib/admin/queries';
import { env } from '@/lib/env';
import { card, clock, fmt, Kpi, longDate, PageHead, providerLabel, relativeDay, shortDate, StatusBadge } from '../../_components/ui';
import { SuspendButton } from './suspend-button';

export const metadata: Metadata = { title: 'Fiche restaurant' };

const ACTIONS: Record<string, string> = { 'restaurant.suspended': 'Restaurant suspendu', 'restaurant.reactivated': 'Restaurant réactivé' };

function Kvl({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-3.5 grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[0.9375rem] lg:grid-cols-[140px_minmax(0,1fr)]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-text-2">{label}</dt>
          <dd className="min-w-0 truncate font-medium" title={value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const r = await getRestaurantDetail(slug);
  if (!r) notFound();
  const money = (amount: string) => formatMoney(amount, r.currency, 'fr-FR');
  const salesParts = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: r.currency }).formatToParts(Number(r.sales30));
  const salesValue = salesParts.filter((p) => p.type !== 'currency' && p.type !== 'literal').map((p) => p.value).join('');
  const unit = salesParts.find((p) => p.type === 'currency')?.value;
  const average = r.counted30 > 0 ? (Number(r.sales30) / r.counted30).toFixed(2) : null;
  const status = r.isSuspended ? 'stop' : r.dishes === 0 ? 'cfg' : 'ok';
  const menuUrl = `${env().PUBLIC_MENU_ORIGIN}/@${r.slug}`;
  const refusedRate = r.orders30 > 0 ? new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(r.refused30 / r.orders30) : '0 %';
  const log = [...r.log.map((entry) => ({ title: ACTIONS[entry.action] ?? entry.action, at: entry.at })), { title: 'Restaurant créé', at: r.createdAt }];
  return (
    <>
      <PageHead
        title={r.name}
        subtitle={`${r.city} · inscrit le ${longDate(r.createdAt)}`}
        crumb={{ href: '/restaurants', label: 'Restaurants' }}
        actions={
          <>
            <a href={menuUrl} target="_blank" rel="noopener noreferrer" className={buttonClass()}>
              <ExternalLink aria-hidden="true" className="size-5" strokeWidth={1.75} />
              Voir le menu public
            </a>
            <SuspendButton id={r.id} suspended={r.isSuspended} />
          </>
        }
      />
      {r.deletionRequestedAt && (
        <p role="note" className="flex gap-2.5 rounded-md bg-status-new-bg px-3.5 py-3 text-sm font-medium text-status-new">
          <TriangleAlert aria-hidden="true" className="mt-px size-[18px] shrink-0" strokeWidth={1.75} />
          Suppression du compte demandée par le propriétaire le {longDate(r.deletionRequestedAt)}.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-6">
        <Kpi title="Commandes 30 j" value={fmt(r.orders30)} foot="Moyenne" side={<span className="tabular">{fmt(Math.round(r.orders30 / 30))} par jour</span>} />
        <Kpi title="Ventes 30 j" value={salesValue} unit={unit} foot="Panier moyen" side={<span className="tabular">{average ? money(average) : '—'}</span>} />
        <div className="hidden lg:grid">
          <Kpi title="Refusées" value={fmt(r.refused30)} foot="Sur 30 jours" side={<span className="tabular">{refusedRate}</span>} />
        </div>
        <div className="hidden lg:grid">
          <Kpi title="Abonnement" value="Gratuit" foot="Paiements non activés" />
        </div>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-6">
        <article className={card}>
          <div className="flex min-h-7 items-center gap-3">
            <h3 className="text-lg font-bold leading-[1.3]">Restaurant</h3>
            <span className="ml-auto"><StatusBadge status={status} /></span>
          </div>
          <Kvl rows={[['Adresse', `@${r.slug}`], ['Ville', `${r.city}, ${r.country}`], ['Devise', r.currency], ['Fuseau', r.timezone], ['Menu', `${r.isPublished ? 'Publié' : 'Non publié'} · ${fmt(r.dishes)} plat${r.dishes > 1 ? 's' : ''}`], ['Inscrit', longDate(r.createdAt)]]} />
        </article>
        <article className={card}>
          <h3 className="flex min-h-7 items-center text-lg font-bold leading-[1.3]">Propriétaire</h3>
          <Kvl rows={[['Nom', r.owner.name || '—'], ['E-mail', r.owner.email || '—'], ['Vérifié', r.owner.verified ? 'Oui' : 'Non'], ['Téléphone', r.owner.phone || '—'], ['Connexion', r.owner.providers ? providerLabel(r.owner.providers) : '—'], ['Dernière visite', r.owner.lastSeen ? `${relativeDay(r.owner.lastSeen)}, ${clock(r.owner.lastSeen)}` : '—']]} />
        </article>
        <article className={card}>
          <h3 className="flex min-h-7 items-center text-lg font-bold leading-[1.3]">Journal</h3>
          <ul className="mt-1.5">
            {log.map((entry, index) => (
              <li key={index} className="grid grid-cols-[1fr_auto] gap-x-3 border-t border-line py-2.5 text-sm first:border-t-0">
                <b className="font-medium">{entry.title}</b>
                <time className="text-text-2 tabular">{shortDate(entry.at)}</time>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <div className="grid gap-2 lg:hidden">
        <a href={menuUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ block: true })}>
          <ExternalLink aria-hidden="true" className="size-5" strokeWidth={1.75} />
          Voir le menu public
        </a>
        <SuspendButton id={r.id} suspended={r.isSuspended} block />
      </div>
    </>
  );
}
