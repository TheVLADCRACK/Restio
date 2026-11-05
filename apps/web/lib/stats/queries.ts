import 'server-only';
import { and, desc, eq, sql } from 'drizzle-orm';
import { appSchema } from '@restio/db';
import { readDb } from '@/lib/db';

const { orderItems, orders, restaurants } = appSchema;

export const PERIODS = { today: 1, week: 7, month: 30 } as const;
export type Period = keyof typeof PERIODS;

/** Statistiques du restaurant de la session, jours et heures dans son fuseau ; refus et annulations exclus des ventes. */
export async function getStats(restaurantId: string, period: Period) {
  const days = PERIODS[period];
  const d = readDb();
  const tz = sql`(SELECT ${restaurants.timezone} FROM ${restaurants} WHERE ${restaurants.id} = ${restaurantId})`;
  const localDay = sql`date_trunc('day', now() AT TIME ZONE ${tz})`;
  const start = sql`((${localDay} - make_interval(days => ${days - 1})) AT TIME ZONE ${tz})`;
  const previous = sql`((${localDay} - make_interval(days => ${days * 2 - 1})) AT TIME ZONE ${tz})`;
  const counted = sql`${orders.status} NOT IN ('rejected', 'cancelled')`;
  const inPeriod = sql`${orders.createdAt} >= ${start}`;

  const [restaurantRows, totals, series, hours, top, topCategory] = await d.batch([
    d.select({ currency: restaurants.currency, timezone: restaurants.timezone }).from(restaurants).where(eq(restaurants.id, restaurantId)),
    d
      .select({
        sales: sql<string>`coalesce(sum(${orders.totalAmount}) FILTER (WHERE ${inPeriod} AND ${counted}), 0)::text`,
        orders: sql<number>`count(*) FILTER (WHERE ${inPeriod} AND ${counted})::int`,
        refused: sql<number>`count(*) FILTER (WHERE ${inPeriod} AND NOT ${counted})::int`,
        received: sql<number>`count(*) FILTER (WHERE ${inPeriod})::int`,
        previousSales: sql<string>`coalesce(sum(${orders.totalAmount}) FILTER (WHERE NOT ${inPeriod} AND ${counted}), 0)::text`,
        previousOrders: sql<number>`count(*) FILTER (WHERE NOT ${inPeriod} AND ${counted})::int`,
      })
      .from(orders)
      .where(and(eq(orders.restaurantId, restaurantId), sql`${orders.createdAt} >= ${previous}`)),
    d.execute(sql`
      SELECT to_char(day, 'YYYY-MM-DD') AS day, coalesce(sum(o.total_amount), 0)::text AS sales, count(o.id)::int AS orders
      FROM generate_series(${localDay} - make_interval(days => ${days - 1}), ${localDay}, interval '1 day') AS day
      LEFT JOIN ${orders} o ON o.restaurant_id = ${restaurantId}
        AND (o.created_at AT TIME ZONE ${tz})::date = day::date
        AND o.status NOT IN ('rejected', 'cancelled')
      GROUP BY day ORDER BY day
    `),
    d
      .select({ hour: sql<number>`extract(hour from ${orders.createdAt} AT TIME ZONE ${tz})::int`, count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.restaurantId, restaurantId), inPeriod))
      .groupBy(sql`1`),
    d
      .select({ name: orderItems.dishName, quantity: sql<number>`sum(${orderItems.quantity})::int` })
      .from(orderItems)
      .innerJoin(orders, and(eq(orders.id, orderItems.orderId), eq(orders.restaurantId, orderItems.restaurantId)))
      .where(and(eq(orderItems.restaurantId, restaurantId), inPeriod, counted))
      .groupBy(orderItems.dishName)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5),
    d
      .select({ name: orderItems.categoryName, sales: sql<string>`sum(${orderItems.lineTotal})::text` })
      .from(orderItems)
      .innerJoin(orders, and(eq(orders.id, orderItems.orderId), eq(orders.restaurantId, orderItems.restaurantId)))
      .where(and(eq(orderItems.restaurantId, restaurantId), inPeriod, counted))
      .groupBy(orderItems.categoryName)
      .orderBy(desc(sql`sum(${orderItems.lineTotal})`))
      .limit(1),
  ]);
  const restaurant = restaurantRows[0];
  if (!restaurant) throw new Error('restaurant not found for membership');
  const total = totals[0];
  return {
    currency: restaurant.currency,
    timezone: restaurant.timezone,
    sales: total?.sales ?? '0',
    orders: total?.orders ?? 0,
    refused: total?.refused ?? 0,
    received: total?.received ?? 0,
    previousSales: total?.previousSales ?? '0',
    previousOrders: total?.previousOrders ?? 0,
    salesByDay: series.rows.map((r) => ({ day: String(r.day), sales: String(r.sales), orders: Number(r.orders) })),
    hours,
    top,
    topCategory: topCategory[0] ?? null,
  };
}
