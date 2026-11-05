import 'server-only';
import { and, asc, eq } from 'drizzle-orm';
import { formatMoney } from '@restio/core';
import { appSchema } from '@restio/db';
import { readDb } from '@/lib/db';
import { mediaUrls } from '@/lib/storage';

const { categories, dishes, orderItems, orders, orderStatusEvents, restaurants } = appSchema;

export type PublicDish = { id: string; categoryId: string; categoryName: string; name: string; description: string; price: string; priceLabel: string; isAvailable: boolean; image: { full: string; thumb: string } | null };
export type PublicMenu = {
  restaurant: { id: string; slug: string; name: string; meta: string; description: string; currency: string; bannerUrl: string | null; logoUrl: string | null; isIndexable: boolean; ordersEnabled: boolean; showPhotos: boolean; showDescriptions: boolean };
  categories: { id: string; name: string }[];
  dishes: PublicDish[];
};

const cuisineOf = (appearance: unknown): string => {
  const value = typeof appearance === 'object' && appearance !== null && 'cuisine' in appearance ? appearance.cuisine : undefined;
  return typeof value === 'string' ? value : '';
};

// Réglage absent : activé par défaut.
const flag = (appearance: unknown, key: string): boolean => !(typeof appearance === 'object' && appearance !== null && key in appearance && (appearance as Record<string, unknown>)[key] === false);

/** Menu visible par tous : restaurant actif et publié, catégories visibles uniquement. Aucune donnée privée n'est sélectionnée. */
export async function getPublicMenu(slug: string, locale: string): Promise<PublicMenu | null> {
  const d = readDb();
  const [restaurant] = await d
    .select({ id: restaurants.id, slug: restaurants.slug, name: restaurants.name, city: restaurants.city, description: restaurants.description, currency: restaurants.currency, bannerKey: restaurants.bannerKey, logoKey: restaurants.logoKey, appearance: restaurants.appearance, isIndexable: restaurants.isIndexable })
    .from(restaurants)
    .where(and(eq(restaurants.slug, slug), eq(restaurants.isPublished, true), eq(restaurants.status, 'active')));
  if (!restaurant) return null;
  const [cats, rows] = await d.batch([
    d.select({ id: categories.id, name: categories.name }).from(categories).where(and(eq(categories.restaurantId, restaurant.id), eq(categories.isVisible, true))).orderBy(asc(categories.position), asc(categories.createdAt)),
    d.select({ id: dishes.id, categoryId: dishes.categoryId, name: dishes.name, description: dishes.description, price: dishes.price, imageKey: dishes.imageKey, isAvailable: dishes.isAvailable }).from(dishes).where(eq(dishes.restaurantId, restaurant.id)).orderBy(asc(dishes.position), asc(dishes.createdAt)),
  ]);
  const names = new Map(cats.map((c) => [c.id, c.name]));
  const order = new Map(cats.map((c, i) => [c.id, i]));
  return {
    restaurant: {
      id: restaurant.id,
      slug: restaurant.slug,
      name: restaurant.name,
      meta: [cuisineOf(restaurant.appearance), restaurant.city].filter(Boolean).join(' · '),
      description: restaurant.description ?? '',
      currency: restaurant.currency,
      bannerUrl: restaurant.bannerKey ? mediaUrls(restaurant.bannerKey).full : null,
      logoUrl: restaurant.logoKey ? mediaUrls(restaurant.logoKey).thumb : null,
      isIndexable: restaurant.isIndexable,
      ordersEnabled: flag(restaurant.appearance, 'ordersEnabled'),
      showPhotos: flag(restaurant.appearance, 'showPhotos'),
      showDescriptions: flag(restaurant.appearance, 'showDescriptions'),
    },
    categories: cats.filter((c) => rows.some((r) => r.categoryId === c.id)),
    dishes: rows
      .filter((r) => names.has(r.categoryId))
      .sort((a, b) => (order.get(a.categoryId) ?? 0) - (order.get(b.categoryId) ?? 0))
      .map((r) => ({
        id: r.id,
        categoryId: r.categoryId,
        categoryName: names.get(r.categoryId) ?? '',
        name: r.name,
        description: r.description ?? '',
        price: r.price,
        priceLabel: formatMoney(r.price, restaurant.currency, locale),
        isAvailable: r.isAvailable,
        image: r.imageKey ? mediaUrls(r.imageKey) : null,
      })),
  };
}

export type OrderTracking = NonNullable<Awaited<ReturnType<typeof getOrderTracking>>>;

/** Suivi d'une commande : accessible par son identifiant opaque, jamais par son numéro (énumérable). */
export async function getOrderTracking(slug: string, orderId: string) {
  const d = readDb();
  const [order] = await d
    .select({ id: orders.id, number: orders.orderNumber, table: orders.tableLabel, status: orders.status, total: orders.totalAmount, currency: orders.currency, createdAt: orders.createdAt, restaurantName: restaurants.name, timezone: restaurants.timezone })
    .from(orders)
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(and(eq(orders.id, orderId), eq(restaurants.slug, slug)));
  if (!order) return null;
  const [items, events] = await d.batch([
    d.select({ name: orderItems.dishName, quantity: orderItems.quantity, lineTotal: orderItems.lineTotal }).from(orderItems).where(eq(orderItems.orderId, orderId)),
    d.select({ status: orderStatusEvents.toStatus, at: orderStatusEvents.createdAt }).from(orderStatusEvents).where(eq(orderStatusEvents.orderId, orderId)).orderBy(asc(orderStatusEvents.createdAt)),
  ]);
  return { ...order, items, events };
}
