import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { requireMembership } from '@/lib/auth/session';
import { markAllNotificationsReadAction } from '@/lib/notifications/actions';
import { getNotifications } from '@/lib/notifications/queries';
import { NotificationList } from '../_components/notification-list';
import { PageHeader } from '../_components/page-header';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('notifications'))('title') };
}

// Mobile : plein écran, le plus récent en haut ; sur ordinateur, même liste si la page est ouverte directement.
export default async function NotificationsPage() {
  const { restaurantId } = await requireMembership();
  const [items, t] = await Promise.all([getNotifications(restaurantId, await getLocale()), getTranslations('notifications')]);
  const readAll = (
    <form action={markAllNotificationsReadAction}>
      <button type="submit" className="h-11 cursor-pointer whitespace-nowrap px-2 text-[0.9375rem] font-bold">
        {t('readAll')}
      </button>
    </form>
  );
  return (
    <>
      <div className="-mx-4 -mt-2 grid h-[calc(52px+env(safe-area-inset-top))] grid-cols-[48px_minmax(0,1fr)_auto] items-center px-1 pt-[env(safe-area-inset-top)] md:hidden">
        <Link href="/" aria-label={t('back')} className="grid size-12 place-items-center rounded-full hover:bg-sunken">
          <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </Link>
        <h1 className="truncate text-center text-[1.0625rem] font-bold">{t('title')}</h1>
        {readAll}
      </div>
      <div className="hidden md:block">
        <PageHeader title={t('title')} actions={readAll} />
      </div>
      <div className="-mx-4 mt-1 overflow-hidden border-y border-line bg-surface md:mx-0 md:mt-6 md:max-w-2xl md:rounded-lg md:border">
        <NotificationList items={items} />
      </div>
    </>
  );
}
