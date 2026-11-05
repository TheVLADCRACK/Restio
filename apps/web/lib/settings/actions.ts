'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { countryCodeSchema, currencySchema, isValidSlug, isValidTimeZone, normalizePhone, PhoneError, RESERVED_SLUGS } from '@restio/core';
import { appSchema, hitRateLimit } from '@restio/db';
import { auth } from '@/lib/auth/server';
import { requireMembership, requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { InvalidImageError, MAX_UPLOAD_BYTES, processImage } from '@/lib/menu/image';
import { deleteMedia, putMedia, restaurantImageKey } from '@/lib/storage';

const { profiles, restaurants } = appSchema;

export type SettingsFormState = { ok?: true; error?: string; fieldErrors?: Record<string, string> } | null;

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const line = (max: number, min = 0) => z.string().trim().min(min).max(max).refine((v) => !CONTROL_CHARS.test(v));
const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === 'string' ? v : '';
};

async function writer() {
  const membership = await requireMembership();
  const limited = (await hitRateLimit(db(), `settings:write:${membership.restaurantId}`, 60)) > 60;
  return { ...membership, limited };
}
const refresh = () => revalidatePath('/app', 'layout');
const uniqueViolation = (error: unknown): boolean => {
  const cause = typeof error === 'object' && error !== null && 'cause' in error ? error.cause : error;
  return typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === '23505';
};

export async function saveRestaurantInfoAction(_prev: SettingsFormState, form: FormData): Promise<SettingsFormState> {
  const t = await getTranslations('settingsPages.errors');
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  const fieldErrors: Record<string, string> = {};
  const check = <T,>(key: string, result: { success: true; data: T } | { success: false }, message: string): T | undefined => {
    if (result.success) return result.data;
    fieldErrors[key] = message;
    return undefined;
  };
  const name = check('name', line(80, 2).safeParse(text(form, 'name')), t('name'));
  const cuisine = check('cuisine', line(40).safeParse(text(form, 'cuisine')), t('cuisine'));
  const city = check('city', line(80, 1).safeParse(text(form, 'city')), t('city'));
  const description = check('description', z.string().trim().max(160).safeParse(text(form, 'description')), t('description'));
  const countryCode = check('countryCode', countryCodeSchema.safeParse(text(form, 'countryCode')), t('country'));
  const currency = check('currency', currencySchema.safeParse(text(form, 'currency')), t('currency'));
  const timezone = text(form, 'timezone');
  if (!isValidTimeZone(timezone)) fieldErrors.timezone = t('timezone');
  let publicWhatsapp: string | null = null;
  const whatsapp = text(form, 'whatsapp').trim();
  if (whatsapp && countryCode) {
    try {
      publicWhatsapp = normalizePhone(whatsapp, countryCode);
    } catch (error) {
      if (!(error instanceof PhoneError)) throw error;
      fieldErrors.whatsapp = t('phone');
    }
  }
  if (Object.keys(fieldErrors).length > 0 || name === undefined || city === undefined || countryCode === undefined || currency === undefined) return { fieldErrors };
  const patch = JSON.stringify({ cuisine: cuisine ?? '', ordersEnabled: form.get('ordersEnabled') === 'on' });
  await db()
    .update(restaurants)
    .set({ name, city, description: description || null, countryCode, currency, timezone, publicWhatsapp, appearance: sql`${restaurants.appearance} || ${patch}::jsonb`, updatedAt: new Date() })
    .where(eq(restaurants.id, restaurantId));
  refresh();
  return { ok: true };
}

export async function saveAddressAction(_prev: SettingsFormState, form: FormData): Promise<SettingsFormState> {
  const t = await getTranslations('settingsPages.errors');
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  const slug = text(form, 'slug').trim().toLowerCase();
  if (!isValidSlug(slug) || slug.length > 40) return { fieldErrors: { slug: RESERVED_SLUGS.has(slug) ? t('slugTaken') : t('slug') } };
  try {
    await db().update(restaurants).set({ slug, isPublished: form.get('isPublished') === 'on', updatedAt: new Date() }).where(eq(restaurants.id, restaurantId));
  } catch (error) {
    // Adresse prise, ou retirée d'un autre restaurant (refusée par le trigger restaurants_slug_guard).
    const cause = typeof error === 'object' && error !== null && 'cause' in error ? error.cause : error;
    const raised = typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === 'P0001';
    if (uniqueViolation(error) || raised) return { fieldErrors: { slug: t('slugTaken') } };
    throw error;
  }
  refresh();
  return { ok: true };
}

const IMAGE_SIZES = {
  banner: [{ width: 1600, height: 600, quality: 78 }, { width: 720, height: 270, quality: 70 }],
  logo: [{ width: 512, height: 512, quality: 85 }, { width: 128, height: 128, quality: 80 }],
} as const;

export async function saveAppearanceAction(_prev: SettingsFormState, form: FormData): Promise<SettingsFormState> {
  const t = await getTranslations('settingsPages.errors');
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  const [current] = await db().select({ bannerKey: restaurants.bannerKey, logoKey: restaurants.logoKey }).from(restaurants).where(eq(restaurants.id, restaurantId));
  if (!current) return { error: t('generic') };

  const uploaded: string[] = [];
  const replace = async (kind: 'banner' | 'logo'): Promise<string | undefined> => {
    const file = form.get(kind);
    if (!(file instanceof File) || file.size === 0) return undefined;
    if (file.size > MAX_UPLOAD_BYTES) throw new InvalidImageError('size');
    const [fullSize, thumbSize] = IMAGE_SIZES[kind];
    const variants = await processImage(Buffer.from(await file.arrayBuffer()), fullSize, thumbSize);
    const key = restaurantImageKey(restaurantId, kind);
    await putMedia(key, variants);
    uploaded.push(key);
    return key;
  };

  let bannerKey: string | undefined;
  let logoKey: string | undefined;
  try {
    bannerKey = await replace('banner');
    logoKey = await replace('logo');
  } catch (error) {
    await Promise.all(uploaded.map(deleteMedia));
    if (error instanceof InvalidImageError) return { error: t('image') };
    console.error(`[settings] image upload failed: ${error instanceof Error ? error.name : 'unknown'}`);
    return { error: t('upload') };
  }
  const patch = JSON.stringify({ showPhotos: form.get('showPhotos') === 'on', showDescriptions: form.get('showDescriptions') === 'on' });
  await db()
    .update(restaurants)
    .set({ ...(bannerKey ? { bannerKey } : {}), ...(logoKey ? { logoKey } : {}), appearance: sql`${restaurants.appearance} || ${patch}::jsonb`, updatedAt: new Date() })
    .where(eq(restaurants.id, restaurantId));
  if (bannerKey && current.bannerKey) await deleteMedia(current.bannerKey);
  if (logoKey && current.logoKey) await deleteMedia(current.logoKey);
  refresh();
  return { ok: true };
}

export async function saveProfileSettingsAction(_prev: SettingsFormState, form: FormData): Promise<SettingsFormState> {
  const t = await getTranslations('settingsPages.errors');
  const { user, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  const firstName = line(80, 1).safeParse(text(form, 'firstName'));
  const lastName = line(80, 1).safeParse(text(form, 'lastName'));
  const fieldErrors: Record<string, string> = {};
  if (!firstName.success) fieldErrors.firstName = t('name');
  if (!lastName.success) fieldErrors.lastName = t('name');
  let phoneE164 = '';
  try {
    phoneE164 = normalizePhone(text(form, 'phone').trim(), text(form, 'phoneCountry'));
  } catch (error) {
    if (!(error instanceof PhoneError)) throw error;
    fieldErrors.phone = t('phone');
  }
  if (!firstName.success || !lastName.success || fieldErrors.phone) return { fieldErrors };
  await db().update(profiles).set({ firstName: firstName.data, lastName: lastName.data, phoneE164, updatedAt: new Date() }).where(eq(profiles.userId, user.id));
  refresh();
  return { ok: true };
}

export async function changePasswordAction(_prev: SettingsFormState, form: FormData): Promise<SettingsFormState> {
  const t = await getTranslations('settingsPages.errors');
  const user = await requireUser();
  if ((await hitRateLimit(db(), `settings:password:${user.id}`, 900)) > 10) return { error: t('rateLimited') };
  const currentPassword = text(form, 'current');
  const newPassword = text(form, 'next');
  if (newPassword.length < 10 || newPassword.length > 128) return { fieldErrors: { next: t('passwordLength') } };
  if (newPassword !== text(form, 'confirm')) return { fieldErrors: { confirm: t('passwordMatch') } };
  const { error } = await auth.changePassword({ currentPassword, newPassword, revokeOtherSessions: form.get('revoke') === 'on' });
  if (error) {
    console.error(`[settings] change password failed: ${error.status ?? 'unknown'}`);
    return { fieldErrors: { current: t('passwordWrong') } };
  }
  return { ok: true };
}

/**
 * Demande de suppression : le rôle de l'application n'a volontairement aucun droit de suppression sur les restaurants.
 * La demande apparaît dans l'administration, qui exécute la suppression définitive (DATABASE.md §8).
 */
export async function requestAccountDeletionAction(): Promise<{ error?: string }> {
  const t = await getTranslations('settingsPages.errors');
  const { restaurantId, limited } = await writer();
  if (limited) return { error: t('rateLimited') };
  const patch = JSON.stringify({ deletionRequestedAt: new Date().toISOString() });
  await db().update(restaurants).set({ onboarding: sql`${restaurants.onboarding} || ${patch}::jsonb`, isPublished: false, updatedAt: new Date() }).where(and(eq(restaurants.id, restaurantId)));
  refresh();
  return {};
}
