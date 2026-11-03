// Active un rôle d'exécution (LOGIN + mot de passe) sans que le secret ne quitte le poste.
// Usage, depuis la racine du dépôt, dans votre propre terminal :
//   OWNER_DATABASE_URL='<chaîne neondb_owner de la branche>' node packages/db/scripts/activate-role.mjs <rôle> <fichier .env.local> <variable>
// Le mot de passe est lu dans la chaîne de connexion <variable> du fichier .env.local ; rien n'est affiché.
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const [role, envFile, variable] = process.argv.slice(2);
const ownerUrl = process.env.OWNER_DATABASE_URL;
const ALLOWED_ROLES = new Set(['restio_app', 'restio_admin_ops', 'restio_admin_app']);

if (!ownerUrl || !role || !envFile || !variable) {
  console.error('Usage : OWNER_DATABASE_URL=… node packages/db/scripts/activate-role.mjs <rôle> <fichier .env.local> <variable>');
  process.exit(1);
}
if (!ALLOWED_ROLES.has(role)) {
  console.error(`Rôle refusé : ${role}`);
  process.exit(1);
}

const line = readFileSync(envFile, 'utf8').split('\n').find((l) => l.startsWith(`${variable}=`));
if (!line) {
  console.error(`${variable} absent de ${envFile}`);
  process.exit(1);
}
let url;
try {
  url = new URL(line.slice(variable.length + 1).trim().replace(/^["']|["']$/g, ''));
} catch {
  // Jamais afficher la valeur : elle contient le mot de passe.
  console.error(`${variable} n'est pas une URL valide.`);
  process.exit(1);
}
if (url.username !== role) {
  console.error(`${variable} ne correspond pas au rôle ${role}`);
  process.exit(1);
}
const password = decodeURIComponent(url.password);
// Le mot de passe est généré (base64url) : on refuse tout caractère qui exigerait un échappement SQL.
if (!/^[A-Za-z0-9_-]{24,}$/.test(password)) {
  console.error('Mot de passe au format inattendu : régénérez-le.');
  process.exit(1);
}

const sql = neon(ownerUrl);
await sql.query(`ALTER ROLE ${role} WITH LOGIN PASSWORD '${password}'`);
const [check] = await sql.query('SELECT rolcanlogin FROM pg_roles WHERE rolname = $1', [role]);
console.log(check?.rolcanlogin ? `Rôle ${role} activé.` : `Échec : ${role} toujours sans LOGIN.`);
