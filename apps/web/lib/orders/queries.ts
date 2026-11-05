import 'server-only';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { formatMoney, type OrderStatus } from '@restio/core';
import { appSchema } from '@restio/db';
import { readDb } from '@/lib/db';

const { orderItems, orders, orderStatusEvents, restaurants } = appSchema;
const ACTIVE = ['new', 'accepted', 'preparing', 'ready'] as const;
const REFUSED = ['rejected', 'cancelled'] as const;

export type OrderView = {
  id: string;
  number: number;
  table: string;
  customerName: string;
  note: string;
  status: OrderStatus;
  minutes: number;
  totalLabel: string;
  items: { name: string; quantity: number; lineLabel: string }[];
  events: { status: OrderStatus; time: string }[];
  closedTime: string;
};
export type OrdersBoard = { active: OrderView[]; done: OrderView[]; refused: OrderView[]; dayLabel: string };

/**
 * Tableau des commandes du restaurant de la session. Les commandes en cours restent toujours visibles.
 * Terminées et refusées : seulement la journée de service, qui bascule à 5 h (heure du restaurant) ;
 * les plus anciennes restent en base (statistiques) mais quittent la liste : c'est l'archivage du lendemain matin.
 */
export async function getOrdersBoard(restaurantId: string, locale: string): Promise<OrdersBoard> {
  const d = readDb();
  const tz = sql`(SELECT ${restaurants.timezone} FROM ${restaurants} WHERE ${restaurants.id} = ${restaurantId})`;
  const serviceDayStart = sql`((date_trunc('day', (now() AT TIME ZONE ${tz}) - interval '5 hours') + interval '5 hours') AT TIME ZONE ${tz})`;
  const visible = sql`(${orders.status} IN ('new', 'accepted', 'preparing', 'ready') OR ${orders.updatedAt} >= ${serviceDayStart})`;
  const visibleIds = d.select({ id: orders.id }).from(orders).where(and(eq(orders.restaurantId, restaurantId), visible));

  const [restaurantRows, rows, items, events] = await d.batch([
    d.select({ currency: restaurants.currency, timezone: restaurants.timezone }).from(restaurants).where(eq(restaurants.id, restaurantId)),
    d
      .select({ id: orders.id, number: orders.orderNumber, table: orders.tableLabel, customerName: orders.customerName, note: orders.customerNote, status: orders.status, total: orders.totalAmount, createdAt: orders.createdAt, updatedAt: orders.updatedAt })
      .from(orders)
      .where(and(eq(orders.restaurantId, restaurantId), visible))
      .orderBy(desc(orders.createdAt))
      .limit(300),
    d.select({ orderId: orderItems.orderId, name: orderItems.dishName, quantity: orderItems.quantity, lineTotal: orderItems.lineTotal }).from(orderItems).where(and(eq(orderItems.restaurantId, restaurantId), inArray(orderItems.orderId, visibleIds))),
    d.select({ orderId: orderStatusEvents.orderId, status: orderStatusEvents.toStatus, at: orderStatusEvents.createdAt }).from(orderStatusEvents).where(and(eq(orderStatusEvents.restaurantId, restaurantId), inArray(orderStatusEvents.orderId, visibleIds))).orderBy(asc(orderStatusEvents.createdAt)),
  ]);
  const restaurant = restaurantRows[0];
  if (!restaurant) throw new Error('restaurant not found for membership');
  const { currency, timezone } = restaurant;
  const clock = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: timezone });
  const now = Date.now();

  const views: OrderView[] = rows.map((o) => ({
    id: o.id,
    number: o.number,
    table: o.table,
    customerName: o.customerName ?? '',
    note: o.note ?? '',
    status: o.status,
    minutes: Math.max(0, Math.floor((now - new Date(o.createdAt).getTime()) / 60_000)),
    totalLabel: formatMoney(o.total, currency, locale),
    items: items.filter((i) => i.orderId === o.id).map((i) => ({ name: i.name, quantity: i.quantity, lineLabel: formatMoney(i.lineTotal, currency, locale) })),
    events: events.filter((e) => e.orderId === o.id).map((e) => ({ status: e.status, time: clock.format(new Date(e.at)) })),
    closedTime: clock.format(new Date(o.updatedAt)),
  }));

  const day = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: timezone }).format(new Date(now));
  return {
    // Les plus anciennes d'abord : c'est la prochaine à traiter.
    active: views.filter((o) => (ACTIVE as readonly string[]).includes(o.status)).reverse(),
    done: views.filter((o) => o.status === 'completed'),
    refused: views.filter((o) => (REFUSED as readonly string[]).includes(o.status)),
    dayLabel: day.charAt(0).toUpperCase() + day.slice(1),
  };
}
