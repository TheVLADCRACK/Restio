import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChartColumn,
  CircleCheck,
  Clock,
  Download,
  EyeOff,
  Link as LinkIcon,
  Plus,
  QrCode,
  ReceiptText,
  UtensilsCrossed,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { sumAmounts } from '@restio/core';
import { buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { requireMembership } from '@/lib/auth/session';
import { getDashboard, type DashboardData } from '@/lib/dashboard/queries';
import { getOrdersBoard, type OrderView } from '@/lib/orders/queries';
import { getProfile } from '@/lib/onboarding/state';
import { EmptyState } from '../_components/empty-state';
import { DashboardOrders } from './dashboard-orders';
import { PageHeader } from '../_components/page-header';
import { PublicMenuLink, publicMenuUrl } from '../_components/public-menu';
import { ageLabel, averageAmount, minutesSince, moneyParts, todayLabel } from './format';
import { SalesBars } from '../_components/sales-bars';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('dashboard'))('metaTitle') };
}
export const dynamic = 'force-dynamic';

const card = 'min-w-0 rounded-lg border border-line bg-surface';

export default async function DashboardPage() {
  const { restaurantId, user } = await requireMembership();
  const locale = await getLocale();
  const [data, profile, board] = await Promise.all([getDashboard(restaurantId), getProfile(user.id), getOrdersBoard(restaurantId, locale)]);
  const { restaurant, today, pending, menu } = data;
  const currency = restaurant.currency;
  const firstName = profile?.firstName?.trim();
  const average = averageAmount(today.sales, today.orders);
  const t = await getTranslations('dashboard');
  const tAge = await getTranslations('dashboard.age');

  return (
    <>
      <PageHeader
        title={firstName ? t('hello', { name: firstName }) : t('helloAnon')}
        subtitle={todayLabel(restaurant.timezone, locale)}
        actions={
          <Link href="/menu" className={buttonClass({ variant: 'dark' })}>
            <Plus aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t('addDish')}
          </Link>
        }
      />

      {/* Mobile : la carte noire d'abord, puis les chiffres ; à partir de 768 px, l'ordre de la planche. */}
      <div className="mt-6 grid grid-flow-row-dense grid-cols-2 gap-3 md:mt-8 md:gap-4 xl:grid-cols-4">
        <Kpi title={t('kpi.orders')} href="/commandes" goLabel={t('kpi.ordersGo')} value={<span className="tabular">{today.orders}</span>} foot={<span>{t('kpi.ordersFoot')}</span>} />
        <Kpi
          title={t('kpi.sales')}
          href="/statistiques"
          goLabel={t('kpi.salesGo')}
          className="col-span-2 md:col-span-1"
          value={<Money amount={today.sales} currency={currency} locale={locale} />}
          foot={<span>{t('kpi.salesFoot')}</span>}
        />
        <Kpi
          title={t('kpi.basket')}
          href="/statistiques"
          goLabel={t('kpi.basketGo')}
          value={
            average ? (
              <Money amount={average} currency={currency} locale={locale} />
            ) : (
              <span>
                <span aria-hidden="true">—</span>
                <span className="sr-only">{t('kpi.basketNone')}</span>
              </span>
            )
          }
          foot={<span>{t('kpi.basketFoot')}</span>}
        />
        <Kpi
          ink
          title={t('kpi.pending')}
          href="/commandes"
          goLabel={t('kpi.pendingGo')}
          className="order-first col-span-2 md:order-none md:col-span-1"
          value={
            <>
              <span className="tabular">{pending.count}</span>
              <small className="text-lg font-medium tracking-normal text-on-dark-2">{t('kpi.pendingUnit', { count: pending.count })}</small>
            </>
          }
          foot={
            pending.oldest ? (
              <>
                <span>{t('kpi.oldest')}</span>
                <b className="inline-flex items-center gap-1.5 text-surface tabular">
                  <Clock aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  {ageLabel(minutesSince(pending.oldest), tAge)}
                </b>
              </>
            ) : (
              <span>{t('kpi.nothing')}</span>
            )
          }
        />
      </div>

      <OrdersToHandle orders={board.active.slice(0, 6)} newCount={pending.count} hasDishes={menu.dishes > 0} />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SalesChart days={data.salesByDay} currency={currency} />
        <TopDishes dishes={data.topDishes} />
        <PublicMenuCard restaurant={restaurant} menu={menu} />
      </div>
    </>
  );
}

function Money({ amount, currency, locale }: { amount: string; currency: string; locale: string }) {
  const { value, unit } = moneyParts(amount, currency, locale);
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

async function OrdersToHandle({ orders, newCount, hasDishes }: { orders: OrderView[]; newCount: number; hasDishes: boolean }) {
  const t = await getTranslations('dashboard.todo');
  const tOrders = await getTranslations('orders');
  return (
    <section aria-labelledby="todo-title" className="mt-8 grid gap-3.5">
      <div className="flex min-h-11 items-center gap-3">
        <h2 id="todo-title" className="text-xl font-bold tracking-[-0.01em]">
          {t('title')}
        </h2>
        <Link href="/commandes" className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[0.9375rem] font-bold underline-offset-4 hover:underline">
          <span className="sm:hidden">{t('seeAllShort')}</span>
          <span className="hidden sm:inline">{t('seeAll')}</span>
          <ArrowRight aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
        </Link>
      </div>
      {orders.length === 0 ? (
        <div className={card}>
          <EmptyState icon={ReceiptText} title={t('emptyTitle')} level={3}>
            {hasDishes ? t('emptyWithDishes') : t('emptyNoDishes')}
          </EmptyState>
        </div>
      ) : (
        <DashboardOrders orders={orders} newCount={newCount} alertTitle={tOrders('alertTitle')} />
      )}
    </section>
  );
}

async function SalesChart({ days, currency }: { days: DashboardData['salesByDay']; currency: string }) {
  const t = await getTranslations('dashboard.sales');
  const locale = await getLocale();
  const total = sumAmounts(days.map((d) => d.sales));
  const week = moneyParts(total, currency, locale);

  return (
    <article className={cn(card, 'p-5 md:col-span-2')}>
      <h2 className="text-lg font-bold leading-[1.3]">{t('title')}</h2>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">
        <span className="tabular">{week.value}</span>
        {week.unit && <small className="text-lg font-medium tracking-normal text-text-3">{week.unit}</small>}
      </p>
      {Number(total) === 0 ? (
        <EmptyState icon={ChartColumn} title={t('emptyTitle')} level={3} compact>
          {t('empty')}
        </EmptyState>
      ) : (
        <SalesBars days={days} currency={currency} />
      )}
    </article>
  );
}

async function TopDishes({ dishes }: { dishes: DashboardData['topDishes'] }) {
  const t = await getTranslations('dashboard.top');
  const max = Math.max(...dishes.map((d) => d.quantity), 1);
  return (
    <article className={cn(card, 'flex flex-col p-5')}>
      <h2 className="text-lg font-bold leading-[1.3]">{t('title')}</h2>
      <p className="mt-0.5 text-sm text-text-2">{t('period')}</p>
      {dishes.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title={t('emptyTitle')} level={3} compact>
          {t('empty')}
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
                <span className="sr-only"> {t('ordered')}</span>
              </span>
              <span aria-hidden="true" className="col-span-2 col-start-2 h-1.5 overflow-hidden rounded-full bg-sunken">
                <i className="block h-full rounded-full bg-ink" style={{ width: `${(d.quantity / max) * 100}%` }} />
              </span>
            </li>
          ))}
        </ol>
      )}
      <Link href="/statistiques" className="mt-auto flex min-h-11 items-center gap-1.5 border-t border-line pt-3 text-[0.9375rem] font-bold">
        {t('seeStats')}
        <ArrowRight aria-hidden="true" className="ml-auto size-[18px]" strokeWidth={1.75} />
      </Link>
    </article>
  );
}

async function PublicMenuCard({ restaurant, menu }: { restaurant: DashboardData['restaurant']; menu: DashboardData['menu'] }) {
  const t = await getTranslations('dashboard.menuCard');
  const { label } = publicMenuUrl(restaurant.slug);
  const dark = buttonClass({ variant: 'dark', size: 'sm', block: true });
  return (
    <article className={cn(card, 'flex flex-col gap-4 p-5')}>
      <div className="flex items-start gap-3">
        <h2 className="text-lg font-bold leading-[1.3]">{t('title')}</h2>
        {restaurant.isPublished ? (
          <span className="ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-status-ok-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-ok">
            <CircleCheck aria-hidden="true" className="size-[15px]" strokeWidth={2} />
            {t('published')}
          </span>
        ) : (
          <span className="ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-status-muted-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-muted">
            <EyeOff aria-hidden="true" className="size-[15px]" strokeWidth={2} />
            {t('unpublished')}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3.5">
        <span aria-hidden="true" className="grid size-[76px] shrink-0 place-items-center rounded-md border border-line bg-ground">
          <QrCode className="size-11" strokeWidth={1.5} />
        </span>
        <p className="min-w-0 text-sm text-text-2">
          <b className="block text-lg text-ink tabular">{t('dishes', { count: menu.dishes })}</b>
          {menu.dishes === 0 ? t('emptyHint') : menu.unavailable > 0 ? t('unavailable', { count: menu.unavailable }) : t('allAvailable')}
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
            {t('create')}
          </Link>
        ) : (
          <Link href="/qr-code" className={dark}>
            <Download aria-hidden="true" className="size-4" strokeWidth={1.75} />
            {t('download')}
          </Link>
        )}
        <PublicMenuLink slug={restaurant.slug} isPublished={restaurant.isPublished} className="w-full" />
      </div>
    </article>
  );
}
