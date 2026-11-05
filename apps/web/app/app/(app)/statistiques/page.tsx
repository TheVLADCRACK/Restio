import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CalendarCheck, ChartColumn, Clock, QrCode, TrendingDown, TrendingUp, Utensils, type LucideIcon } from 'lucide-react';
import { formatMoney } from '@restio/core';
import { buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { requireMembership } from '@/lib/auth/session';
import { getUnreadCount } from '@/lib/notifications/queries';
import { getStats, PERIODS, type Period } from '@/lib/stats/queries';
import { averageAmount, compactNumber, moneyParts } from '../(dashboard)/format';
import { EmptyState } from '../_components/empty-state';
import { MobileHead } from '../_components/mobile-head';
import { NotificationBell } from '../_components/notification-bell';
import { PageHeader } from '../_components/page-header';
import { SalesBars } from '../_components/sales-bars';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('stats'))('metaTitle') };
}

const card = 'min-w-0 rounded-lg border border-line bg-surface p-5';
const percentChange = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);

function Delta({ value }: { value: number | null }) {
  if (value === null) return null;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className={cn('inline-flex items-center gap-1 font-bold tabular', value >= 0 ? 'text-status-ok' : 'text-status-danger')}>
      <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
      {value > 0 ? '+' : ''}
      {value} %
    </span>
  );
}

function Kpi({ title, value, unit, foot, side }: { title: string; value: string; unit?: string; foot: string; side?: React.ReactNode }) {
  return (
    <article className="flex min-w-0 flex-col gap-3.5 rounded-lg border border-line bg-surface p-5 pb-4">
      <h2 className="flex min-h-11 items-center text-[0.9375rem] font-medium leading-tight text-text-2">{title}</h2>
      <p className="flex h-9 flex-wrap items-baseline gap-x-1.5 text-[2.25rem] font-bold leading-none tracking-[-0.03em]">
        <span className="tabular">{value}</span>
        {unit && <small className="text-lg font-medium tracking-normal text-text-3">{unit}</small>}
      </p>
      <div className="mt-auto flex min-h-6 items-center justify-between gap-2 whitespace-nowrap border-t border-line pt-3 text-sm text-text-2">
        <span className="truncate">{foot}</span>
        {side}
      </div>
    </article>
  );
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ periode?: string | string[] }> }) {
  const { periode } = await searchParams;
  const period: Period = typeof periode === 'string' && Object.hasOwn(PERIODS, periode) ? (periode as Period) : 'week';
  const { restaurantId } = await requireMembership();
  const [stats, unread, t, locale] = await Promise.all([getStats(restaurantId, period), getUnreadCount(restaurantId), getTranslations('stats'), getLocale()]);
  const { currency, salesByDay } = stats;
  const money = (amount: string) => formatMoney(amount, currency, locale);
  const salesParts = moneyParts(stats.sales, currency, locale);
  const basket = averageAmount(stats.sales, stats.orders);
  const basketParts = basket ? moneyParts(basket, currency, locale) : null;
  const previousBasket = averageAmount(stats.previousSales, stats.previousOrders);
  const hasData = stats.received > 0;

  const longDay = (day: string, withWeekday = true) => {
    const label = new Intl.DateTimeFormat(locale, { ...(withWeekday ? { weekday: 'long' } : {}), day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
    return label;
  };
  const first = salesByDay[0]?.day ?? '';
  const last = salesByDay[salesByDay.length - 1]?.day ?? '';
  const subtitle = period === 'today' ? longDay(last) : t('range', { from: longDay(first), to: longDay(last) });

  // Heures d'ouverture habituelles (11 h à 23 h) élargies si des commandes tombent en dehors.
  const counts = new Map(stats.hours.map((h) => [h.hour, h.count]));
  const seen = stats.hours.map((h) => h.hour);
  const fromHour = Math.min(11, ...seen);
  const toHour = Math.max(23, ...seen);
  const hours = Array.from({ length: toHour - fromHour + 1 }, (_, i) => ({ hour: fromHour + i, count: counts.get(fromHour + i) ?? 0 }));
  const peak = hours.reduce((best, h) => (h.count > best.count ? h : best), { hour: fromHour, count: 0 });
  const best = salesByDay.reduce((top, d) => (Number(d.sales) > Number(top.sales) ? d : top), salesByDay[0] ?? { day: '', sales: '0', orders: 0 });
  const categoryPercent = stats.topCategory && Number(stats.sales) > 0 ? Math.round((Number(stats.topCategory.sales) / Number(stats.sales)) * 100) : null;
  const topMax = Math.max(...stats.top.map((d) => d.quantity), 1);
  const average = averageAmount(stats.sales, salesByDay.length) ?? '0';

  const seg = (mobile: boolean) => (
    <div role="tablist" aria-label={t('period')} className={cn('gap-0.5 rounded-full bg-sunken p-1', mobile ? 'grid grid-cols-3' : 'inline-flex')}>
      {(Object.keys(PERIODS) as Period[]).map((key) => (
        <Link key={key} href={`/statistiques?periode=${key}`} role="tab" aria-selected={period === key} className="grid h-8 place-items-center rounded-full px-3 text-sm font-medium text-text-2 aria-selected:bg-surface aria-selected:font-bold aria-selected:text-ink aria-selected:shadow-[var(--shadow-rest)]">
          {t(`periods.${key}`)}
        </Link>
      ))}
    </div>
  );

  const ranks = (count: number) => (
    <ol>
      {stats.top.slice(0, count).map((dish, index) => (
        <li key={dish.name} className="grid grid-cols-[28px_1fr_auto] items-center gap-x-3 gap-y-1 border-t border-line py-2.5 first:border-t-0">
          <span aria-hidden="true" className="row-span-2 grid size-7 place-items-center rounded-[9px] bg-sunken text-[0.8125rem] font-bold tabular">{index + 1}</span>
          <b className="min-w-0 truncate text-[0.9375rem] font-medium">{dish.name}</b>
          <span className="text-right text-[0.9375rem] font-bold tabular">{dish.quantity}</span>
          <span aria-hidden="true" className="col-span-2 col-start-2 h-1.5 overflow-hidden rounded-full bg-sunken">
            <i className="block h-full rounded-full bg-ink" style={{ width: `${(dish.quantity / topMax) * 100}%` }} />
          </span>
        </li>
      ))}
    </ol>
  );

  const fact = (Icon: LucideIcon, title: string, text: string) => (
    <li className="flex gap-3 border-t border-line py-3 text-[0.9375rem] first:border-t-0">
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-sm bg-sunken">
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <b className="block">{title}</b>
        <span className="text-sm text-text-2">{text}</span>
      </div>
    </li>
  );

  const barHeight = (count: number) => (peak.count > 0 ? `${Math.max((count / peak.count) * 100, count > 0 ? 3 : 0)}%` : '0%');
  const hoursSummary = t('hoursSummary', { hour: peak.hour, count: peak.count });

  return (
    <>
      <MobileHead title={t('title')} />
      <div className="hidden md:block">
        <PageHeader
          title={t('title')}
          subtitle={<span className="first-letter:uppercase">{subtitle}</span>}
          actions={
            <>
              {seg(false)}
              <NotificationBell count={unread} />
            </>
          }
        />
      </div>
      <div className="-mx-1 pb-3 md:hidden">{seg(true)}</div>

      {!hasData ? (
        <div className="rounded-lg border border-line bg-surface md:mt-6">
          <EmptyState icon={ChartColumn} title={t('emptyTitle')} action={<Link href="/qr-code" className={buttonClass({ variant: 'dark', size: 'sm' })}><QrCode aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />{t('downloadQr')}</Link>}>
            {t('empty')}
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Mobile : chiffres clés puis détails. */}
          <div className="md:hidden">
            <div className="-mx-1 grid grid-cols-2 gap-2">
              <div className="grid gap-1 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className="text-[0.8125rem] text-text-2">{t('sales')}</span>
                <b className="whitespace-nowrap text-[1.375rem] font-bold tracking-[-0.02em] tabular">{compactNumber(Number(stats.sales), locale)}<small className="ml-[3px] text-[0.8125rem] font-medium tracking-normal text-text-3">{salesParts.unit}</small></b>
                <em className="text-xs"><Delta value={percentChange(Number(stats.sales), Number(stats.previousSales))} /></em>
              </div>
              <div className="grid gap-1 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className="text-[0.8125rem] text-text-2">{t('orders')}</span>
                <b className="text-[1.375rem] font-bold tracking-[-0.02em] tabular">{stats.orders}</b>
                <em className="text-xs"><Delta value={percentChange(stats.orders, stats.previousOrders)} /></em>
              </div>
              <div className="grid gap-1 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className="text-[0.8125rem] text-text-2">{t('basket')}</span>
                <b className="whitespace-nowrap text-[1.375rem] font-bold tracking-[-0.02em] tabular">{basketParts?.value ?? '—'}{basketParts && <small className="ml-[3px] text-[0.8125rem] font-medium tracking-normal text-text-3">{basketParts.unit}</small>}</b>
              </div>
              <div className="grid gap-1 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className="text-[0.8125rem] text-text-2">{t('refusedShort')}</span>
                <b className="text-[1.375rem] font-bold tracking-[-0.02em] tabular">{stats.refused}</b>
              </div>
            </div>
            <h3 className="px-0 pb-2.5 pt-[22px] text-lg font-bold">{t('salesByDay')}</h3>
            <div className="-mx-1 rounded-lg border border-line bg-surface p-3.5">
              <SalesBars days={salesByDay} currency={currency} compact />
            </div>
            {stats.top.length > 0 && (
              <>
                <h3 className="pb-2.5 pt-[22px] text-lg font-bold">{t('topDishes')}</h3>
                <div className="-mx-1 rounded-lg border border-line bg-surface px-3.5">{ranks(3)}</div>
              </>
            )}
            <h3 className="pb-2.5 pt-[22px] text-lg font-bold">{t('hours')}</h3>
            <div className="-mx-1 mb-4 rounded-lg border border-line bg-surface p-3.5">
              <div role="img" aria-label={hoursSummary} className="grid h-20 items-end gap-1" style={{ gridTemplateColumns: `repeat(${hours.length}, 1fr)` }}>
                {hours.map((h) => (
                  <i key={h.hour} className={cn('block rounded-[4px_4px_2px_2px]', h.hour === peak.hour && peak.count > 0 ? 'bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]' : 'bg-ink-2')} style={{ height: barHeight(h.count) }} />
                ))}
              </div>
              <div aria-hidden="true" className="mt-1.5 grid grid-cols-3 text-[0.6875rem] text-text-3">
                <span>{t('hourLabel', { hour: fromHour })}</span>
                <span className="text-center">{t('hourLabel', { hour: Math.round((fromHour + toHour) / 2) })}</span>
                <span className="text-right">{t('hourLabel', { hour: toHour })}</span>
              </div>
            </div>
          </div>

          {/* Bureau : mêmes cartes que le tableau de bord. */}
          <div className="mt-6 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-12 xl:gap-6">
            <div className="grid xl:col-span-3">
              <Kpi title={t('sales')} value={salesParts.value} unit={salesParts.unit} foot={t(`vs.${period}`)} side={<Delta value={percentChange(Number(stats.sales), Number(stats.previousSales))} />} />
            </div>
            <div className="grid xl:col-span-3">
              <Kpi title={t('orders')} value={String(stats.orders)} foot={t(`vs.${period}`)} side={<Delta value={percentChange(stats.orders, stats.previousOrders)} />} />
            </div>
            <div className="grid xl:col-span-3">
              <Kpi title={t('basket')} value={basketParts?.value ?? '—'} unit={basketParts?.unit} foot={t(`previous.${period}`)} side={previousBasket ? <span className="tabular">{money(previousBasket)}</span> : undefined} />
            </div>
            <div className="grid xl:col-span-3">
              <Kpi title={t('refused')} value={String(stats.refused)} foot={t('outOf', { count: stats.received })} side={<span className="tabular">{new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: 'percent' }).format(stats.refused / stats.received)}</span>} />
            </div>
            <article className={cn(card, 'md:col-span-2 xl:col-span-8')}>
              <h2 className="text-lg font-bold leading-[1.3]">{t('salesByDay')}</h2>
              <p className="mt-0.5 text-sm text-text-2 tabular">{t('averagePerDay', { amount: money(average) })}</p>
              <SalesBars days={salesByDay} currency={currency} />
            </article>
            <article className={cn(card, 'md:col-span-2 xl:col-span-4')}>
              <div className="mb-3.5 flex items-start gap-3">
                <h2 className="text-lg font-bold leading-[1.3]">{t('topDishes')}</h2>
                <span className="ml-auto shrink-0 text-sm text-text-2">{t('quantities')}</span>
              </div>
              {ranks(5)}
            </article>
            <article className={cn(card, 'md:col-span-2 xl:col-span-8')}>
              <h2 className="text-lg font-bold leading-[1.3]">{t('hours')}</h2>
              <p className="mt-0.5 text-sm text-text-2">{t(`hoursHint.${period}`)}</p>
              <div role="img" aria-label={hoursSummary} className="mt-6 grid h-[168px] items-end gap-2.5 border-b border-line-strong px-1" style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(0, 1fr))` }}>
                {hours.map((h) => (
                  <i key={h.hour} className={cn('block rounded-[8px_8px_3px_3px]', h.hour === peak.hour && peak.count > 0 ? 'bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]' : 'bg-ink-2')} style={{ height: barHeight(h.count) }} />
                ))}
              </div>
              <div aria-hidden="true" className="grid gap-2.5 px-1 pt-2 text-center text-xs text-text-3" style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(0, 1fr))` }}>
                {hours.map((h) => (
                  <span key={h.hour} className="whitespace-nowrap">{hours.length <= 14 || h.hour % 2 === 0 ? t('hourLabel', { hour: h.hour }) : ''}</span>
                ))}
              </div>
            </article>
            <article className={cn(card, 'md:col-span-2 xl:col-span-4')}>
              <h2 className="text-lg font-bold leading-[1.3]">{t('facts')}</h2>
              <ul className="mt-3.5">
                {best && Number(best.sales) > 0 && fact(CalendarCheck, longDay(best.day).replace(/^./, (c) => c.toUpperCase()), t('bestDay', { amount: money(best.sales) }))}
                {peak.count > 0 && fact(Clock, t('busiestHour', { from: peak.hour, to: peak.hour + 1 }), t('busiestHourHint'))}
                {stats.topCategory && categoryPercent !== null && fact(Utensils, stats.topCategory.name, t('categoryShare', { percent: categoryPercent }))}
              </ul>
            </article>
          </div>
        </>
      )}
    </>
  );
}
