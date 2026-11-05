'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { createOrderInputSchema, isValidSlug, OrderError, priceOrder } from '@restio/core';
import { appSchema, hitRateLimit } from '@restio/db';
import { db } from '@/lib/db';
import { ipFingerprint } from '@/lib/request';

const { categories, dishes, notifications, orderItems, orders, orderStatusEvents, restaurants } = appSchema;

export type CreateOrderResult = { orderId: string } | { error: 'invalid' | 'rate_limited' | 'closed' | 'dish_unavailable' | 'unavailable'; dishId?: string };

// Trois plafonds cumulés (DATABASE.md §3.7) : IP par restaurant, IP tous restaurants, commandes du restaurant par minute.
async function limited(restaurantId: string): Promise<boolean> {
  const ip = await ipFingerprint();
  const checks: [string, number, number][] = [
    [`order:ip-restaurant:${restaurantId}:${ip}`, 10, 600],
    [`order:ip:${ip}`, 30, 3600],
    [`order:restaurant:${restaurantId}`, 60, 60],
  ];
  for (const [key, max, windowSeconds] of checks) {
    if ((await hitRateLimit(db(), key, windowSeconds)) > max) return true;
  }
  return false;
}

/** Commande publique : aucun prix, total ni identifiant de restaurant n'est accepté du navigateur. */
export async function createOrderAction(slug: string, input: unknown): Promise<CreateOrderResult> {
  if (!isValidSlug(slug)) return { error: 'invalid' };
  const parsed = createOrderInputSchema.safeParse(input);
  if (!parsed.success) return { error: 'invalid' };
  const { idempotencyKey, tableLabel, customerNote, customerName, items } = parsed.data;

  const [restaurant] = await db()
    .select({ id: restaurants.id, currency: restaurants.currency, appearance: restaurants.appearance })
    .from(restaurants)
    .where(and(eq(restaurants.slug, slug), eq(restaurants.isPublished, true), eq(restaurants.status, 'active')));
  if (!restaurant) return { error: 'closed' };
  // « Recevoir des commandes » désactivé : refus côté serveur, masquer le bouton ne suffit pas.
  if ((restaurant.appearance as { ordersEnabled?: unknown } | null)?.ordersEnabled === false) return { error: 'closed' };

  const existing = async () => {
    const [row] = await db().select({ id: orders.id }).from(orders).where(and(eq(orders.restaurantId, restaurant.id), eq(orders.idempotencyKey, idempotencyKey)));
    return row?.id;
  };
  // Même clé renvoyée (réseau coupé, double appui) : même commande, sans seconde écriture ni compteur consommé.
  const already = await existing();
  if (already) return { orderId: already };
  if (await limited(restaurant.id)) return { error: 'rate_limited' };

  const dishIds = items.map((i) => i.dishId);
  const rows = await db()
    .select({ id: dishes.id, restaurantId: dishes.restaurantId, name: dishes.name, price: dishes.price, isAvailable: dishes.isAvailable, categoryName: categories.name, categoryVisible: categories.isVisible })
    .from(dishes)
    .innerJoin(categories, eq(dishes.categoryId, categories.id))
    .where(and(eq(dishes.restaurantId, restaurant.id), inArray(dishes.id, dishIds)));

  let priced;
  try {
    priced = priceOrder(items, rows, restaurant.id);
  } catch (error) {
    if (error instanceof OrderError) {
      return error.code === 'dish_unavailable' || error.code === 'dish_not_found' || error.code === 'category_hidden' ? { error: 'dish_unavailable', dishId: error.dishId } : { error: 'invalid' };
    }
    throw error;
  }

  try {
    const orderId = await db().transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({ restaurantId: restaurant.id, tableLabel, customerNote, customerName, currency: restaurant.currency, totalAmount: priced.total, idempotencyKey })
        .returning({ id: orders.id, number: orders.orderNumber });
      if (!order) throw new Error('order insert returned nothing');
      await tx.insert(orderItems).values(priced.lines.map((line) => ({ ...line, orderId: order.id, restaurantId: restaurant.id })));
      await tx.insert(orderStatusEvents).values({ orderId: order.id, restaurantId: restaurant.id, toStatus: 'new' });
      // Texte construit à l'affichage, dans la langue du restaurateur ; seules les données brutes sont gardées.
      await tx.insert(notifications).values({ restaurantId: restaurant.id, orderId: order.id, type: 'order_new', title: `#${order.number}`, body: tableLabel });
      return order.id;
    });
    return { orderId };
  } catch (error) {
    // Deux envois simultanés de la même clé : la contrainte unique tranche, on renvoie la commande gagnante.
    const raced = await existing();
    if (raced) return { orderId: raced };
    console.error(`[order] create failed: ${error instanceof Error ? error.name : 'unknown'}`);
    return { error: 'unavailable' };
  }
}
