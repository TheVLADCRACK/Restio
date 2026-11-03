import { defineConfig } from 'drizzle-kit';

// Rôle propriétaire (restio_admin_owner) : migrations uniquement, jamais le rôle d'exécution restio_admin_app.
const url = process.env.ADMIN_MIGRATION_DATABASE_URL;
if (!url) throw new Error('Variable d’environnement manquante : ADMIN_MIGRATION_DATABASE_URL');

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/admin.ts',
  out: './migrations/admin',
  dbCredentials: { url },
});
