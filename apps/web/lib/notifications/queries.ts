import 'server-only';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { formatMoney } from '@restio/core';
import { appSchema } from '@restio/db';
import { readDb } from '@/lib/db';

const { notifications, orderItems, orders, restaurants } = appSchema;

export type NotificationView = { id: string; type: string; number: number | null; table: string; itemCount: number; totalLabel: string; unread: boolean; group: 'today' | 'earlier'; timeLabel: string };

export async function getUnreadCount(restaurantId: string): Promise<number> {
  const [row] = await readDb().select({ count: sql<number>`count(*)::int` }).from(notifications).where(and(eq(notifications.restaurantId, restaurantId), isNull(notifications.readAt)));
  return row?.count ?? 0;
}

export async function getNotifications(restaurantId: string, locale: string): Promise<NotificationView[]> {
  const d = readDb();
  const [restaurantRows, rows] = await d.batch([
    d.select({ timezone: restaurants.timezone, currency: restaurants.currency }).from(restaurants).where(eq(restaurants.id, restaurantId)),
    d
      .select({
        id: notifications.id,
        type: notifications.type,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
        number: orders.orderNumber,
        table: orders.tableLabel,
        total: orders.totalAmount,
        itemCount: sql<number>`coalesce((SELECT sum(${orderItems.quantity}) FROM ${orderItems} WHERE ${orderItems.orderId} = ${notifications.orderId}), 0)::int`,
      })
      .from(notifications)
      .leftJoin(orders, eq(orders.id, notifications.orderId))
      .where(eq(notifications.restaurantId, restaurantId))
      .orderBy(desc(notifications.createdAt))
      .limit(50),
  ]);
  const restaurant = restaurantRows[0];
  if (!restaurant) return [];
  const { timezone, currency } = restaurant;
  const dayOf = new Intl.DateTimeFormat('en-CA', { timeZone: timezone });
  const clock = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: timezone });
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: timezone });
  const today = dayOf.format(new Date());
  return rows.map((n) => {
    const at = new Date(n.createdAt);
    const sameDay = dayOf.format(at) === today;
    return {
      id: n.id,
      type: n.type,
      number: n.number,
      table: n.table ?? '',
      itemCount: n.itemCount,
      totalLabel: n.total ? formatMoney(n.total, currency, locale) : '',
      unread: n.readAt === null,
      group: sameDay ? 'today' : 'earlier',
      timeLabel: sameDay ? clock.format(at) : date.format(at),
    };
  });
}
