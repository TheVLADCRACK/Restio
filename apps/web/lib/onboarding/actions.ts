'use server';

import { redirect } from 'next/navigation';
import { like, sql } from 'drizzle-orm';
import { profileInputSchema, restaurantInputSchema, slugify, suggestSlug } from '@restio/core';
import { appSchema } from '@restio/db';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { getProfile, hasRestaurant, hasRestaurantNow } from './state';

export type OnboardingFormState = { error?: string; fieldErrors?: Record<string, string> } | null;

const FIELD_MESSAGES: Record<string, string> = {
  invalid_phone: 'Ce numéro n’est pas valide pour le pays choisi.',
  invalid_country: 'Choisissez un pays dans la liste.',
  invalid_currency: 'Choisissez une devise dans la liste.',
  invalid_timezone: 'Fuseau horaire inconnu.',
  future_date: 'La date d’ouverture ne peut pas être dans le futur.',
};

function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  return Object.fromEntries(issues.map((i) => [String(i.path[0] ?? 'form'), FIELD_MESSAGES[i.message] ?? 'Valeur invalide.']));
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
    whatsapp: text(form, 'whatsapp'),
  });
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues) };

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
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues) };
  const data = parsed.data;

  const base = slugify(data.name);
  // Deux restaurants peuvent viser le même slug au même instant : la base tranche, on réessaie avec le suivant.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = suggestSlug(base, await takenSlugs(base));
    try {
      await db().transaction(async (tx) => {
        const [restaurant] = await tx
          .insert(appSchema.restaurants)
          .values({ slug, name: data.name, countryCode: data.countryCode, city: data.city, openedOn: data.openedOn ?? null, currency: data.currency, timezone: data.timezone })
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
  return { error: 'Impossible de réserver une adresse pour ce nom. Réessayez avec un nom légèrement différent.' };
}
