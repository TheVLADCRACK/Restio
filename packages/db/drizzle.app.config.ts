import { defineConfig } from 'drizzle-kit';

// Rôle propriétaire (neondb_owner) : migrations uniquement, jamais le rôle d'exécution restio_app.
const url = process.env.APP_MIGRATION_DATABASE_URL;
if (!url) throw new Error('Variable d’environnement manquante : APP_MIGRATION_DATABASE_URL');

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/app.ts',
  out: './migrations/app',
  dbCredentials: { url },
});
