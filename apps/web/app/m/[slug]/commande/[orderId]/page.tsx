import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, Bell, Check, ChefHat, ConciergeBell, HandCoins, UtensilsCrossed, X, type LucideIcon } from 'lucide-react';
import { z } from 'zod';
import { formatMoney } from '@restio/core';
import { buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { LiveRefresh } from '@/components/live-refresh';
import { getOrderTracking } from '@/lib/public/queries';
import { PublicTop } from '../../public-top';

type Props = { params: Promise<{ slug: string; orderId: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('pub.track'))('metaTitle'), robots: { index: false, follow: false } };
}

const STEPS = ['new', 'accepted', 'preparing', 'ready', 'completed'] as const;
const ICONS: Record<string, LucideIcon> = { new: Bell, accepted: Check, preparing: ChefHat, ready: ConciergeBell, completed: UtensilsCrossed, rejected: X, cancelled: X };
const card = 'grid gap-3.5 rounded-lg border border-line bg-surface p-4 md:p-5';
const cardTitle = 'text-[0.9375rem] font-bold md:text-lg';

export default async function OrderTrackingPage({ params }: Props) {
  const { slug, orderId } = await params;
  if (!z.uuid().safeParse(orderId).success) notFound();
  const order = await getOrderTracking(slug, orderId);
  if (!order) notFound();
  const [t, locale] = await Promise.all([getTranslations('pub.track'), getLocale()]);

  const time = (date: Date | string) => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: order.timezone }).format(new Date(date));
  const closed = order.status === 'rejected' || order.status === 'cancelled';
  const live = !closed && order.status !== 'completed';
  const currentIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const Icon = ICONS[order.status] ?? Bell;
  const table = /^\d+$/.test(order.table) ? t('table', { label: order.table }) : order.table;
  const menuHref = `/@${slug}`;

  const payNote = (
    <p className="flex items-center gap-2 text-sm text-text-2">
      <HandCoins aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.75} />
      {t('payNote')}
    </p>
  );

  return (
    <>
      <PublicTop name={order.restaurantName} />
      {live && <LiveRefresh />}
      <div className="mx-auto max-w-[720px] pb-28 md:pb-10 md:pt-6">
        <div className="grid h-[calc(52px+env(safe-area-inset-top))] grid-cols-[48px_minmax(0,1fr)_48px] items-center px-1 pt-[env(safe-area-inset-top)] md:hidden">
          <Link href={menuHref} aria-label={t('more')} className="grid size-12 place-items-center rounded-full hover:bg-sunken">
            <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </Link>
          <h1 className="truncate text-center text-[1.0625rem] font-bold">{t('title')}</h1>
        </div>
        <div className="grid gap-4 px-4 pb-6 pt-1 md:px-0 md:pb-0 md:pt-0">
          <section className="grid justify-items-center gap-2 px-0 pb-1 pt-2 text-center md:rounded-lg md:border md:border-line md:bg-surface md:p-5">
            <span aria-hidden="true" className={cn('grid size-16 place-items-center rounded-full border-2', closed ? 'border-status-danger bg-status-danger-bg text-status-danger' : 'border-ink bg-lime text-ink')}>
              <Icon className="size-[30px]" strokeWidth={2.25} />
            </span>
            <h2 className="text-2xl font-bold tracking-[-0.02em]" aria-live="polite">
              {t(`status.${order.status}`)}
            </h2>
            <p className="text-[0.9375rem] text-text-2 tabular">{t('summary', { number: order.number, table, time: time(order.createdAt) })}</p>
            {closed && <p className="text-[0.9375rem] text-text-2">{t('closedHint')}</p>}
            {live && (
              <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-status-ok">
                <i aria-hidden="true" className="size-2 rounded-full bg-status-ok" />
                {t('live')}
              </span>
            )}
          </section>
          {!closed && (
            <section className={card}>
              <h2 className={cardTitle}>{t('steps')}</h2>
              <ol>
                {STEPS.map((step, index) => {
                  const done = index < currentIndex || order.status === 'completed';
                  const now = index === currentIndex && order.status !== 'completed';
                  const at = order.events.find((event) => event.status === step)?.at;
                  return (
                    <li key={step} className={cn('relative grid min-h-9 grid-cols-[20px_1fr_auto] items-center gap-3 text-[0.9375rem]', !done && !now && 'text-text-2', index < STEPS.length - 1 && 'after:absolute after:-bottom-2 after:left-[9px] after:top-[26px] after:w-0.5', done ? 'after:bg-ink' : 'after:bg-line')}>
                      <span aria-hidden="true" className={cn('justify-self-center rounded-full border-2', now ? 'size-4 border-ink bg-lime' : done ? 'size-3 border-ink bg-ink' : 'size-3 border-line-strong bg-surface')} />
                      <span className={cn(now && 'font-bold')}>{t(`status.${step}`)}</span>
                      <time className="text-sm text-text-2 tabular">{at ? time(at) : '—'}</time>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
          <section className={card}>
            <h2 className={cardTitle}>{t('yourOrder')}</h2>
            <ul className="grid gap-1.5 text-[0.9375rem]">
              {order.items.map((item, index) => (
                <li key={`${item.name}-${index}`} className="flex gap-2.5">
                  <span className="min-w-6 font-bold tabular">{item.quantity}×</span>
                  <span className="min-w-0 flex-1">{item.name}</span>
                  <span className="whitespace-nowrap text-text-2 tabular">{formatMoney(item.lineTotal, order.currency, locale)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-dashed border-line-strong pt-3 text-[1.0625rem] font-bold">
              <span>{t('total')}</span>
              <span className="tabular">{formatMoney(order.total, order.currency, locale)}</span>
            </div>
            <div className="hidden md:block">{payNote}</div>
          </section>
          <div className="md:hidden">{payNote}</div>
          <Link href={menuHref} className={buttonClass({ className: 'hidden justify-self-center md:inline-flex' })}>
            {t('more')}
          </Link>
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:hidden">
            <Link href={menuHref} className={buttonClass({ block: true })}>
              {t('more')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
