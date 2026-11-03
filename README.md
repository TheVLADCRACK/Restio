# Restio

Menus QR et commandes pour restaurants. Monorepo npm : `apps/web` (site, menus publics, application restaurateur), `apps/admin` (administration), `packages/core` (règles métier), `packages/db` (schéma et migrations Drizzle), `packages/ui` (tokens du design system).

Documentation : [PROJECT.md](PROJECT.md) (produit), [TECHNICAL.md](TECHNICAL.md) (architecture), [DATABASE.md](DATABASE.md) (données et droits), [DESIGN.md](DESIGN.md) (design system), [AUDIT.md](AUDIT.md) (décisions et état d'avancement), [CLAUDE.md](CLAUDE.md) (règles de développement).

## Prérequis

Node.js 22 ou plus récent (24 recommandé), npm 11.

## Lancement local

```bash
npm install
cp .env.example apps/web/.env.local     # puis renseigner les valeurs de la section apps/web
cp .env.example apps/admin/.env.local   # puis renseigner les valeurs de la section apps/admin
npm run dev:web                          # http://localhost:3000 et http://app.localhost:3000
npm run dev:admin                        # http://localhost:3001
```

Les menus publics se testent sur `http://localhost:3000/@slug`.

## Vérifications (identiques à la CI)

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Base de données

Voir [packages/db/migrations/README.md](packages/db/migrations/README.md). Règle : toujours appliquer une migration sur une branche Neon de test avant `production`, avec le rôle propriétaire ; jamais de migration destructive sans instantané et validation du propriétaire.

## Déploiement

Deux projets Vercel (`restio-web`, `restio-admin`) reliés au même dépôt GitHub, avec des variables d'environnement séparées (voir `.env.example`). Non configuré à ce jour.
