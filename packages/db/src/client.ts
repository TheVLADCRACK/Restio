import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as appSchema from './schema/app';
import * as adminSchema from './schema/admin';

// Module serveur uniquement : les chaînes de connexion ne doivent jamais atteindre un navigateur.
if (typeof window !== 'undefined') {
  throw new Error('@restio/db ne doit pas être importé côté navigateur.');
}

neonConfig.webSocketConstructor = ws;

function requireEnv(name: string): string {
  const value = process.env[name];
  // Le message nomme la variable, jamais sa valeur.
  if (!value) throw new Error(`Variable d’environnement manquante : ${name}`);
  return value;
}

function connect<TSchema extends Record<string, unknown>>(envName: string, schema: TSchema) {
  const pool = new Pool({ connectionString: requireEnv(envName) });
  // Une connexion inactive qui tombe ne doit pas arrêter le processus ; le message ne contient pas la chaîne de connexion.
  pool.on('error', (err: Error) => console.error(`[db] ${envName} pool error: ${err.message}`));
  return drizzle({ client: pool, schema });
}

// Un seul pool par processus et par base : réutilisé entre les requêtes.
let appDb: ReturnType<typeof connect<typeof appSchema>> | undefined;
let adminDbs: { prod: ReturnType<typeof connect<typeof appSchema>>; admin: ReturnType<typeof connect<typeof adminSchema>> } | undefined;

/** apps/web : rôle restio_app sur la base métier. */
export function createAppDb() {
  appDb ??= connect('DATABASE_URL', appSchema);
  return appDb;
}

/** apps/admin : rôle restio_admin_ops sur la base métier et rôle restio_admin_app sur la base d'administration. */
export function createAdminDbs() {
  adminDbs ??= {
    prod: connect('PROD_DATABASE_URL', appSchema),
    admin: connect('ADMIN_DATABASE_URL', adminSchema),
  };
  return adminDbs;
}

export type AppDb = ReturnType<typeof createAppDb>;
export type AdminDb = ReturnType<typeof createAdminDbs>['admin'];
