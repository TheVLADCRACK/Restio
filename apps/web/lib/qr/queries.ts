import 'server-only';
import { eq } from 'drizzle-orm';
import { appSchema } from '@restio/db';
import { readDb } from '@/lib/db';

const { restaurants } = appSchema;

export type QrSettings = { slug: string; name: string; tables: string[]; perTable: boolean };

export async function getQrSettings(restaurantId: string): Promise<QrSettings> {
  const [row] = await readDb().select({ slug: restaurants.slug, name: restaurants.name, appearance: restaurants.appearance }).from(restaurants).where(eq(restaurants.id, restaurantId));
  if (!row) throw new Error('restaurant not found for membership');
  const appearance = (row.appearance ?? {}) as { tables?: unknown; perTable?: unknown };
  const tables = Array.isArray(appearance.tables) ? appearance.tables.filter((t): t is string => typeof t === 'string') : [];
  return { slug: row.slug, name: row.name, tables, perTable: appearance.perTable === true };
}
