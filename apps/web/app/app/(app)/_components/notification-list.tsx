import { useTranslations } from 'next-intl';
import { Bell, BellRing } from 'lucide-react';
import { cn } from '@restio/ui/cn';
import type { NotificationView } from '@/lib/notifications/queries';

/** Liste de la planche : le plus récent en haut, groupé par jour. */
export function NotificationList({ items }: { items: NotificationView[] | null }) {
  const t = useTranslations('notifications');
  if (items === null) return <p className="px-4 py-8 text-center text-sm text-text-2">{t('loading')}</p>;
  if (items.length === 0) return <p className="px-4 py-8 text-center text-sm text-text-2">{t('empty')}</p>;
  const line = (item: NotificationView) => {
    const table = /^\d+$/.test(item.table) ? t('table', { label: item.table }) : item.table;
    return `${table} · ${t('items', { count: item.itemCount })} · ${item.totalLabel}`;
  };
  const section = (group: 'today' | 'earlier') => {
    const rows = items.filter((item) => item.group === group);
    if (rows.length === 0) return null;
    return (
      <section key={group}>
        <p className="border-t border-line bg-ground px-4 pb-1 pt-3 text-[0.8125rem] font-medium text-text-3 first:border-t-0">{t(group)}</p>
        <ul>
          {rows.map((item) => {
            const isOrder = item.type === 'order_new';
            return (
              <li key={item.id} className="relative grid grid-cols-[36px_minmax(0,1fr)_auto] gap-3 border-t border-line px-4 py-3.5 first:border-t-0">
                <span aria-hidden="true" className={cn('grid size-9 place-items-center rounded-full', isOrder ? 'bg-status-new-bg text-status-new' : 'bg-sunken')}>
                  {isOrder ? <BellRing className="size-[18px]" strokeWidth={1.75} /> : <Bell className="size-[18px]" strokeWidth={1.75} />}
                </span>
                <div className="min-w-0">
                  <b className={cn('block text-[0.9375rem]', item.unread ? 'font-bold' : 'font-medium')}>{t('newOrder', { number: item.number ?? 0 })}</b>
                  <p className="text-sm text-text-2 tabular">{line(item)}</p>
                </div>
                <time className="whitespace-nowrap text-[0.8125rem] text-text-3 tabular">{item.timeLabel}</time>
                {item.unread && <span aria-label={t('unread')} className="absolute bottom-[18px] right-4 size-2 rounded-full bg-status-danger" />}
              </li>
            );
          })}
        </ul>
      </section>
    );
  };
  return (
    <>
      {section('today')}
      {section('earlier')}
    </>
  );
}
