import 'server-only';
import { eq } from 'drizzle-orm';
import { appSchema } from '@restio/db';
import { readDb } from '@/lib/db';
import { mediaUrls } from '@/lib/storage';

const { restaurants } = appSchema;

export async function getRestaurantSettings(restaurantId: string) {
  const [row] = await readDb().select().from(restaurants).where(eq(restaurants.id, restaurantId));
  if (!row) throw new Error('restaurant not found for membership');
  const appearance = (row.appearance ?? {}) as { cuisine?: unknown; ordersEnabled?: unknown; showPhotos?: unknown; showDescriptions?: unknown };
  return {
    slug: row.slug,
    name: row.name,
    city: row.city,
    description: row.description ?? '',
    countryCode: row.countryCode,
    currency: row.currency,
    timezone: row.timezone,
    publicWhatsapp: row.publicWhatsapp ?? '',
    isPublished: row.isPublished,
    bannerUrl: row.bannerKey ? mediaUrls(row.bannerKey).full : null,
    logoUrl: row.logoKey ? mediaUrls(row.logoKey).full : null,
    cuisine: typeof appearance.cuisine === 'string' ? appearance.cuisine : '',
    ordersEnabled: appearance.ordersEnabled !== false,
    showPhotos: appearance.showPhotos !== false,
    showDescriptions: appearance.showDescriptions !== false,
  };
}
