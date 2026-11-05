'use server';

import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { appSchema, hitRateLimit } from '@restio/db';
import { requireMembership } from '@/lib/auth/session';
import { db } from '@/lib/db';

const { restaurants } = appSchema;
const tableName = z.string().trim().regex(/^[\p{L}\p{N} _-]{1,20}$/u);
const input = z.strictObject({ tables: z.array(tableName).max(200), perTable: z.boolean() });

/** Liste des tables du QR Code : simple repère pour la salle, jamais une autorisation. */
export async function saveQrTablesAction(tables: string[], perTable: boolean): Promise<{ error?: string }> {
  const t = await getTranslations('qr.errors');
  const { restaurantId } = await requireMembership();
  const parsed = input.safeParse({ tables, perTable });
  if (!parsed.success) return { error: t('invalid') };
  if ((await hitRateLimit(db(), `qr:write:${restaurantId}`, 60)) > 60) return { error: t('rateLimited') };
  const unique = [...new Set(parsed.data.tables)];
  const patch = JSON.stringify({ tables: unique, perTable: parsed.data.perTable });
  await db().update(restaurants).set({ appearance: sql`${restaurants.appearance} || ${patch}::jsonb`, updatedAt: new Date() }).where(eq(restaurants.id, restaurantId));
  revalidatePath('/app/qr-code');
  return {};
}
