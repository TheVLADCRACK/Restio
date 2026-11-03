import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChartColumn,
  CircleCheck,
  Clock,
  ClockAlert,
  Download,
  EyeOff,
  Link as LinkIcon,
  MessageSquareText,
  Plus,
  QrCode,
  ReceiptText,
  UtensilsCrossed,
} from 'lucide-react';
import { formatMoney, sumAmounts } from '@restio/core';
import { buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { requireMembership } from '@/lib/auth/session';
import { getDashboard, type DashboardData } from '@/lib/dashboard/queries';
import { getProfile } from '@/lib/onboarding/state';
import { EmptyState } from '../_components/empty-state';
import { OrderStatusBadge } from '../_components/order-status-badge';
import { PageHeader } from '../_components/page-header';
import { PublicMenuLink, publicMenuUrl } from '../_components/public-menu';
import { ageLabel, averageAmount, compactNumber, dayLabel, minutesSince, moneyParts, niceMax, plural, tableLabel, todayLabel } from './format';

export const metadata: Metadata = { title: 'Accueil' };
export const dynamic = 'force-dynamic';

const card = 'min-w-0 rounded-lg border border-line bg-surface';

export default async function DashboardPage() {
  const { restaurantId, user } = await requireMembership();
  const [data, profile] = await Promise.all([getDashboard(restaurantId), getProfile(user.id)]);
  const { restaurant, today, pending, menu } = data;
  const currency = restaurant.currency;
  const firstName = profile?.firstName?.trim();
  const average = averageAmount(today.sales, today.orders);

  return (
    <>
      <PageHeader
        title={firstName ? `Bonjour, ${firstName}` : 'Bonjour'}
        subtitle={todayLabel(restaurant.timezone)}
        actions={
          <Link href="/menu" className={buttonClass({ variant: 'dark' })}>
            <Plus aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Ajouter un plat
          </Link>
        }
      />

      {/* Mobile : la carte noire d'abord, puis les chiffres ; à partir de 768 px, l'ordre de la planche. */}
      <div className="mt-6 grid grid-flow-row-dense grid-cols-2 gap-3 md:mt-8 md:gap-4 xl:grid-cols-4">
        <Kpi title="Commandes du jour" href="/commandes" goLabel="Voir les commandes" value={<span className="tabular">{today.orders}</span>} foot={<span>Depuis minuit</span>} />
        <Kpi
          title="Ventes du jour"
          href="/statistiques"
          goLabel="Voir les statistiques des ventes"
          className="col-span-2 md:col-span-1"
          value={<Money amount={today.sales} currency={currency} />}
          foot={<span>Hors refus et annulations</span>}
        />
        <Kpi
          title="Panier moyen"
          href="/statistiques"
          goLabel="Voir les statistiques"
          value={
            average ? (
              <Money amount={average} currency={currency} />
            ) : (
              <span>
                <span aria-hidden="true">—</span>
                <span className="sr-only">Aucune commande aujourd’hui</span>
              </span>
            )
          }
          foot={<span>Ventes ÷ commandes</span>}
        />
        <Kpi
          ink
          title="En attente"
          href="/commandes"
          goLabel="Traiter les commandes en attente"
          className="order-first col-span-2 md:order-none md:col-span-1"
          value={
            <>
              <span className="tabular">{pending.count}</span>
              <small className="text-lg font-medium tracking-normal text-on-dark-2">{pending.count > 1 ? 'commandes' : 'commande'}</small>
            </>
          }
          foot={
            pending.oldest ? (
              <>
                <span>La plus ancienne</span>
                <b className="inline-flex items-center gap-1.5 text-surface tabular">
                  <Clock aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  {ageLabel(minutesSince(pending.oldest))}
                </b>
              </>
            ) : (
              <span>Rien n’attend pour l’instant</span>
            )
          }
        />
      </div>

      <OrdersToHandle orders={data.activeOrders} currency={currency} hasDishes={menu.dishes > 0} />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SalesChart days={data.salesByDay} currency={currency} />
        <TopDishes dishes={data.topDishes} />
        <PublicMenuCard restaurant={restaurant} menu={menu} />
      </div>
    </>
  );
}

function Money({ amount, currency }: { amount: string; currency: string }) {
  const { value, unit } = moneyParts(amount, currency);
  return (
    <>
      <span className="tabular">{value}</span>
      {unit && <small className="text-lg font-medium tracking-normal text-text-3">{unit}</small>}
    </>
  );
}

function Kpi({ title, href, goLabel, value, foot, ink, className }: { title: string; href: string; goLabel: string; value: ReactNode; foot: ReactNode; ink?: boolean; className?: string }) {
  return (
    <article className={cn('flex min-w-0 flex-col gap-3.5 rounded-lg border p-4 pb-3.5 md:p-5 md:pb-4', ink ? 'border-ink bg-ink text-surface' : 'border-line bg-surface', className)}>
      <div className="flex min-h-11 items-center gap-3">
        <h2 className={cn('min-w-0 text-[0.9375rem] font-medium leading-tight', ink ? 'text-on-dark-2' : 'text-text-2')}>{title}</h2>
        <Link
          href={href}
          aria-label={goLabel}
          className={cn(
            'ml-auto size-11 shrink-0 place-items-center rounded-full border transition-colors',
            ink ? 'grid border-lime bg-lime text-ink hover:border-lime-pressed hover:bg-lime-pressed focus-visible:outline-lime' : 'hidden border-line-strong text-ink hover:bg-sunken md:grid',
          )}
        >
          {ink ? <ArrowRight aria-hidden="true" className="size-[18px]" strokeWidth={2} /> : <ArrowUpRight aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />}
        </Link>
      </div>
      <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-[1.875rem] font-bold leading-none tracking-[-0.03em] md:text-[2.25rem]">{value}</p>
      <div className={cn('mt-auto flex min-h-6 items-center justify-between gap-2 border-t pt-3 text-sm', ink ? 'border-ink-2 text-on-dark-2' : 'border-line text-text-2')}>{foot}</div>
    </article>
  );
}

function OrdersToHandle({ orders, currency, hasDishes }: { orders: DashboardData['activeOrders']; currency: string; hasDishes: boolean }) {
  return (
    <section aria-labelledby="todo-title" className="mt-8 grid gap-3.5">
      <div className="flex min-h-11 items-center gap-3">
        <h2 id="todo-title" className="text-xl font-bold tracking-[-0.01em]">
          Commandes à traiter
        </h2>
        <Link href="/commandes" className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[0.9375rem] font-bold underline-offset-4 hover:underline">
          <span className="sm:hidden">Tout voir</span>
          <span className="hidden sm:inline">Toutes les commandes</span>
          <ArrowRight aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
        </Link>
      </div>
      {orders.length === 0 ? (
        <div className={card}>
          <EmptyState icon={ReceiptText} title="Aucune commande à traiter" level={3}>
            {hasDishes
              ? 'Les commandes de vos tables s’afficheront ici, de la plus ancienne à la plus récente.'
              : 'Elles arriveront ici quand votre menu sera en ligne et que vos clients scanneront le QR Code.'}
          </EmptyState>
        </div>
      ) : (
        <ul className="grid items-start gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {orders.map((o) => (
            <li key={o.id} className="min-w-0">
              <OrderTicket order={o} currency={currency} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OrderTicket({ order, currency }: { order: DashboardData['activeOrders'][number]; currency: string }) {
  const minutes = minutesSince(order.createdAt);
  const shown = order.items.slice(0, 3);
  const more = order.items.length - shown.length;
  return (
    <article aria-label={`Commande ${order.number}`} className={cn(card, 'grid content-start gap-3 p-4')}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-[1.3] tracking-[-0.01em] tabular">#{order.number}</p>
          {minutes >= 5 ? (
            <>
              <p className="truncate text-sm text-text-2">{tableLabel(order.table)}</p>
              <p className={cn('mt-0.5 flex items-center gap-1 text-sm font-bold', minutes >= 10 ? 'text-status-danger' : 'text-status-new')}>
                {minutes >= 10 ? <ClockAlert aria-hidden="true" className="size-[15px] shrink-0" strokeWidth={2.25} /> : <Clock aria-hidden="true" className="size-[15px] shrink-0" strokeWidth={2.25} />}
                attend depuis {ageLabel(minutes)}
              </p>
            </>
          ) : (
            <p className="truncate text-sm text-text-2">
              {tableLabel(order.table)} · {minutes < 1 ? ageLabel(minutes) : `il y a ${ageLabel(minutes)}`}
            </p>
          )}
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      {shown.length > 0 && (
        <ul className="grid gap-1 text-[0.9375rem]">
          {shown.map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex gap-2.5">
              <span className="min-w-6 font-bold tabular">{item.quantity}×</span>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="whitespace-nowrap text-text-2 tabular">{formatMoney(item.lineTotal, currency, 'fr-FR')}</span>
            </li>
          ))}
        </ul>
      )}
      {more > 0 && <p className="text-sm text-text-2">+ {plural(more, 'autre article', 'autres articles')}</p>}
      {order.note && (
        <p className="flex gap-2 rounded-sm bg-ground px-2.5 py-2 text-sm text-text-2">
          <MessageSquareText aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          <span className="line-clamp-2 min-w-0 break-words">{order.note}</span>
        </p>
      )}
      <div className="flex justify-between gap-3 border-t border-dashed border-line-strong pt-2.5 font-bold">
        <span>Total</span>
        <span className="tabular">{formatMoney(order.total, currency, 'fr-FR')}</span>
      </div>
    </article>
  );
}

function SalesChart({ days, currency }: { days: DashboardData['salesByDay']; currency: string }) {
  const total = sumAmounts(days.map((d) => d.sales));
  const week = moneyParts(total, currency);
  const values = days.map((d) => Number(d.sales));
  const top = niceMax(Math.max(...values, 0));
  const average = averageAmount(total, days.length) ?? '0';
  const avgPct = (Number(average) / top) * 100;
  const labels = days.map((d) => dayLabel(d.day));
  const last = days.length - 1;
  const fmt = (amount: string) => formatMoney(amount, currency, 'fr-FR');
  const summary = `Ventes par jour : ${days.map((d, i) => `${i === last ? 'aujourd’hui' : `${labels[i]?.weekday} ${labels[i]?.date}`} ${fmt(d.sales)}`).join(', ')}. Moyenne ${fmt(average)}.`;

  return (
    <article className={cn(card, 'p-5 md:col-span-2')}>
      <h2 className="text-lg font-bold leading-[1.3]">Ventes des 7 derniers jours</h2>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">
        <span className="tabular">{week.value}</span>
        {week.unit && <small className="text-lg font-medium tracking-normal text-text-3">{week.unit}</small>}
      </p>
      {Number(total) === 0 ? (
        <EmptyState icon={ChartColumn} title="Pas encore de ventes" level={3} compact>
          Vos ventes des 7 derniers jours s’afficheront ici dès vos premières commandes.
        </EmptyState>
      ) : (
        <figure className="mt-6">
          <div role="img" aria-label={summary} className="pl-10 sm:pl-12">
            <div className="relative h-[196px]">
              {[0, 0.5, 1].map((f) => (
                <span key={f} aria-hidden="true" className={cn('absolute inset-x-0 border-t', f === 0 ? 'border-line-strong' : 'border-line')} style={{ bottom: `${f * 100}%` }}>
                  <em className="absolute right-[calc(100%+8px)] -top-2.5 whitespace-nowrap text-xs not-italic text-text-3 tabular">{compactNumber(top * f)}</em>
                </span>
              ))}
              <div aria-hidden="true" className="absolute inset-0 grid grid-cols-7 gap-2 px-1 sm:gap-4 sm:px-2">
                {values.map((v, i) => {
                  const pct = v > 0 ? Math.max((v / top) * 100, 1.5) : 0;
                  return (
                    <div key={days[i]?.day} className="relative flex items-end justify-center">
                      <i className={cn('block w-full max-w-11 rounded-[10px_10px_4px_4px]', i === last ? 'bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]' : 'bg-ink-2')} style={{ height: `${pct}%` }} />
                      {i === last && v > 0 && (
                        <span className="absolute right-0 z-[3] whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-surface tabular" style={{ bottom: `calc(${pct}% + 8px)` }}>
                          {fmt(days[i]?.sales ?? '0')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <span aria-hidden="true" className="absolute inset-x-0 z-[2] border-t-[1.5px] border-dashed border-text-2" style={{ bottom: `${avgPct}%` }} />
            </div>
            <div aria-hidden="true" className="grid grid-cols-7 gap-2 px-1 pt-2.5 text-center text-xs leading-tight text-text-3 sm:gap-4 sm:px-2">
              {labels.map((l, i) =>
                i === last ? (
                  <b key={i} className="text-ink">
                    <span className="sm:hidden">Auj.</span>
                    <span className="hidden sm:inline">Aujourd’hui</span>
                  </b>
                ) : (
                  <span key={i}>
                    <span className="block sm:inline">{l.weekday}</span> <span className="tabular">{l.date}</span>
                  </span>
                ),
              )}
            </div>
          </div>
          <figcaption className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8125rem] text-text-2 sm:pl-12">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <i aria-hidden="true" className="size-3 rounded-[4px] bg-ink-2" />
              Jours passés
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <i aria-hidden="true" className="size-3 rounded-[4px] bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]" />
              Aujourd’hui (en cours)
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <i aria-hidden="true" className="w-4 border-t-[1.5px] border-dashed border-text-2" />
              <span className="tabular">Moyenne {fmt(average)}</span>
            </span>
          </figcaption>
        </figure>
      )}
    </article>
  );
}

function TopDishes({ dishes }: { dishes: DashboardData['topDishes'] }) {
  const max = Math.max(...dishes.map((d) => d.quantity), 1);
  return (
    <article className={cn(card, 'flex flex-col p-5')}>
      <h2 className="text-lg font-bold leading-[1.3]">Plats les plus commandés</h2>
      <p className="mt-0.5 text-sm text-text-2">7 derniers jours</p>
      {dishes.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Aucun plat commandé" level={3} compact>
          Le classement apparaîtra avec vos premières commandes.
        </EmptyState>
      ) : (
        <ol className="mt-3">
          {dishes.map((d, i) => (
            <li key={d.name} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 border-t border-line py-2.5 first:border-t-0">
              <span aria-hidden="true" className="row-span-2 grid size-7 place-items-center rounded-[9px] bg-sunken text-[0.8125rem] font-bold tabular">
                {i + 1}
              </span>
              <b className="truncate text-[0.9375rem] font-medium">{d.name}</b>
              <span className="text-right text-[0.9375rem] font-bold tabular">
                {d.quantity}
                <span className="sr-only"> commandés</span>
              </span>
              <span aria-hidden="true" className="col-span-2 col-start-2 h-1.5 overflow-hidden rounded-full bg-sunken">
                <i className="block h-full rounded-full bg-ink" style={{ width: `${(d.quantity / max) * 100}%` }} />
              </span>
            </li>
          ))}
        </ol>
      )}
      <Link href="/statistiques" className="mt-auto flex min-h-11 items-center gap-1.5 border-t border-line pt-3 text-[0.9375rem] font-bold">
        Voir les statistiques
        <ArrowRight aria-hidden="true" className="ml-auto size-[18px]" strokeWidth={1.75} />
      </Link>
    </article>
  );
}

function PublicMenuCard({ restaurant, menu }: { restaurant: DashboardData['restaurant']; menu: DashboardData['menu'] }) {
  const { label } = publicMenuUrl(restaurant.slug);
  const dark = buttonClass({ variant: 'dark', size: 'sm', block: true });
  return (
    <article className={cn(card, 'flex flex-col gap-4 p-5')}>
      <div className="flex items-start gap-3">
        <h2 className="text-lg font-bold leading-[1.3]">Menu public</h2>
        {restaurant.isPublished ? (
          <span className="ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-status-ok-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-ok">
            <CircleCheck aria-hidden="true" className="size-[15px]" strokeWidth={2} />
            Publié
          </span>
        ) : (
          <span className="ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-status-muted-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-muted">
            <EyeOff aria-hidden="true" className="size-[15px]" strokeWidth={2} />
            Non publié
          </span>
        )}
      </div>
      <div className="flex items-center gap-3.5">
        <span aria-hidden="true" className="grid size-[76px] shrink-0 place-items-center rounded-md border border-line bg-ground">
          <QrCode className="size-11" strokeWidth={1.5} />
        </span>
        <p className="min-w-0 text-sm text-text-2">
          <b className="block text-lg text-ink tabular">{plural(menu.dishes, 'plat', 'plats')}</b>
          {menu.dishes === 0 ? 'Ajoutez vos plats, puis téléchargez votre QR Code.' : menu.unavailable > 0 ? `dont ${plural(menu.unavailable, 'épuisé', 'épuisés')}` : 'tous disponibles'}
        </p>
      </div>
      <p className="flex min-w-0 items-center gap-2 text-sm text-text-2">
        <LinkIcon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{label}</span>
      </p>
      <div className="mt-auto grid gap-2">
        {menu.dishes === 0 ? (
          <Link href="/menu" className={dark}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Créer mon menu
          </Link>
        ) : (
          <Link href="/qr-code" className={dark}>
            <Download aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Télécharger le QR Code
          </Link>
        )}
        <PublicMenuLink slug={restaurant.slug} isPublished={restaurant.isPublished} className="w-full" />
      </div>
    </article>
  );
}
