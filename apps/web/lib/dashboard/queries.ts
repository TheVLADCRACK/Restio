import 'server-only';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { appSchema } from '@restio/db';
import { readDb } from '@/lib/db';

const { restaurants, orders, orderItems, dishes } = appSchema;
const ACTIVE = ['new', 'accepted', 'preparing', 'ready'] as const;
// Les commandes refusées ou annulées ne comptent ni dans les ventes ni dans le panier moyen.
const COUNTED = sql`${orders.status} NOT IN ('rejected', 'cancelled')`;

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

/**
 * Toutes les lectures sont limitées au restaurant de la session ; « aujourd'hui » suit son fuseau horaire.
 * Un seul aller-retour HTTP (`batch`) : le fuseau est lu dans la requête elle-même.
 */
export async function getDashboard(restaurantId: string) {
  const d = readDb();
  const tz = sql`(SELECT ${restaurants.timezone} FROM ${restaurants} WHERE ${restaurants.id} = ${restaurantId})`;
  const startOfToday = sql`(date_trunc('day', now() AT TIME ZONE ${tz}) AT TIME ZONE ${tz})`;
  const startOfWeek = sql`((date_trunc('day', now() AT TIME ZONE ${tz}) - interval '6 days') AT TIME ZONE ${tz})`;
  const activeIds = d
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.restaurantId, restaurantId), inArray(orders.status, [...ACTIVE])))
    .orderBy(asc(orders.createdAt))
    .limit(6);

  const [restaurantRows, today, pending, series, active, items, topDishes, menu] = await d.batch([
    d
      .select({ name: restaurants.name, slug: restaurants.slug, currency: restaurants.currency, timezone: restaurants.timezone, isPublished: restaurants.isPublished })
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId))
      .limit(1),
    d
      .select({ count: sql<number>`count(*)::int`, sales: sql<string>`coalesce(sum(${orders.totalAmount}), 0)::text` })
      .from(orders)
      .where(and(eq(orders.restaurantId, restaurantId), sql`${orders.createdAt} >= ${startOfToday}`, COUNTED)),
    d
      .select({ count: sql<number>`count(*)::int`, oldest: sql<string | null>`min(${orders.createdAt})::text` })
      .from(orders)
      .where(and(eq(orders.restaurantId, restaurantId), eq(orders.status, 'new'))),
    d.execute(sql`
      SELECT to_char(day, 'YYYY-MM-DD') AS day, coalesce(sum(o.total_amount), 0)::text AS sales, count(o.id)::int AS orders
      FROM generate_series(date_trunc('day', now() AT TIME ZONE ${tz}) - interval '6 days', date_trunc('day', now() AT TIME ZONE ${tz}), interval '1 day') AS day
      LEFT JOIN ${orders} o ON o.restaurant_id = ${restaurantId}
        AND (o.created_at AT TIME ZONE ${tz})::date = day::date
        AND o.status NOT IN ('rejected', 'cancelled')
      GROUP BY day ORDER BY day
    `),
    d
      .select({ id: orders.id, number: orders.orderNumber, table: orders.tableLabel, status: orders.status, total: orders.totalAmount, note: orders.customerNote, createdAt: orders.createdAt })
      .from(orders)
      .where(and(eq(orders.restaurantId, restaurantId), inArray(orders.status, [...ACTIVE])))
      .orderBy(asc(orders.createdAt))
      .limit(6),
    d
      .select({ orderId: orderItems.orderId, name: orderItems.dishName, quantity: orderItems.quantity, lineTotal: orderItems.lineTotal })
      .from(orderItems)
      .where(and(eq(orderItems.restaurantId, restaurantId), inArray(orderItems.orderId, activeIds))),
    d
      .select({ name: orderItems.dishName, quantity: sql<number>`sum(${orderItems.quantity})::int` })
      .from(orderItems)
      .innerJoin(orders, and(eq(orders.id, orderItems.orderId), eq(orders.restaurantId, orderItems.restaurantId)))
      .where(and(eq(orderItems.restaurantId, restaurantId), sql`${orders.createdAt} >= ${startOfWeek}`, COUNTED))
      .groupBy(orderItems.dishName)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5),
    d
      .select({ total: sql<number>`count(*)::int`, unavailable: sql<number>`count(*) FILTER (WHERE NOT ${dishes.isAvailable})::int` })
      .from(dishes)
      .where(eq(dishes.restaurantId, restaurantId)),
  ]);

  const restaurant = restaurantRows[0];
  if (!restaurant) throw new Error('restaurant not found for membership');
  const todayRow = today[0] ?? { count: 0, sales: '0' };
  const oldest = pending[0]?.oldest;
  return {
    restaurant,
    today: { orders: todayRow.count, sales: todayRow.sales },
    pending: { count: pending[0]?.count ?? 0, oldest: oldest ? new Date(oldest) : null },
    salesByDay: series.rows.map((r) => ({ day: String(r.day), sales: String(r.sales), orders: Number(r.orders) })),
    activeOrders: active.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) })),
    topDishes,
    menu: { dishes: menu[0]?.total ?? 0, unavailable: menu[0]?.unavailable ?? 0 },
  };
}

/** Pastille de la navigation : nombre exact de commandes « Nouvelle » du restaurant de la session. */
export async function getPendingCount(restaurantId: string): Promise<number> {
  const [row] = await readDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(eq(orders.restaurantId, restaurantId), eq(orders.status, 'new')));
  return row?.count ?? 0;
}

/** Nom et adresse publique, pour l'en-tête et la barre latérale. */
export async function getRestaurantSummary(restaurantId: string) {
  const [row] = await readDb()
    .select({ name: restaurants.name, slug: restaurants.slug, isPublished: restaurants.isPublished })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);
  if (!row) throw new Error('restaurant not found for membership');
  return row;
}
