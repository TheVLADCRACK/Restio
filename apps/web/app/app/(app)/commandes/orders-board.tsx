'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Archive, BellRing, ChefHat, ChevronDown, ConciergeBell, Printer, Search, X, type LucideIcon } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { LiveRefresh } from '@/components/live-refresh';
import { PREF_REMINDER, playChime, readPref, useNewOrderAlert } from '@/components/use-new-order-alert';
import { Toast } from '@/components/toast';
import type { OrdersBoard as Board, OrderView } from '@/lib/orders/queries';
import { NotificationBell } from '../_components/notification-bell';
import { CloseOrderDialog } from './close-order-dialog';
import { isActiveStatus, OrderTicket, StatusBadge, useTableLine } from './order-ticket';

const REFRESH_MS = 8000;
const tabClass = 'group inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 text-sm font-bold aria-selected:border-ink aria-selected:bg-ink aria-selected:text-surface';
const countClass = 'grid h-[22px] min-w-[22px] place-items-center rounded-full bg-sunken px-1.5 text-xs not-italic tabular group-aria-selected:bg-lime group-aria-selected:text-ink';
const liveClass = 'inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-status-ok before:size-2 before:rounded-full before:bg-status-ok';

type DeskFilter = 'live' | 'done' | 'refused';
type MobileFilter = 'todo' | 'cook' | 'ready' | 'done';

export function OrdersBoard({ board, newCount, unreadCount }: { board: Board; newCount: number; unreadCount: number }) {
  const t = useTranslations('orders');
  const [desk, setDesk] = useState<DeskFilter>('live');
  const [mobile, setMobile] = useState<MobileFilter>('todo');
  const [query, setQuery] = useState('');
  const [table, setTable] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [closing, setClosing] = useState<OrderView | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const fail = (message: string) => setToast((previous) => ({ id: (previous?.id ?? 0) + 1, message }));
  useNewOrderAlert(newCount, t('alertTitle'));
  // Rappel unique par commande : une « Nouvelle » sans réponse depuis 5 minutes.
  const reminded = useRef(new Set<string>());
  const overdue = board.active.filter((o) => o.status === 'new' && o.minutes >= 5).map((o) => o.id).join(',');
  useEffect(() => {
    const fresh = overdue ? overdue.split(',').filter((id) => !reminded.current.has(id)) : [];
    if (fresh.length === 0) return;
    fresh.forEach((id) => reminded.current.add(id));
    if (readPref(PREF_REMINDER)) playChime();
  }, [overdue]);

  const tables = useMemo(() => [...new Set([...board.active, ...board.done, ...board.refused].map((o) => o.table))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [board]);
  const match = (order: OrderView) => {
    const needle = query.trim().toLowerCase().replace(/^#/, '');
    const found = !needle || String(order.number).includes(needle) || order.table.toLowerCase().includes(needle);
    return found && (!table || order.table === table);
  };
  const active = board.active.filter(match);
  const done = board.done.filter(match);
  const refused = board.refused.filter(match);

  const fresh = active.filter((o) => o.status === 'new');
  const cooking = active.filter((o) => o.status === 'accepted' || o.status === 'preparing');
  const ready = active.filter((o) => o.status === 'ready');
  // Détail : la sélection, sinon la commande la plus urgente.
  const selected = active.find((o) => o.id === selectedId) ?? board.done.find((o) => o.id === selectedId) ?? (selectedId === 'none' ? null : (active[0] ?? null));

  const ticket = (order: OrderView, select: boolean) => <OrderTicket key={order.id} order={order} compact={select} selected={select && selected?.id === order.id} onSelect={select ? () => setSelectedId(order.id) : undefined} onError={fail} onAskClose={setClosing} />;
  const doneNote = (
    <p className="flex items-center gap-2.5 rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-text-2">
      <Archive aria-hidden="true" className="size-[18px] shrink-0 text-ink" strokeWidth={1.75} />
      {t('doneNote')}
    </p>
  );
  const emptyBox = (children: ReactNode, className?: string) => <p className={cn('rounded-lg border-[1.5px] border-dashed border-line-strong px-4 py-7 text-center text-sm text-text-2', className)}>{children}</p>;
  const lane = (title: string, Icon: LucideIcon, color: string, orders: OrderView[], empty: string) => (
    <section className="grid content-start gap-3">
      <div className="flex h-11 items-center gap-2 border-b-2 px-1" style={{ borderColor: `var(${color})` }}>
        <Icon aria-hidden="true" className="size-[18px]" strokeWidth={2} style={{ color: `var(${color})` }} />
        <h2 className="text-base font-bold">{title}</h2>
        <span className="ml-auto grid h-[26px] min-w-[26px] place-items-center rounded-full border border-line-strong bg-surface px-2 text-[0.8125rem] font-bold tabular">{orders.length}</span>
      </div>
      {orders.length > 0 ? orders.map((o) => ticket(o, true)) : emptyBox(empty)}
    </section>
  );

  const mobileLists: Record<MobileFilter, OrderView[]> = { todo: fresh, cook: cooking, ready, done };
  const mobileList = mobileLists[mobile];

  return (
    <>
      <LiveRefresh intervalMs={REFRESH_MS} />
      {toast && <Toast key={toast.id} tone="error">{toast.message}</Toast>}
      {closing && <CloseOrderDialog order={closing} onClose={() => setClosing(null)} onError={fail} />}

      {/* Bureau, à partir de 1280 px : colonnes par étape et détail à droite. */}
      <div className="hidden min-h-dvh grid-cols-[minmax(0,1fr)_340px] xl:-my-8 xl:-mr-8 xl:grid">
        <div className="grid content-start gap-6 py-7 pr-8">
          <header className="flex min-h-14 items-center gap-4">
            <div className="min-w-0">
              <h1 className="text-[1.875rem] font-bold leading-[1.15] tracking-[-0.02em]">{t('title')}</h1>
              <p className="mt-1 text-[0.9375rem] text-text-2 tabular">{t('subtitle', { day: board.dayLabel, live: board.active.length, done: board.done.length })}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <label className="relative block w-[300px]">
                <span className="sr-only">{t('searchLabel')}</span>
                <Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-text-3" strokeWidth={1.75} />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('search')} className="h-11 w-full rounded-full border border-line-strong bg-surface pl-[42px] pr-4 text-base placeholder:text-text-3 focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none" />
              </label>
              <NotificationBell count={unreadCount} />
            </div>
          </header>
          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label={t('tabs.filter')} className="flex gap-1.5">
              <button type="button" role="tab" aria-selected={desk === 'live'} onClick={() => setDesk('live')} className={tabClass}>
                {t('tabs.live')} <em className={countClass}>{board.active.length}</em>
              </button>
              <button type="button" role="tab" aria-selected={desk === 'done'} onClick={() => setDesk('done')} className={tabClass}>
                {t('tabs.done')} <em className={countClass}>{board.done.length}</em>
              </button>
              <button type="button" role="tab" aria-selected={desk === 'refused'} onClick={() => setDesk('refused')} className={tabClass}>
                {t('tabs.refused')} <em className={countClass}>{board.refused.length}</em>
              </button>
            </div>
            <span aria-hidden="true" className="mx-2 h-6 w-px bg-line-strong" />
            <label className="relative inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-bold focus-within:outline-2 focus-within:outline-ink hover:bg-sunken">
              {table ? (/^\d+$/.test(table) ? t('ticket.table', { label: table }) : table) : t('allTables')}
              <ChevronDown aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
              <select aria-label={t('allTables')} value={table} onChange={(event) => setTable(event.target.value)} className="absolute inset-0 cursor-pointer appearance-none opacity-0">
                <option value="">{t('allTables')}</option>
                {tables.map((name) => (
                  <option key={name} value={name}>
                    {/^\d+$/.test(name) ? t('ticket.table', { label: name }) : name}
                  </option>
                ))}
              </select>
            </label>
            <span className={cn(liveClass, 'ml-auto')}>{t('live')}</span>
          </div>
          {desk === 'live' && (
            <div className="grid grid-cols-3 items-start gap-5">
              {lane(t('lanes.new'), BellRing, '--color-status-new', fresh, t('lanes.newEmpty'))}
              {lane(t('lanes.cook'), ChefHat, '--color-status-prep', cooking, t('lanes.cookEmpty'))}
              {lane(t('lanes.ready'), ConciergeBell, '--color-status-ok', ready, t('lanes.readyEmpty'))}
            </div>
          )}
          {desk === 'done' && (
            <div className="grid gap-4">
              {doneNote}
              {done.length > 0 ? <div className="grid grid-cols-3 items-start gap-5">{done.map((o) => ticket(o, false))}</div> : emptyBox(t('empty.doneText'))}
            </div>
          )}
          {desk === 'refused' && (refused.length > 0 ? <div className="grid grid-cols-3 items-start gap-5">{refused.map((o) => ticket(o, false))}</div> : emptyBox(t('empty.refused')))}
        </div>
        <aside aria-label={t('detail.tracking')} className="print-ticket sticky top-0 flex h-dvh min-w-0 flex-col gap-5 overflow-y-auto border-l border-line bg-surface px-6 py-7">
          <OrderDetail order={selected} onClose={() => setSelectedId('none')} onCancel={setClosing} />
        </aside>
      </div>

      {/* Mobile et tablette : onglets par étape, le geste suivant au pouce. */}
      <div className="-mx-4 pb-4 md:mx-0 xl:hidden">
        <h1 className="sr-only">{t('title')}</h1>
        <div role="tablist" aria-label={t('tabs.filter')} className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden">
          {(['todo', 'cook', 'ready', 'done'] as const).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={mobile === key} onClick={() => setMobile(key)} className={tabClass}>
              {t(`tabs.${key}`)} <em className={countClass}>{key === 'done' ? board.done.length : mobileLists[key].length}</em>
            </button>
          ))}
        </div>
        <div className="grid gap-2.5 px-3 md:grid-cols-2 md:px-0">
          {mobile === 'done' && <div className="md:col-span-2">{doneNote}</div>}
          {mobileList.length > 0 ? (
            mobileList.map((o) => ticket(o, false))
          ) : (
            <div className="md:col-span-2">
              <div className="grid justify-items-center gap-2 px-6 py-10 text-center">
                <h2 className="text-lg font-bold">{mobile === 'done' ? t('empty.doneTitle') : t('empty.title')}</h2>
                <p className="text-[0.9375rem] text-text-2">{mobile === 'done' ? t('empty.doneText') : t('empty.text')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function OrderDetail({ order, onClose, onCancel }: { order: OrderView | null; onClose: () => void; onCancel: (order: OrderView) => void }) {
  const t = useTranslations('orders');
  const tStatus = useTranslations('status');
  const tableLine = useTableLine();
  if (!order) {
    return (
      <div className="my-auto grid justify-items-center gap-2 text-center">
        <h2 className="text-lg font-bold">{t('detail.none')}</h2>
        <p className="text-[0.9375rem] text-text-2">{t('detail.noneHint')}</p>
      </div>
    );
  }
  const steps = ['new', 'accepted', 'preparing', 'ready', 'completed'] as const;
  const current = steps.indexOf(order.status as (typeof steps)[number]);
  const receivedAt = order.events.find((event) => event.status === 'new')?.time ?? '';
  return (
    <>
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-[-0.01em] tabular">#{order.number}</h2>
          <p className="text-sm text-text-2">
            {tableLine(order)} · {t('detail.received', { time: receivedAt })}
          </p>
        </div>
        <Button size="sm" variant="ghost" aria-label={t('detail.close')} className="-mr-2 -mt-1.5 ml-auto w-10 px-0 print:hidden" onClick={onClose}>
          <X aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
        </Button>
      </div>
      {isActiveStatus(order.status) && (
        <div className="self-start">
          <StatusBadge status={order.status} />
        </div>
      )}
      <div>
        <h3 className="mb-2 text-sm font-medium text-text-2">{t('detail.tracking')}</h3>
        <ol>
          {steps.map((step, index) => {
            const finished = order.status === 'completed' || index < current;
            const now = index === current && order.status !== 'completed';
            const time = order.events.find((event) => event.status === step)?.time;
            return (
              <li key={step} className={cn('relative grid min-h-9 grid-cols-[20px_1fr_auto] items-center gap-3 text-[0.9375rem]', !finished && !now && 'text-text-2', index < steps.length - 1 && 'after:absolute after:-bottom-2 after:left-[9px] after:top-[26px] after:w-0.5', finished ? 'after:bg-ink' : 'after:bg-line')}>
                <span aria-hidden="true" className={cn('justify-self-center rounded-full border-2', now ? 'size-4 border-ink bg-lime' : finished ? 'size-3 border-ink bg-ink' : 'size-3 border-line-strong bg-surface')} />
                <span className={cn(now && 'font-bold')}>{step === 'completed' ? t('detail.handed') : step === 'new' ? t('detail.receivedStep') : tStatus(step)}</span>
                <time className="text-sm text-text-2 tabular">{time ?? '—'}</time>
              </li>
            );
          })}
        </ol>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-text-2">{t('detail.items')}</h3>
        <ul className="grid gap-1.5 text-[0.9375rem]">
          {order.items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex gap-2.5">
              <span className="min-w-6 font-bold tabular">{item.quantity}×</span>
              <span className="min-w-0 flex-1">{item.name}</span>
              <span className="whitespace-nowrap text-text-2 tabular">{item.lineLabel}</span>
            </li>
          ))}
        </ul>
      </div>
      {order.note && <p className="whitespace-pre-line rounded-sm bg-ground px-2.5 py-2 text-sm text-text-2">{order.note}</p>}
      <div className="flex justify-between border-t border-dashed border-line-strong pt-3 text-[1.0625rem] font-bold">
        <span>{t('ticket.total')}</span>
        <span className="tabular">{order.totalLabel}</span>
      </div>
      <div className="mt-auto grid gap-2 print:hidden">
        <Button variant="dark" block onClick={() => window.print()}>
          <Printer aria-hidden="true" className="size-5" strokeWidth={1.75} />
          {t('detail.print')}
        </Button>
        {isActiveStatus(order.status) && (
          <Button variant="ghost" block className="text-status-danger hover:bg-status-danger-bg" onClick={() => onCancel(order)}>
            {t('detail.cancel')}
          </Button>
        )}
      </div>
    </>
  );
}
