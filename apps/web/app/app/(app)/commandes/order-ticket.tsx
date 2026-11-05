'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, BellRing, Check, ChefHat, CircleCheckBig, CircleX, Clock, ClockAlert, ConciergeBell, Ellipsis, MessageSquareText, X, type LucideIcon } from 'lucide-react';
import { nextStep } from '@restio/core/order-status';
import { Button } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { moveOrderAction } from '@/lib/orders/actions';
import type { OrderView } from '@/lib/orders/queries';

type ActiveStatus = 'new' | 'accepted' | 'preparing' | 'ready';
const STEPS: ActiveStatus[] = ['new', 'accepted', 'preparing', 'ready'];
const BADGE: Record<ActiveStatus, { icon: LucideIcon; className: string }> = {
  new: { icon: BellRing, className: 'bg-status-new-bg text-status-new' },
  accepted: { icon: Check, className: 'bg-status-info-bg text-status-info' },
  preparing: { icon: ChefHat, className: 'bg-status-prep-bg text-status-prep' },
  ready: { icon: ConciergeBell, className: 'bg-status-ok-bg text-status-ok' },
};

export const isActiveStatus = (status: string): status is ActiveStatus => (STEPS as string[]).includes(status);

export function useTableLine() {
  const t = useTranslations('orders.ticket');
  return (order: OrderView) => {
    const table = /^\d+$/.test(order.table) ? t('table', { label: order.table }) : order.table;
    return order.customerName ? `${table} · ${order.customerName}` : table;
  };
}

export function StatusBadge({ status }: { status: ActiveStatus }) {
  const t = useTranslations('status');
  const { icon: Icon, className } = BADGE[status];
  return (
    <span className={cn('inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pl-2 pr-2.5 text-[0.8125rem] font-bold', className)}>
      <Icon aria-hidden="true" className="size-[15px]" strokeWidth={2} />
      {t(status)}
    </span>
  );
}

const shell = 'grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-3 rounded-lg border p-4';

/** Ticket de la planche : statut, table, articles, note, total, rail d'étapes et geste suivant au pouce. */
export function OrderTicket({ order, selected, onSelect, onError, onAskClose, compact }: { order: OrderView; selected?: boolean; onSelect?: () => void; onError: (message: string) => void; onAskClose: (order: OrderView) => void; compact?: boolean }) {
  const t = useTranslations('orders');
  const tStatus = useTranslations('status');
  const tableLine = useTableLine();
  const [pending, start] = useTransition();
  if (!isActiveStatus(order.status)) return <ClosedTicket order={order} />;
  const status = order.status;
  const step = STEPS.indexOf(status);
  const next = nextStep(status);
  const { minutes } = order;

  function advance() {
    if (!next) return;
    start(async () => {
      try {
        const result = await moveOrderAction(order.id, status, next);
        if (result.error) onError(result.error);
      } catch (error) {
        console.error('[orders] move failed', error);
        onError(t('errors.generic'));
      }
    });
  }

  return (
    <article aria-label={t('ticket.label', { number: order.number })} onClick={onSelect} className={cn(shell, 'border-line bg-surface', onSelect && 'cursor-pointer', selected && 'border-ink shadow-[0_0_0_1px_var(--color-ink)]')}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-[1.3] tracking-[-0.01em] tabular">#{order.number}</p>
          {minutes >= 5 ? (
            <>
              <p className="mt-0.5 truncate text-sm text-text-2">{tableLine(order)}</p>
              <p className={cn('mt-0.5 flex items-center gap-1 text-sm font-bold', minutes >= 10 ? 'text-status-danger' : 'text-status-new')}>
                {minutes >= 10 ? <ClockAlert aria-hidden="true" className="size-[15px] shrink-0" strokeWidth={2.25} /> : <Clock aria-hidden="true" className="size-[15px] shrink-0" strokeWidth={2.25} />}
                {t('ticket.waiting', { minutes })}
              </p>
            </>
          ) : (
            <p className="mt-0.5 truncate text-sm text-text-2">
              {tableLine(order)} · {minutes < 1 ? t('ticket.justNow') : t('ticket.ago', { minutes })}
            </p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>
      <ul className="grid gap-1 text-[0.9375rem]">
        {order.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex gap-2.5">
            <span className="min-w-6 font-bold tabular">{item.quantity}×</span>
            <span className="min-w-0 flex-1">{item.name}</span>
            <span className="whitespace-nowrap text-text-2 tabular">{item.lineLabel}</span>
          </li>
        ))}
      </ul>
      {order.note && (
        <p className="flex gap-2 rounded-sm bg-ground px-2.5 py-2 text-sm text-text-2">
          <MessageSquareText aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 whitespace-pre-line break-words">{order.note}</span>
        </p>
      )}
      <div className="flex justify-between gap-3 border-t border-dashed border-line-strong pt-2.5 font-bold">
        <span>{t('ticket.total')}</span>
        <span className="tabular">{order.totalLabel}</span>
      </div>
      <div role="img" aria-label={t('ticket.rail', { step: step + 1, label: tStatus(status) })} className="grid grid-cols-4 gap-1">
        {STEPS.map((name, index) => (
          <i key={name} className={cn('h-1.5 rounded-full', index < step ? 'bg-ink' : index === step ? 'bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]' : 'bg-sunken')} />
        ))}
      </div>
      {/* Les gestes ne sélectionnent pas le ticket. */}
      <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
        <Button variant="primary" className={cn('min-w-0 flex-1', compact && 'px-3.5')} loading={pending} onClick={advance}>
          {t(`next.${status}`)}
          {!compact && !pending && <ArrowRight aria-hidden="true" className="size-5" strokeWidth={1.75} />}
        </Button>
        <Button className="w-12 shrink-0 px-0" aria-label={status === 'new' ? t('reject', { number: order.number }) : t('moreActions', { number: order.number })} onClick={() => onAskClose(order)}>
          {status === 'new' ? <X aria-hidden="true" className="size-5" strokeWidth={1.75} /> : <Ellipsis aria-hidden="true" className="size-5" strokeWidth={1.75} />}
        </Button>
      </div>
    </article>
  );
}

function ClosedTicket({ order }: { order: OrderView }) {
  const t = useTranslations('orders');
  const tableLine = useTableLine();
  const done = order.status === 'completed';
  const label = done ? t('ticket.done') : order.status === 'rejected' ? t('ticket.refused') : t('ticket.cancelled');
  const when = done ? t('ticket.handedAt', { time: order.closedTime }) : order.status === 'rejected' ? t('ticket.refusedAt', { time: order.closedTime }) : t('ticket.cancelledAt', { time: order.closedTime });
  const Icon = done ? CircleCheckBig : CircleX;
  return (
    <article aria-label={t('ticket.doneLabel', { number: order.number })} className={cn(shell, 'border-dashed border-line-strong bg-ground')}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-[1.3] tracking-[-0.01em] text-text-2 tabular">#{order.number}</p>
          <p className="mt-0.5 truncate text-sm text-text-2">
            {tableLine(order)} · {when}
          </p>
        </div>
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-status-muted-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-muted">
          <Icon aria-hidden="true" className="size-[15px]" strokeWidth={2} />
          {label}
        </span>
      </div>
      <ul className="grid gap-1 text-[0.9375rem] text-text-2">
        {order.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex gap-2.5">
            <span className="min-w-6 font-bold tabular">{item.quantity}×</span>
            <span className="min-w-0 flex-1">{item.name}</span>
            <span className="whitespace-nowrap tabular">{item.lineLabel}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between gap-3 border-t border-dashed border-line pt-2.5 font-bold text-text-2">
        <span>{t('ticket.total')}</span>
        <span className="tabular">{order.totalLabel}</span>
      </div>
    </article>
  );
}
