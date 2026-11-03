-- Rôle d'exécution de la base d'administration (DATABASE.md §4–5). À exécuter avec le rôle propriétaire (restio_admin_owner).
-- NOLOGIN ici ; mot de passe jamais dans le dépôt. Après succès de 0002_assertions.sql, hors dépôt :
--   ALTER ROLE restio_admin_app WITH LOGIN PASSWORD '<secret généré>';
-- Rejouable : tous les droits sont retirés puis réaccordés à l'identique.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'restio_admin_app') THEN
    CREATE ROLE restio_admin_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'neon_auth') THEN
    REVOKE ALL ON SCHEMA neon_auth FROM PUBLIC, restio_admin_app;
    REVOKE ALL ON ALL TABLES IN SCHEMA neon_auth FROM PUBLIC, restio_admin_app;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA neon_auth FROM PUBLIC, restio_admin_app;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA neon_auth FROM restio_admin_app;
  END IF;
END
$$;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM restio_admin_app;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM restio_admin_app;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM restio_admin_app;
REVOKE ALL ON SCHEMA public FROM restio_admin_app;
GRANT USAGE ON SCHEMA public TO restio_admin_app;

-- Journal immuable : ni UPDATE ni DELETE. La colonne identité n'exige aucun droit sur sa séquence.
GRANT SELECT, INSERT ON public.audit_log TO restio_admin_app;

-- UPDATE restreint aux colonnes qui évoluent au fil des trois étapes.
GRANT SELECT, INSERT ON public.deletion_requests TO restio_admin_app;
GRANT UPDATE (step, reauthenticated_at, executed_at) ON public.deletion_requests TO restio_admin_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limit_buckets TO restio_admin_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, restio_admin_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, restio_admin_app;
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

COMMIT;
