import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { getPendingCount } from '@/lib/dashboard/queries';
import { getUnreadCount } from '@/lib/notifications/queries';
import { getOrdersBoard } from '@/lib/orders/queries';
import { OrdersBoard } from './orders-board';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('orders'))('metaTitle') };
}

export default async function OrdersPage() {
  const { restaurantId } = await requireMembership();
  const [board, newCount, unreadCount] = await Promise.all([getOrdersBoard(restaurantId, await getLocale()), getPendingCount(restaurantId), getUnreadCount(restaurantId)]);
  return <OrdersBoard board={board} newCount={newCount} unreadCount={unreadCount} />;
}
