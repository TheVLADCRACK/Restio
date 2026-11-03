import 'server-only';
import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { appSchema } from '@restio/db';
import { db } from '@/lib/db';

export const getProfile = cache(async (userId: string) => {
  const [row] = await db()
    .select({ firstName: appSchema.profiles.firstName, lastName: appSchema.profiles.lastName, phoneE164: appSchema.profiles.phoneE164, whatsappE164: appSchema.profiles.whatsappE164 })
    .from(appSchema.profiles)
    .where(eq(appSchema.profiles.userId, userId))
    .limit(1);
  return row ?? null;
});

// Version non mise en cache : utilisée après une écriture, quand la réponse a pu changer dans la même requête.
export async function hasRestaurantNow(userId: string): Promise<boolean> {
  const [row] = await db()
    .select({ restaurantId: appSchema.restaurantMembers.restaurantId })
    .from(appSchema.restaurantMembers)
    .where(eq(appSchema.restaurantMembers.userId, userId))
    .limit(1);
  return Boolean(row);
}

export const hasRestaurant = cache(hasRestaurantNow);
