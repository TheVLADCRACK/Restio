-- Contrôles bloquants du rôle restio_admin_app. À rejouer avant tout ALTER ROLE … LOGIN.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'restio_admin_app') THEN
    RAISE EXCEPTION 'rôle restio_admin_app absent';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_roles
     WHERE rolname = 'restio_admin_app'
       AND (rolsuper OR rolcreaterole OR rolcreatedb OR rolreplication OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'restio_admin_app : attribut privilégié';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'neon_superuser')
     AND pg_has_role('restio_admin_app', 'neon_superuser', 'MEMBER') THEN
    RAISE EXCEPTION 'restio_admin_app : membre de neon_superuser';
  END IF;

  IF pg_has_role('restio_admin_app', 'pg_read_all_data', 'MEMBER')
     OR pg_has_role('restio_admin_app', 'pg_write_all_data', 'MEMBER') THEN
    RAISE EXCEPTION 'restio_admin_app : membre de pg_read_all_data ou pg_write_all_data';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'neon_auth')
     AND has_schema_privilege('restio_admin_app', 'neon_auth', 'USAGE') THEN
    RAISE EXCEPTION 'restio_admin_app : USAGE sur le schéma neon_auth';
  END IF;

  IF to_regclass('neon_auth.jwks') IS NOT NULL
     AND (has_table_privilege('restio_admin_app', 'neon_auth.jwks', 'SELECT')
          OR has_table_privilege('public', 'neon_auth.jwks', 'SELECT')) THEN
    RAISE EXCEPTION 'SELECT sur neon_auth.jwks';
  END IF;

  IF has_schema_privilege('restio_admin_app', 'public', 'CREATE') THEN
    RAISE EXCEPTION 'restio_admin_app : CREATE sur le schéma public';
  END IF;

  IF has_any_column_privilege('restio_admin_app', 'public.audit_log', 'UPDATE')
     OR has_table_privilege('restio_admin_app', 'public.audit_log', 'DELETE')
     OR has_table_privilege('restio_admin_app', 'public.audit_log', 'TRUNCATE') THEN
    RAISE EXCEPTION 'restio_admin_app : UPDATE, DELETE ou TRUNCATE sur audit_log';
  END IF;

  IF has_table_privilege('restio_admin_app', 'public.deletion_requests', 'DELETE')
     OR has_column_privilege('restio_admin_app', 'public.deletion_requests', 'restaurant_id', 'UPDATE')
     OR has_column_privilege('restio_admin_app', 'public.deletion_requests', 'requested_by', 'UPDATE') THEN
    RAISE EXCEPTION 'restio_admin_app : droit excessif sur deletion_requests';
  END IF;

  RAISE NOTICE 'Assertions de droits : OK';
END
$$;
