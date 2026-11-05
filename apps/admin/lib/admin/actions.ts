'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { adminSchema, appSchema, hitRateLimit } from '@restio/db';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/session';
import { dbs } from '@/lib/db';
import { ipFingerprint } from '@/lib/request';

/** Suspendre masque le menu public et bloque les commandes ; chaque changement est journalisé dans la base d'administration. */
export async function setRestaurantSuspendedAction(id: string, suspended: boolean): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { error: 'Restaurant introuvable.' };
  const { prod, admin: adminDb } = dbs();
  if ((await hitRateLimit(adminDb, `admin:write:${admin.id}`, 60)) > 30) return { error: 'Trop d’actions d’un coup. Patientez une minute.' };
  const [row] = await prod
    .update(appSchema.restaurants)
    .set({ status: suspended ? 'suspended' : 'active', updatedAt: new Date() })
    .where(eq(appSchema.restaurants.id, id))
    .returning({ id: appSchema.restaurants.id });
  if (!row) return { error: 'Restaurant introuvable.' };
  await adminDb.insert(adminSchema.auditLog).values({
    adminUserId: admin.id,
    action: suspended ? 'restaurant.suspended' : 'restaurant.reactivated',
    targetType: 'restaurant',
    targetId: id,
    metadata: {},
    requestId: crypto.randomUUID(),
    ipHash: await ipFingerprint(),
  });
  revalidatePath('/', 'layout');
  return {};
}
