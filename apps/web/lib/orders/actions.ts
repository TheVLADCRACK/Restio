'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { canTransition, isOrderStatus, type OrderStatus } from '@restio/core';
import { appSchema, hitRateLimit } from '@restio/db';
import { requireMembership } from '@/lib/auth/session';
import { db } from '@/lib/db';

const { orders, orderStatusEvents } = appSchema;

export type OrderActionResult = { error?: string };

/**
 * Change le statut si la commande est encore à l'état vu à l'écran. Deux écrans qui appuient
 * en même temps : le premier passe, le second est informé, et aucune étape n'est sautée.
 */
export async function moveOrderAction(id: string, from: string, to: string): Promise<OrderActionResult> {
  const t = await getTranslations('orders.errors');
  const { restaurantId, user } = await requireMembership();
  if (!z.uuid().safeParse(id).success || !isOrderStatus(from) || !isOrderStatus(to) || !canTransition(from, to)) return { error: t('invalid') };
  if ((await hitRateLimit(db(), `orders:write:${restaurantId}`, 60)) > 300) return { error: t('rateLimited') };

  const moved = await db().transaction(async (tx) => {
    const [row] = await tx
      .update(orders)
      .set({ status: to as OrderStatus, updatedAt: new Date() })
      .where(and(eq(orders.id, id), eq(orders.restaurantId, restaurantId), eq(orders.status, from)))
      .returning({ id: orders.id });
    if (!row) return false;
    await tx.insert(orderStatusEvents).values({ orderId: id, restaurantId, fromStatus: from, toStatus: to as OrderStatus, actorUserId: user.id });
    return true;
  });
  revalidatePath('/app', 'layout');
  return moved ? {} : { error: t('stale') };
}
