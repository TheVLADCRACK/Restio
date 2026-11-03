import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth } from './server';
import { env } from '@/lib/env';

export type AdminUser = { id: string; email: string };

/**
 * Un administrateur = session valide sur l'instance Neon Auth de la branche admin,
 * email vérifié ET présent dans ADMIN_ALLOWED_EMAILS. Le rôle Better Auth n'est jamais consulté.
 */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  // Pas de cache de session signé côté admin : une déconnexion ou révocation prend effet immédiatement.
  const { data } = await auth.getSession({ query: { disableCookieCache: 'true' } });
  const u = data?.user;
  if (!u?.id || !u.email || !u.emailVerified) return null;
  const email = u.email.toLowerCase();
  return env().ADMIN_ALLOWED_EMAILS.includes(email) ? { id: u.id, email } : null;
});

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect('/auth/sign-in');
  return admin;
}
