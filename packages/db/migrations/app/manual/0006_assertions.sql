-- Contrôles bloquants : échoue si un rôle d'exécution dispose d'un droit qui dépasse DATABASE.md §5.
-- À rejouer après chaque migration qui touche aux droits, et avant tout ALTER ROLE … LOGIN.

DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['restio_app', 'restio_admin_ops'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      RAISE EXCEPTION 'rôle % absent', r;
    END IF;

    IF EXISTS (
      SELECT 1 FROM pg_roles
       WHERE rolname = r
         AND (rolsuper OR rolcreaterole OR rolcreatedb OR rolreplication OR rolbypassrls)
    ) THEN
      RAISE EXCEPTION 'rôle % : attribut privilégié', r;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'neon_superuser')
       AND pg_has_role(r, 'neon_superuser', 'MEMBER') THEN
      RAISE EXCEPTION 'rôle % : membre de neon_superuser', r;
    END IF;

    IF pg_has_role(r, 'pg_read_all_data', 'MEMBER') OR pg_has_role(r, 'pg_write_all_data', 'MEMBER') THEN
      RAISE EXCEPTION 'rôle % : membre de pg_read_all_data ou pg_write_all_data', r;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'neon_auth')
       AND has_schema_privilege(r, 'neon_auth', 'USAGE') THEN
      RAISE EXCEPTION 'rôle % : USAGE sur le schéma neon_auth', r;
    END IF;

    IF to_regclass('neon_auth.jwks') IS NOT NULL
       AND has_table_privilege(r, 'neon_auth.jwks', 'SELECT') THEN
      RAISE EXCEPTION 'rôle % : SELECT sur neon_auth.jwks', r;
    END IF;

    IF has_schema_privilege(r, 'public', 'CREATE') THEN
      RAISE EXCEPTION 'rôle % : CREATE sur le schéma public', r;
    END IF;
  END LOOP;

  IF to_regclass('neon_auth.jwks') IS NOT NULL
     AND has_table_privilege('public', 'neon_auth.jwks', 'SELECT') THEN
    RAISE EXCEPTION 'PUBLIC : SELECT sur neon_auth.jwks';
  END IF;

  -- restio_app : colonnes protégées de restaurants.
  IF has_column_privilege('restio_app', 'public.restaurants', 'status', 'UPDATE')
     OR has_column_privilege('restio_app', 'public.restaurants', 'order_seq', 'UPDATE')
     OR has_column_privilege('restio_app', 'public.restaurants', 'id', 'UPDATE')
     OR has_column_privilege('restio_app', 'public.restaurants', 'created_at', 'UPDATE') THEN
    RAISE EXCEPTION 'restio_app : UPDATE sur une colonne protégée de restaurants';
  END IF;

  IF has_table_privilege('restio_app', 'public.restaurants', 'DELETE')
     OR has_table_privilege('restio_app', 'public.restaurants', 'TRUNCATE') THEN
    RAISE EXCEPTION 'restio_app : DELETE ou TRUNCATE sur restaurants';
  END IF;

  -- Historiques en ajout seulement.
  IF has_any_column_privilege('restio_app', 'public.order_status_events', 'UPDATE')
     OR has_table_privilege('restio_app', 'public.order_status_events', 'DELETE')
     OR has_any_column_privilege('restio_app', 'public.order_items', 'UPDATE')
     OR has_table_privilege('restio_app', 'public.order_items', 'DELETE') THEN
    RAISE EXCEPTION 'restio_app : UPDATE ou DELETE sur order_status_events ou order_items';
  END IF;

  IF has_column_privilege('restio_app', 'public.orders', 'total_amount', 'UPDATE')
     OR has_table_privilege('restio_app', 'public.orders', 'DELETE') THEN
    RAISE EXCEPTION 'restio_app : UPDATE de total_amount ou DELETE sur orders';
  END IF;

  IF has_any_column_privilege('restio_app', 'public.subscriptions', 'UPDATE')
     OR has_any_column_privilege('restio_app', 'public.platform_settings', 'UPDATE')
     OR has_any_column_privilege('restio_app', 'public.announcements', 'UPDATE') THEN
    RAISE EXCEPTION 'restio_app : écriture sur une table réservée à l''administration';
  END IF;

  -- restio_admin_ops : seule la colonne status (et updated_at) de restaurants est modifiable.
  IF has_column_privilege('restio_admin_ops', 'public.restaurants', 'order_seq', 'UPDATE')
     OR has_column_privilege('restio_admin_ops', 'public.restaurants', 'slug', 'UPDATE') THEN
    RAISE EXCEPTION 'restio_admin_ops : UPDATE hors de restaurants.status';
  END IF;

  -- next_order_number : jamais exécutable par PUBLIC.
  IF has_function_privilege('public', 'public.next_order_number(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'PUBLIC : EXECUTE sur next_order_number';
  END IF;

  IF has_table_privilege('restio_app', 'public.slug_history', 'INSERT')
     OR has_any_column_privilege('restio_app', 'public.slug_history', 'UPDATE')
     OR has_table_privilege('restio_app', 'public.slug_history', 'DELETE') THEN
    RAISE EXCEPTION 'restio_app : écriture sur slug_history (réservée au trigger)';
  END IF;

  IF has_function_privilege('restio_app', 'public.next_order_number(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'restio_app : EXECUTE sur next_order_number (réservé au trigger)';
  END IF;

  IF has_table_privilege('restio_app', 'public.subscriptions', 'INSERT') THEN
    RAISE EXCEPTION 'restio_app : INSERT sur subscriptions (réservé au trigger)';
  END IF;

  IF to_regprocedure('public.restaurants_slug_guard()') IS NULL
     OR to_regprocedure('public.orders_force_defaults()') IS NULL
     OR to_regprocedure('public.restaurants_force_defaults()') IS NULL THEN
    RAISE EXCEPTION 'trigger de garde manquant';
  END IF;

  RAISE NOTICE 'Assertions de droits : OK';
END
$$;
