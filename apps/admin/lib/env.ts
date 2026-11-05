import 'server-only';
import { z } from 'zod';

const schema = z.object({
  PROD_DATABASE_URL: z.string().url(),
  ADMIN_DATABASE_URL: z.string().url(),
  NEON_AUTH_BASE_URL: z.string().url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  IP_HASH_SALT: z.string().min(32),
  // Origine du site public, pour le lien « Voir le menu public ».
  PUBLIC_MENU_ORIGIN: z.url().default('https://restio-app.com'),
  ADMIN_ALLOWED_EMAILS: z
    .string()
    .min(3)
    .transform((v) => v.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)),
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
