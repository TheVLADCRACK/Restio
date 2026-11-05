'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { categoryNameSchema, dishInputSchema, parsePriceInput } from '@restio/core';
import { appSchema, hitRateLimit } from '@restio/db';
import { requireMembership } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { deleteMedia, dishImageKey, putMedia } from '@/lib/storage';
import { InvalidImageError, MAX_UPLOAD_BYTES, processDishImage } from './image';

const { categories, dishes, restaurants } = appSchema;

export type MenuFormState = { ok?: true; error?: string; fieldErrors?: Record<string, string> } | null;
export type MenuResult = { error?: string };

const uuid = z.uuid();
const messages = () => getTranslations('menu.errors');

// Toutes les écritures passent par ici : session vérifiée, restaurant de la session, plafond d'écritures.
async function writer() {
  const { restaurantId } = await requireMembership();
  const limited = (await hitRateLimit(db(), `menu:write:${restaurantId}`, 60)) > 120;
  return { restaurantId, limited };
}

const refresh = () => revalidatePath('/app', 'layout');
const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === 'string' ? v : '';
};

export async function saveCategoryAction(_prev: MenuFormState, form: FormData): Promise<MenuFormState> {
  const t = await messages();
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  const name = categoryNameSchema.safeParse(text(form, 'name'));
  if (!name.success) return { fieldErrors: { name: t('categoryName') } };
  const id = text(form, 'id');
  if (id) {
    if (!uuid.safeParse(id).success) return { error: t('notFound') };
    const updated = await db()
      .update(categories)
      .set({ name: name.data, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.restaurantId, restaurantId)))
      .returning({ id: categories.id });
    if (updated.length === 0) return { error: t('notFound') };
  } else {
    await db()
      .insert(categories)
      .values({ restaurantId, name: name.data, position: sql`(SELECT COALESCE(MAX(${categories.position}), 0) + 1 FROM ${categories} WHERE ${categories.restaurantId} = ${restaurantId})` });
  }
  refresh();
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<MenuResult> {
  const t = await messages();
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  if (!uuid.safeParse(id).success) return { error: t('notFound') };
  const deleted = await db()
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.restaurantId, restaurantId), sql`NOT EXISTS (SELECT 1 FROM ${dishes} WHERE ${dishes.categoryId} = ${id})`))
    .returning({ id: categories.id });
  if (deleted.length === 0) return { error: t('categoryNotEmpty') };
  refresh();
  return {};
}

export async function reorderCategoriesAction(ids: string[]): Promise<MenuResult> {
  const t = await messages();
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  const parsed = z.array(uuid).max(200).safeParse(ids);
  if (!parsed.success) return { error: t('notFound') };
  await db().transaction(async (tx) => {
    // Seules les catégories du restaurant sont touchées, quel que soit le contenu de la liste.
    const own = await tx.select({ id: categories.id }).from(categories).where(and(eq(categories.restaurantId, restaurantId), inArray(categories.id, parsed.data)));
    const allowed = new Set(own.map((c) => c.id));
    for (const [index, id] of parsed.data.entries()) {
      if (allowed.has(id)) await tx.update(categories).set({ position: index + 1, updatedAt: new Date() }).where(and(eq(categories.id, id), eq(categories.restaurantId, restaurantId)));
    }
  });
  refresh();
  return {};
}

export async function saveDishAction(_prev: MenuFormState, form: FormData): Promise<MenuFormState> {
  const t = await messages();
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };

  const parsed = dishInputSchema.safeParse({
    name: text(form, 'name'),
    description: text(form, 'description'),
    categoryId: text(form, 'categoryId'),
    isAvailable: form.get('isAvailable') === 'on',
  });
  const [restaurant] = await db().select({ currency: restaurants.currency }).from(restaurants).where(eq(restaurants.id, restaurantId));
  const price = parsePriceInput(text(form, 'price'), restaurant?.currency ?? 'XAF');
  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? 'name');
      fieldErrors[field] = field === 'categoryId' ? t('dishCategory') : field === 'description' ? t('dishDescription') : t('dishName');
    }
  }
  if (price === null) fieldErrors.price = t('dishPrice');
  if (!parsed.success || price === null) return { fieldErrors };

  const id = text(form, 'id');
  if (id && !uuid.safeParse(id).success) return { error: t('notFound') };

  // Photo traitée puis envoyée avant la transaction ; retirée du stockage si l'écriture échoue.
  const photo = form.get('photo');
  let newKey: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_UPLOAD_BYTES) return { fieldErrors: { photo: t('photoSize') } };
    try {
      const variants = await processDishImage(Buffer.from(await photo.arrayBuffer()));
      newKey = dishImageKey(restaurantId);
      await putMedia(newKey, variants);
    } catch (error) {
      if (error instanceof InvalidImageError) return { fieldErrors: { photo: t('photoFormat') } };
      console.error(`[menu] photo upload failed: ${error instanceof Error ? error.name : 'unknown'}`);
      return { error: t('photoUpload') };
    }
  }
  const removePhoto = form.get('removePhoto') === 'on';

  try {
    let oldKey: string | null = null;
    if (id) {
      const [current] = await db().select({ imageKey: dishes.imageKey }).from(dishes).where(and(eq(dishes.id, id), eq(dishes.restaurantId, restaurantId)));
      if (!current) {
        if (newKey) await deleteMedia(newKey);
        return { error: t('notFound') };
      }
      const replaced = newKey !== null || removePhoto;
      await db()
        .update(dishes)
        .set({ ...parsed.data, price, updatedAt: new Date(), ...(replaced ? { imageKey: newKey } : {}) })
        .where(and(eq(dishes.id, id), eq(dishes.restaurantId, restaurantId)));
      if (replaced) oldKey = current.imageKey;
    } else {
      await db()
        .insert(dishes)
        .values({
          ...parsed.data,
          restaurantId,
          price,
          imageKey: newKey,
          position: sql`(SELECT COALESCE(MAX(${dishes.position}), 0) + 1 FROM ${dishes} WHERE ${dishes.restaurantId} = ${restaurantId} AND ${dishes.categoryId} = ${parsed.data.categoryId})`,
        });
    }
    if (oldKey) await deleteMedia(oldKey);
  } catch (error) {
    if (newKey) await deleteMedia(newKey);
    // Catégorie d'un autre restaurant ou supprimée entre-temps : refusée par la clé étrangère composite.
    const cause = typeof error === 'object' && error !== null && 'cause' in error ? error.cause : error;
    if (typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === '23503') return { fieldErrors: { categoryId: t('dishCategory') } };
    throw error;
  }
  refresh();
  return { ok: true };
}

export async function setDishAvailabilityAction(id: string, isAvailable: boolean): Promise<MenuResult> {
  const t = await messages();
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  if (!uuid.safeParse(id).success) return { error: t('notFound') };
  const updated = await db()
    .update(dishes)
    .set({ isAvailable: isAvailable === true, updatedAt: new Date() })
    .where(and(eq(dishes.id, id), eq(dishes.restaurantId, restaurantId)))
    .returning({ id: dishes.id });
  if (updated.length === 0) return { error: t('notFound') };
  refresh();
  return {};
}

export async function deleteDishAction(id: string): Promise<MenuResult> {
  const t = await messages();
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  if (!uuid.safeParse(id).success) return { error: t('notFound') };
  const [deleted] = await db().delete(dishes).where(and(eq(dishes.id, id), eq(dishes.restaurantId, restaurantId))).returning({ imageKey: dishes.imageKey });
  if (!deleted) return { error: t('notFound') };
  if (deleted.imageKey) await deleteMedia(deleted.imageKey);
  refresh();
  return {};
}
