'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hitRateLimit } from '@restio/db';
import { auth } from './server';
import { emailOtp } from './email-otp';
import { clearPendingEmail, getPendingEmail, setPendingEmail } from './pending-email';
import { getAdmin } from './session';
import { dbs } from '@/lib/db';
import { env } from '@/lib/env';
import { fingerprint, ipFingerprint } from '@/lib/request';

export type AdminFormState = { error?: string; info?: string } | null;

const GENERIC = 'Identifiants incorrects ou accès non autorisé.';
const RATE_LIMITED = 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
const email = z.email().trim().toLowerCase().max(254);

// Limite par IP stricte ; limite par compte 4× plus large, pour qu'un tiers ne puisse pas bloquer un compte à distance.
async function limited(action: string, limit: number, windowSeconds: number, subject?: string): Promise<boolean> {
  const keys = [`admin:${action}:ip:${await ipFingerprint()}`];
  if (subject) keys.push(`admin:${action}:sub:${fingerprint(subject)}`);
  for (const [i, key] of keys.entries()) {
    if ((await hitRateLimit(dbs().admin, key, windowSeconds)) > (i === 0 ? limit : limit * 4)) return true;
  }
  return false;
}

export async function adminSignInAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const parsed = z.object({ email, password: z.string().min(1).max(128) }).safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: GENERIC };
  if (await limited('sign-in', 5, 900, parsed.data.email)) return { error: RATE_LIMITED };

  const { error } = await auth.signIn.email({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { error: GENERIC };

  // Compte valide sur l'instance admin mais absent de la liste autorisée : session fermée aussitôt.
  if (!(await getAdmin())) {
    await auth.signOut();
    console.warn('[admin-auth] signed-in account not in allowlist');
    return { error: GENERIC };
  }
  redirect('/');
}

export async function adminSignOutAction(): Promise<void> {
  await auth.signOut();
  redirect('/auth/sign-in');
}

/** Premier accès ou mot de passe oublié : un code n'est envoyé qu'aux adresses autorisées, réponse identique sinon. */
export async function requestAdminCodeAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const parsed = email.safeParse(form.get('email'));
  if (!parsed.success) return { error: 'Adresse email invalide.' };
  if (await limited('code', 3, 900, parsed.data)) return { error: RATE_LIMITED };
  if (env().ADMIN_ALLOWED_EMAILS.includes(parsed.data)) {
    await emailOtp().sendVerificationOtp({ email: parsed.data, type: 'forget-password' });
  }
  await setPendingEmail(parsed.data);
  redirect('/auth/set-password');
}

export async function setAdminPasswordAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const pending = await getPendingEmail();
  if (!pending) redirect('/auth/first-access');
  const parsed = z
    .object({ code: z.string().trim().regex(/^\d{6}$/), password: z.string().min(14).max(128) })
    .safeParse({ code: form.get('code'), password: form.get('password') });
  if (!parsed.success) return { error: 'Code à 6 chiffres et mot de passe de 14 caractères minimum.' };
  if (await limited('set-password', 5, 900, pending)) return { error: RATE_LIMITED };

  const { error } = await emailOtp().resetPassword({ email: pending, otp: parsed.data.code, password: parsed.data.password });
  if (error) return { error: 'Ce code est incorrect ou a expiré.' };
  await clearPendingEmail();
  redirect('/auth/sign-in?password=1');
}
