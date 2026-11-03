import 'server-only';
import { cookies } from 'next/headers';

// Email en attente de vérification : cookie httpOnly court, jamais dans l'URL.
const NAME = 'restio_admin_pending_email';

export async function setPendingEmail(email: string): Promise<void> {
  (await cookies()).set(NAME, email, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 30 });
}

export async function getPendingEmail(): Promise<string | null> {
  return (await cookies()).get(NAME)?.value ?? null;
}

export async function clearPendingEmail(): Promise<void> {
  (await cookies()).delete(NAME);
}
