import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { appSchema } from '@restio/db';
import { auth } from './server';
import { db } from '@/lib/db';

export type SessionUser = { id: string; email: string; name: string; emailVerified: boolean };
export type Membership = { userId: string; restaurantId: string; role: 'owner' };

/** Session lue côté serveur à chaque requête (cache limité au rendu en cours). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const { data } = await auth.getSession();
  const u = data?.user;
  if (!u?.id || !u.email) return null;
  return { id: u.id, email: u.email, name: u.name ?? '', emailVerified: Boolean(u.emailVerified) };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/auth/sign-in');
  if (!user.emailVerified) redirect('/auth/verify-email');
  return user;
}

const getMembership = cache(async (userId: string): Promise<Membership | null> => {
  const [row] = await db()
    .select({ restaurantId: appSchema.restaurantMembers.restaurantId, role: appSchema.restaurantMembers.role })
    .from(appSchema.restaurantMembers)
    .where(eq(appSchema.restaurantMembers.userId, userId))
    .limit(1);
  return row ? { userId, restaurantId: row.restaurantId, role: row.role } : null;
});

/**
 * Seule source du restaurant courant : la session, jamais un identifiant envoyé par le navigateur.
 * À appeler dans chaque page, action et route qui lit ou écrit des données d'un restaurant.
 */
export async function requireMembership(): Promise<Membership & { user: SessionUser }> {
  const user = await requireUser();
  const membership = await getMembership(user.id);
  if (!membership) redirect('/onboarding');
  return { ...membership, user };
}
