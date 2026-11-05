'use server';

import { cookies } from 'next/headers';
import { isLocale, LOCALE_COOKIE } from './locale';

/** Enregistre la langue choisie ; « device » revient à la langue de l'appareil. */
export async function setLocaleAction(value: string): Promise<void> {
  const store = await cookies();
  if (value === 'device') {
    store.delete(LOCALE_COOKIE);
    return;
  }
  if (!isLocale(value)) return;
  store.set(LOCALE_COOKIE, value, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', httpOnly: true });
}
