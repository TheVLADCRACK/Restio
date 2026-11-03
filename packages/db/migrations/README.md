# Migrations

Deux bases, deux dossiers : `app/` (branche `production`, base `neondb`) et `admin/` (branche `admin`, base `restio_admin`). Référence : `DATABASE.md`.

## Règle

**Toujours sur une branche Neon de test d'abord** (créée depuis `production`, ou « schéma seulement » pour `admin`), puis sur la branche réelle. Toute migration destructive exige un instantané Neon et la validation explicite du propriétaire.

Les migrations s'exécutent avec le rôle **propriétaire** (`neondb_owner` / `restio_admin_owner`), jamais avec un rôle d'exécution.

## Ordre d'application

1. Tables (Drizzle Kit), depuis `packages/db` :
   ```sh
   npm run generate        # après une modification de src/schema/*.ts ; relire le SQL produit
   APP_MIGRATION_DATABASE_URL=… npm run migrate
   ADMIN_MIGRATION_DATABASE_URL=… npm run migrate:admin
   ```
2. Fichiers `manual/`, dans l'ordre numérique, arrêt à la première erreur :
   ```sh
   for f in migrations/app/manual/*.sql; do psql "$APP_MIGRATION_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f" || break; done
   for f in migrations/admin/manual/*.sql; do psql "$ADMIN_MIGRATION_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f" || break; done
   ```
   Ils sont rejouables. Les fichiers d'assertions (`app/manual/0006_assertions.sql`, `admin/manual/0002_assertions.sql`) doivent afficher `Assertions de droits : OK`.
3. Hors dépôt, une seule fois par branche, avec un secret généré :
   ```sql
   ALTER ROLE restio_app WITH LOGIN PASSWORD '…';        -- base neondb
   ALTER ROLE restio_admin_ops WITH LOGIN PASSWORD '…';  -- base neondb
   ALTER ROLE restio_admin_app WITH LOGIN PASSWORD '…';  -- base restio_admin
   ```
   Ne jamais créer ni modifier ces rôles depuis la console Neon (ils deviendraient membres de `neon_superuser`).

## Quand ajouter un fichier `manual/`

- Toute nouvelle table : ajouter ses droits dans le fichier de rôles (aucun droit par défaut) et ses contrôles dans le fichier d'assertions.
- Ce que Drizzle ne sait pas exprimer (ex. `ON DELETE SET NULL (colonne)` dans `0002_fk_fixes.sql`). Drizzle Kit compare le schéma à ses instantanés `meta/`, pas à la base : il ne tente pas d'annuler ces corrections.
