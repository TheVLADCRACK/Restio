import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleHttp, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as appSchema from './schema/app';
import * as adminSchema from './schema/admin';
import { resilientFetch } from './resilient-fetch';

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

// Types explicites : l'inférence des types Drizzle imbriqués fait déborder le compilateur TypeScript.
export type AppDb = NeonDatabase<typeof appSchema> & { $client: Pool };
export type AdminDbs = { prod: AppDb; admin: NeonDatabase<typeof adminSchema> & { $client: Pool } };
export type AdminDb = AdminDbs['admin'];
/** Lectures par HTTP : plusieurs requêtes en un seul aller-retour avec `.batch()`, sans connexion à ouvrir. */
export type AppReadDb = NeonHttpDatabase<typeof appSchema>;

function pool(envName: string): Pool {
  const p = new Pool({ connectionString: requireEnv(envName) });
  // Une connexion inactive qui tombe ne doit pas arrêter le processus ; le message ne contient pas la chaîne de connexion.
  p.on('error', (err: Error) => console.error(`[db] ${envName} pool error: ${err.message}`));
  return p;
}

// Un seul pool par processus et par base : réutilisé entre les requêtes.
let appDb: AppDb | undefined;
let appReadDb: AppReadDb | undefined;
let adminDbs: AdminDbs | undefined;

/** apps/web : rôle restio_app sur la base métier. */
export function createAppDb(): AppDb {
  appDb ??= drizzle({ client: pool('DATABASE_URL'), schema: appSchema });
  return appDb;
}

/** apps/web, lectures de page : même rôle restio_app, transport HTTP (pas de transaction interactive). */
export function createAppReadDb(): AppReadDb {
  // Ce client ne sert qu'aux lectures : rejouer une requête après une panne réseau est sans risque.
  neonConfig.fetchFunction = resilientFetch;
  appReadDb ??= drizzleHttp({ client: neon(requireEnv('DATABASE_URL')), schema: appSchema });
  return appReadDb;
}

/** apps/admin : rôle restio_admin_ops sur la base métier et rôle restio_admin_app sur la base d'administration. */
export function createAdminDbs(): AdminDbs {
  adminDbs ??= {
    prod: drizzle({ client: pool('PROD_DATABASE_URL'), schema: appSchema }),
    admin: drizzle({ client: pool('ADMIN_DATABASE_URL'), schema: adminSchema }),
  };
  return adminDbs;
}
