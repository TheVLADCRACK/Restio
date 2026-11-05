'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { loadNotificationsAction, markAllNotificationsReadAction } from '@/lib/notifications/actions';
import type { NotificationView } from '@/lib/notifications/queries';
import { NotificationList } from './notification-list';

/** Cloche des pages sur ordinateur : panneau de 400 px, la page reste visible. */
export function NotificationBell({ count }: { count: number }) {
  const t = useTranslations('notifications');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationView[] | null>(null);
  const [, start] = useTransition();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) start(async () => setItems(await loadNotificationsAction()));
  }

  function readAll() {
    setItems((current) => current?.map((item) => ({ ...item, unread: false })) ?? null);
    start(() => markAllNotificationsReadAction());
  }

  return (
    <div ref={root} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="dialog" aria-label={t('bell', { count })} onClick={toggle} className="relative grid size-12 cursor-pointer place-items-center rounded-full border border-line-strong bg-surface hover:bg-sunken">
        <Bell aria-hidden="true" className="size-5" strokeWidth={1.75} />
        {count > 0 && <span aria-hidden="true" className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-status-danger px-[5px] text-xs font-bold text-surface tabular">{count}</span>}
      </button>
      {open && (
        <div role="dialog" aria-label={t('title')} className="absolute right-0 top-[calc(100%+8px)] z-30 w-[400px] overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-floating)]">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
            <h2 className="text-[1.0625rem] font-bold">{t('title')}</h2>
            {count > 0 && <span className="grid h-[26px] min-w-[26px] place-items-center rounded-full border border-line-strong bg-surface px-2 text-[0.8125rem] font-bold tabular">{count}</span>}
            <Button size="sm" variant="ghost" className="ml-auto" onClick={readAll}>
              {t('markAll')}
            </Button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <NotificationList items={items} />
          </div>
          <div className="flex justify-center border-t border-line p-3">
            <Link href="/reglages/notifications" className="inline-flex items-center gap-1.5 text-sm font-bold">
              <Settings aria-hidden="true" className="size-4" strokeWidth={1.75} />
              {t('settings')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
