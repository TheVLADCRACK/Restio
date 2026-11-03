import 'server-only';
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  NEON_AUTH_BASE_URL: z.string().url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  ROOT_HOST: z.string().min(1),
  APP_HOST: z.string().min(1),
  IP_HASH_SALT: z.string().min(32),
});

// Valide une seule fois, au premier accès, sans jamais afficher les valeurs.
let cached: z.infer<typeof schema> | undefined;
export function env(): z.infer<typeof schema> {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid server environment: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}
