import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { env } from '@/lib/env';

// Vercel écrase ces en-têtes à l'entrée : on ne lit jamais une valeur fournie librement par le client derrière un autre proxy.
async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

/** Empreinte salée : pseudonymise l'IP ou l'email dans les clés de limitation. */
export function fingerprint(value: string): string {
  return createHash('sha256').update(`${env().IP_HASH_SALT}:${value.toLowerCase()}`).digest('base64url').slice(0, 32);
}

export async function ipFingerprint(): Promise<string> {
  return fingerprint(await clientIp());
}
