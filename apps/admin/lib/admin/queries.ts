import 'server-only';
import { sql } from 'drizzle-orm';
import { adminSchema } from '@restio/db';
import { desc, eq, and } from 'drizzle-orm';
import { dbs } from '@/lib/db';

export const PAGE_SIZE = 8;

type Row = Record<string, unknown>;
const text = (value: unknown) => (value === null || value === undefined ? '' : String(value));
const count = (value: unknown) => Number(value ?? 0);

export type RestaurantStatusKey = 'ok' | 'cfg' | 'stop';
export type RestaurantRow = { name: string; slug: string; city: string; country: string; owner: string; dishes: number; orders30: number; status: RestaurantStatusKey; createdAt: Date };
export type RestaurantFilter = 'all' | 'active' | 'empty' | 'suspended';

const toRestaurant = (r: Row): RestaurantRow => ({
  name: text(r.name),
  slug: text(r.slug),
  city: text(r.city),
  country: text(r.country_code),
  owner: text(r.owner),
  dishes: count(r.dishes),
  orders30: count(r.orders30),
  status: r.status === 'suspended' ? 'stop' : count(r.dishes) === 0 ? 'cfg' : 'ok',
  createdAt: new Date(text(r.created_at)),
});

const RESTAURANT_SELECT = sql`
  SELECT r.name, r.slug, r.city, r.country_code, r.status, r.created_at,
    coalesce(p.first_name || ' ' || p.last_name, '') AS owner,
    (SELECT count(*) FROM dishes d WHERE d.restaurant_id = r.id) AS dishes,
    (SELECT count(*) FROM orders o WHERE o.restaurant_id = r.id AND o.created_at >= now() - interval '30 days') AS orders30
  FROM restaurants r
  LEFT JOIN restaurant_members m ON m.restaurant_id = r.id
  LEFT JOIN profiles p ON p.user_id = m.user_id`;

export async function getOverview() {
  const { prod } = dbs();
  const [stats, recent] = await Promise.all([
    prod.execute(sql`
      SELECT
        (SELECT count(*) FROM restaurants) AS total,
        (SELECT count(*) FROM restaurants WHERE status = 'active') AS active,
        (SELECT count(*) FROM restaurants WHERE created_at >= now() - interval '7 days') AS new7,
        (SELECT count(*) FROM orders WHERE created_at >= date_trunc('day', now())) AS orders_today,
        (SELECT count(*) FROM orders WHERE created_at >= date_trunc('day', now()) - interval '7 days' AND created_at < now() - interval '7 days') AS orders_last_week,
        (SELECT count(*) FROM neon_auth."user" WHERE "createdAt" >= now() - interval '7 days') AS accounts7,
        (SELECT count(*) FROM neon_auth."user" WHERE NOT "emailVerified") AS unverified,
        (SELECT count(*) FROM restaurants r WHERE r.status = 'active' AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.restaurant_id = r.id AND o.created_at >= now() - interval '7 days')) AS inactive7,
        (SELECT count(*) FROM restaurants r WHERE r.status = 'active' AND NOT EXISTS (SELECT 1 FROM dishes d WHERE d.restaurant_id = r.id)) AS empty_menus`),
    prod.execute(sql`${RESTAURANT_SELECT} ORDER BY r.created_at DESC LIMIT 6`),
  ]);
  const s = stats.rows[0] ?? {};
  return {
    total: count(s.total),
    active: count(s.active),
    new7: count(s.new7),
    ordersToday: count(s.orders_today),
    ordersLastWeek: count(s.orders_last_week),
    accounts7: count(s.accounts7),
    unverified: count(s.unverified),
    inactive7: count(s.inactive7),
    emptyMenus: count(s.empty_menus),
    recent: recent.rows.map(toRestaurant),
  };
}

export async function getRestaurants(filter: RestaurantFilter, search: string, page: number) {
  const { prod } = dbs();
  const pattern = `%${search.replace(/[%_\\]/g, '\\$&')}%`;
  const matches = search ? sql`AND (r.name ILIKE ${pattern} OR r.city ILIKE ${pattern} OR p.first_name ILIKE ${pattern} OR p.last_name ILIKE ${pattern})` : sql``;
  const hasDishes = sql`EXISTS (SELECT 1 FROM dishes d WHERE d.restaurant_id = r.id)`;
  const conditions = { all: sql``, active: sql`AND r.status = 'active' AND ${hasDishes}`, empty: sql`AND r.status = 'active' AND NOT ${hasDishes}`, suspended: sql`AND r.status = 'suspended'` }[filter];
  const base = sql`FROM restaurants r LEFT JOIN restaurant_members m ON m.restaurant_id = r.id LEFT JOIN profiles p ON p.user_id = m.user_id WHERE true ${matches}`;
  const [rows, counts] = await Promise.all([
    prod.execute(sql`${RESTAURANT_SELECT} WHERE true ${matches} ${conditions} ORDER BY r.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`),
    prod.execute(sql`
      SELECT count(*) AS all,
        count(*) FILTER (WHERE r.status = 'active' AND ${hasDishes}) AS active,
        count(*) FILTER (WHERE r.status = 'active' AND NOT ${hasDishes}) AS empty,
        count(*) FILTER (WHERE r.status = 'suspended') AS suspended
      ${base}`),
  ]);
  const c = counts.rows[0] ?? {};
  return { rows: rows.rows.map(toRestaurant), counts: { all: count(c.all), active: count(c.active), empty: count(c.empty), suspended: count(c.suspended) } };
}

export async function getRestaurantDetail(slug: string) {
  const { prod, admin } = dbs();
  const [result] = (
    await prod.execute(sql`
      SELECT r.id, r.name, r.slug, r.city, r.country_code, r.currency, r.timezone, r.is_published, r.status, r.created_at,
        p.first_name, p.last_name, p.phone_e164,
        u.email, u."emailVerified" AS verified,
        (SELECT string_agg(a."providerId", ',') FROM neon_auth.account a WHERE a."userId" = m.user_id) AS providers,
        (SELECT max(s."updatedAt") FROM neon_auth.session s WHERE s."userId" = m.user_id) AS last_seen,
        (SELECT count(*) FROM dishes d WHERE d.restaurant_id = r.id) AS dishes,
        (SELECT count(*) FROM orders o WHERE o.restaurant_id = r.id AND o.created_at >= now() - interval '30 days') AS orders30,
        (SELECT coalesce(sum(o.total_amount), 0) FROM orders o WHERE o.restaurant_id = r.id AND o.created_at >= now() - interval '30 days' AND o.status NOT IN ('rejected', 'cancelled')) AS sales30,
        (SELECT count(*) FROM orders o WHERE o.restaurant_id = r.id AND o.created_at >= now() - interval '30 days' AND o.status NOT IN ('rejected', 'cancelled')) AS counted30,
        (SELECT count(*) FROM orders o WHERE o.restaurant_id = r.id AND o.created_at >= now() - interval '30 days' AND o.status IN ('rejected', 'cancelled')) AS refused30
      FROM restaurants r
      LEFT JOIN restaurant_members m ON m.restaurant_id = r.id
      LEFT JOIN profiles p ON p.user_id = m.user_id
      LEFT JOIN neon_auth."user" u ON u.id = m.user_id
      WHERE r.slug = ${slug}`)
  ).rows;
  if (!result) return null;
  const log = await admin
    .select({ action: adminSchema.auditLog.action, at: adminSchema.auditLog.at })
    .from(adminSchema.auditLog)
    .where(and(eq(adminSchema.auditLog.targetType, 'restaurant'), eq(adminSchema.auditLog.targetId, text(result.id))))
    .orderBy(desc(adminSchema.auditLog.at))
    .limit(10);
  return {
    id: text(result.id),
    name: text(result.name),
    slug: text(result.slug),
    city: text(result.city),
    country: text(result.country_code),
    currency: text(result.currency),
    timezone: text(result.timezone),
    isPublished: result.is_published === true,
    isSuspended: result.status === 'suspended',
    createdAt: new Date(text(result.created_at)),
    owner: { name: [text(result.first_name), text(result.last_name)].filter(Boolean).join(' '), phone: text(result.phone_e164), email: text(result.email), verified: result.verified === true, providers: text(result.providers), lastSeen: result.last_seen ? new Date(text(result.last_seen)) : null },
    dishes: count(result.dishes),
    orders30: count(result.orders30),
    sales30: text(result.sales30),
    counted30: count(result.counted30),
    refused30: count(result.refused30),
    log,
  };
}

export type AccountRow = { name: string; email: string; restaurant: string; verified: boolean; provider: string; lastSeen: Date | null };

export async function getAccounts(filter: 'all' | 'unverified', search: string, page: number) {
  const { prod } = dbs();
  const pattern = `%${search.replace(/[%_\\]/g, '\\$&')}%`;
  const matches = search ? sql`AND (u.email ILIKE ${pattern} OR p.first_name ILIKE ${pattern} OR p.last_name ILIKE ${pattern})` : sql``;
  const scope = filter === 'unverified' ? sql`AND NOT u."emailVerified"` : sql``;
  const [rows, totals] = await Promise.all([
    prod.execute(sql`
      SELECT u.email, u."emailVerified" AS verified, coalesce(p.first_name || ' ' || p.last_name, u.name, '') AS name, r.name AS restaurant,
        (SELECT string_agg(a."providerId", ',') FROM neon_auth.account a WHERE a."userId" = u.id) AS providers,
        (SELECT max(s."updatedAt") FROM neon_auth.session s WHERE s."userId" = u.id) AS last_seen
      FROM neon_auth."user" u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN restaurant_members m ON m.user_id = u.id
      LEFT JOIN restaurants r ON r.id = m.restaurant_id
      WHERE true ${matches} ${scope}
      ORDER BY u."createdAt" DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`),
    prod.execute(sql`
      SELECT count(*) AS all, count(*) FILTER (WHERE NOT u."emailVerified") AS unverified, count(*) FILTER (WHERE u."createdAt" >= now() - interval '7 days') AS new7,
        (SELECT count(*) FROM restaurants) AS restaurants,
        (SELECT count(*) FROM subscriptions s WHERE s.plan_id <> 'free') AS paid
      FROM neon_auth."user" u LEFT JOIN profiles p ON p.user_id = u.id WHERE true ${matches}`),
  ]);
  const t = totals.rows[0] ?? {};
  return {
    rows: rows.rows.map((r): AccountRow => ({ name: text(r.name), email: text(r.email), restaurant: text(r.restaurant), verified: r.verified === true, provider: text(r.providers), lastSeen: r.last_seen ? new Date(text(r.last_seen)) : null })),
    totals: { all: count(t.all), unverified: count(t.unverified), new7: count(t.new7), restaurants: count(t.restaurants), paid: count(t.paid) },
  };
}
