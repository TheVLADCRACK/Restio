'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hitRateLimit } from '@restio/db';
import { auth } from './server';
import { emailOtp } from './email-otp';
import { clearPendingEmail, getPendingEmail, setPendingEmail } from './pending-email';
import { db } from '@/lib/db';
import { fingerprint, ipFingerprint } from '@/lib/request';

export type AuthFormState = { error?: string; fieldErrors?: Record<string, string>; info?: string } | null;

const email = z.email().trim().toLowerCase().max(254);
const password = z.string().min(10, 'Au moins 10 caractères.').max(128);
const otp = z.string().trim().regex(/^\d{6}$/, 'Le code contient 6 chiffres.');

const MESSAGES = {
  rateLimited: 'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
  invalidCredentials: 'Adresse email ou mot de passe incorrect.',
  unavailable: 'Le service de connexion ne répond pas. Réessayez dans un instant.',
  invalidCode: 'Ce code est incorrect ou a expiré.',
} as const;

// Le SDK normalise les codes Better Auth en minuscules (ex. USER_ALREADY_EXISTS → user_already_exists).
function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' ? error.code.toLowerCase() : undefined;
}

// Journal sans donnée personnelle : code, statut HTTP et message technique de Neon Auth.
function logAuthError(step: string, error: unknown): void {
  const status = typeof error === 'object' && error !== null && 'status' in error ? String(error.status) : '?';
  const message = error instanceof Error ? error.message.slice(0, 200) : '';
  console.error(`[auth] ${step} failed: ${errorCode(error) ?? 'unknown'} (${status}) ${message}`);
}

function fieldErrors(issues: z.core.$ZodIssue[]): Record<string, string> {
  return Object.fromEntries(issues.map((i) => [String(i.path[0] ?? 'form'), i.message]));
}

// Limite par IP stricte ; limite par compte 4× plus large, pour qu'un tiers ne puisse pas bloquer un compte à distance.
async function limited(action: string, limit: number, windowSeconds: number, subject?: string): Promise<boolean> {
  const keys = [`auth:${action}:ip:${await ipFingerprint()}`];
  if (subject) keys.push(`auth:${action}:sub:${fingerprint(subject)}`);
  for (const [i, key] of keys.entries()) {
    if ((await hitRateLimit(db(), key, windowSeconds)) > (i === 0 ? limit : limit * 4)) return true;
  }
  return false;
}

export async function signUpAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = z.object({ email, password }).safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  // Consentement explicite exigé côté serveur (la case du formulaire ne suffit pas).
  if (form.get('terms') !== 'on') return { fieldErrors: { terms: 'Acceptez les conditions pour créer votre compte.' } };
  if (await limited('sign-up', 5, 600, parsed.data.email)) return { error: MESSAGES.rateLimited };

  const { error } = await auth.signUp.email({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.email.split('@')[0] ?? 'Restaurateur',
  });
  // Adresse déjà utilisée : même suite que pour une nouvelle adresse, pour ne pas révéler l'existence d'un compte.
  if (error && errorCode(error) !== 'user_already_exists') {
    logAuthError('sign-up', error);
    return { error: MESSAGES.unavailable };
  }
  await setPendingEmail(parsed.data.email);
  redirect('/auth/verify-email');
}

export async function verifyEmailAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const pending = await getPendingEmail();
  if (!pending) redirect('/auth/sign-in');
  const parsed = otp.safeParse(form.get('code'));
  if (!parsed.success) return { fieldErrors: { code: parsed.error.issues[0]?.message ?? MESSAGES.invalidCode } };
  if (await limited('verify', 10, 900, pending)) return { error: MESSAGES.rateLimited };

  const { error } = await emailOtp().verifyEmail({ email: pending, otp: parsed.data });
  if (error) return { fieldErrors: { code: MESSAGES.invalidCode } };
  await clearPendingEmail();
  // La vérification n'ouvre pas toujours de session côté serveur : la page de connexion renvoie vers l'app si elle existe.
  redirect('/auth/sign-in?verified=1');
}

export async function resendCodeAction(_prev: AuthFormState): Promise<AuthFormState> {
  const pending = await getPendingEmail();
  if (!pending) redirect('/auth/sign-in');
  if (await limited('resend', 3, 600, pending)) return { error: MESSAGES.rateLimited };
  await emailOtp().sendVerificationOtp({ email: pending, type: 'email-verification' });
  return { info: 'Un nouveau code vient d’être envoyé.' };
}

export async function signInAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = z.object({ email, password: z.string().min(1).max(128) }).safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: MESSAGES.invalidCredentials };
  if (await limited('sign-in', 10, 900, parsed.data.email)) return { error: MESSAGES.rateLimited };

  const { error } = await auth.signIn.email({ email: parsed.data.email, password: parsed.data.password });
  if (error) {
    // Le mot de passe est correct mais l'adresse n'est pas vérifiée : on reprend la vérification.
    if (errorCode(error) === 'email_not_confirmed') {
      await setPendingEmail(parsed.data.email);
      redirect('/auth/verify-email');
    }
    return { error: MESSAGES.invalidCredentials };
  }
  redirect('/');
}

export async function signOutAction(): Promise<void> {
  await auth.signOut();
  redirect('/auth/sign-in');
}

export async function requestPasswordResetAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = email.safeParse(form.get('email'));
  if (!parsed.success) return { fieldErrors: { email: 'Adresse email invalide.' } };
  if (!(await limited('reset-request', 3, 900, parsed.data))) {
    await emailOtp().sendVerificationOtp({ email: parsed.data, type: 'forget-password' });
  }
  // Réponse identique que l'adresse existe ou non.
  await setPendingEmail(parsed.data);
  redirect('/auth/reset-password');
}

export async function resetPasswordAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const pending = await getPendingEmail();
  if (!pending) redirect('/auth/forgot-password');
  const parsed = z.object({ code: otp, password }).safeParse({ code: form.get('code'), password: form.get('password') });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  if (await limited('reset', 10, 900, pending)) return { error: MESSAGES.rateLimited };

  const { error } = await emailOtp().resetPassword({ email: pending, otp: parsed.data.code, password: parsed.data.password });
  if (error) return { fieldErrors: { code: MESSAGES.invalidCode } };
  await clearPendingEmail();
  redirect('/auth/sign-in?reset=1');
}
