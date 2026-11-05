'use server';

import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { like, sql } from 'drizzle-orm';
import { normalizePhone, PhoneError, profileInputSchema, restaurantInputSchema, slugify, suggestSlug } from '@restio/core';
import { appSchema } from '@restio/db';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { getProfile, hasRestaurant, hasRestaurantNow } from './state';

export type OnboardingFormState = { error?: string; fieldErrors?: Record<string, string> } | null;

// Codes d'erreur renvoyés par @restio/core, traduits dans la langue de la requête.
const FIELD_CODES = ['invalid_phone', 'invalid_country', 'invalid_currency', 'invalid_timezone', 'future_date'] as const;
type FieldCode = (typeof FIELD_CODES)[number];

async function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Promise<Record<string, string>> {
  const t = await getTranslations('onboarding.errors');
  return Object.fromEntries(
    issues.map((i) => [String(i.path[0] ?? 'form'), (FIELD_CODES as readonly string[]).includes(i.message) ? t(i.message as FieldCode) : t('invalid')]),
  );
}

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === 'string' ? v : '';
};

export async function saveProfileAction(_prev: OnboardingFormState, form: FormData): Promise<OnboardingFormState> {
  const user = await requireUser();
  const parsed = profileInputSchema.safeParse({
    firstName: text(form, 'firstName'),
    lastName: text(form, 'lastName'),
    phoneCountry: text(form, 'phoneCountry'),
    phone: text(form, 'phone'),
    // Planche : un seul numéro à cette étape ; le WhatsApp public du restaurant se saisit à l'étape suivante.
    whatsapp: text(form, 'phone'),
  });
  if (!parsed.success) return { fieldErrors: await toFieldErrors(parsed.error.issues) };

  const values = { ...parsed.data, updatedAt: new Date() };
  await db()
    .insert(appSchema.profiles)
    .values({ userId: user.id, ...values })
    .onConflictDoUpdate({ target: appSchema.profiles.userId, set: values });
  redirect('/onboarding');
}

const UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
  const cause = typeof error === 'object' && error !== null && 'cause' in error ? error.cause : undefined;
  return code === UNIQUE_VIOLATION || (cause !== undefined && isUniqueViolation(cause));
}

async function takenSlugs(base: string): Promise<Set<string>> {
  // `base` sort de slugify : uniquement [a-z0-9-], donc aucun joker LIKE possible.
  const rows = await db().execute(sql`
    SELECT slug FROM ${appSchema.restaurants} WHERE ${like(appSchema.restaurants.slug, `${base}%`)}
    UNION SELECT slug FROM ${appSchema.slugHistory} WHERE ${like(appSchema.slugHistory.slug, `${base}%`)}
  `);
  return new Set(rows.rows.map((r) => String(r.slug)));
}

export async function createRestaurantAction(_prev: OnboardingFormState, form: FormData): Promise<OnboardingFormState> {
  const user = await requireUser();
  if (!(await getProfile(user.id))) redirect('/onboarding');
  if (await hasRestaurant(user.id)) redirect('/');

  const parsed = restaurantInputSchema.safeParse({
    name: text(form, 'name'),
    countryCode: text(form, 'countryCode'),
    city: text(form, 'city'),
    openedOn: text(form, 'openedOn') || undefined,
    currency: text(form, 'currency'),
    timezone: text(form, 'timezone'),
  });
  if (!parsed.success) return { fieldErrors: await toFieldErrors(parsed.error.issues) };
  const data = parsed.data;
  let publicWhatsapp: string | null = null;
  const whatsapp = text(form, 'whatsapp').trim();
  if (whatsapp) {
    try {
      publicWhatsapp = normalizePhone(whatsapp, data.countryCode);
    } catch (error) {
      if (!(error instanceof PhoneError)) throw error;
      return { fieldErrors: { whatsapp: (await getTranslations('onboarding.errors'))('invalid_phone') } };
    }
  }

  const base = slugify(data.name);
  // Deux restaurants peuvent viser le même slug au même instant : la base tranche, on réessaie avec le suivant.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = suggestSlug(base, await takenSlugs(base));
    try {
      await db().transaction(async (tx) => {
        const [restaurant] = await tx
          .insert(appSchema.restaurants)
          .values({ slug, name: data.name, countryCode: data.countryCode, city: data.city, openedOn: data.openedOn ?? null, currency: data.currency, timezone: data.timezone, publicWhatsapp })
          .returning({ id: appSchema.restaurants.id });
        if (!restaurant) throw new Error('restaurant insert returned nothing');
        await tx.insert(appSchema.restaurantMembers).values({ restaurantId: restaurant.id, userId: user.id, role: 'owner' });
      });
      redirect('/');
    } catch (error) {
      if (isUniqueViolation(error)) {
        // Le compte possède déjà un restaurant (double envoi) : rien à recréer.
        if (await hasRestaurantNow(user.id)) redirect('/');
        continue;
      }
      throw error;
    }
  }
  return { error: (await getTranslations('onboarding.errors'))('slugUnavailable') };
}
