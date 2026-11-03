-- Rôles d'exécution de la base métier (DATABASE.md §5.1–5.2). À exécuter avec le rôle propriétaire (neondb_owner).
-- Créés en SQL et NOLOGIN : un rôle créé depuis la console Neon serait membre de neon_superuser.
-- Les mots de passe ne sont JAMAIS dans le dépôt. Après relecture et succès de 0006_assertions.sql, hors dépôt :
--   ALTER ROLE restio_app WITH LOGIN PASSWORD '<secret généré>';
--   ALTER ROLE restio_admin_ops WITH LOGIN PASSWORD '<secret généré>';
-- Rejouable : tous les droits sont retirés puis réaccordés à l'identique.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'restio_app') THEN
    CREATE ROLE restio_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'restio_admin_ops') THEN
    CREATE ROLE restio_admin_ops NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
END
$$;

-- Schéma neon_auth : aucun accès (mots de passe hachés, clés privées jwks). Absent sur une branche sans Neon Auth.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'neon_auth') THEN
    REVOKE ALL ON SCHEMA neon_auth FROM PUBLIC, restio_app, restio_admin_ops;
    REVOKE ALL ON ALL TABLES IN SCHEMA neon_auth FROM PUBLIC, restio_app, restio_admin_ops;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA neon_auth FROM PUBLIC, restio_app, restio_admin_ops;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA neon_auth FROM restio_app, restio_admin_ops;
  END IF;
END
$$;

-- Point de départ commun : aucun droit, puis accords explicites ci-dessous.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM restio_app, restio_admin_ops;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM restio_app, restio_admin_ops;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM restio_app, restio_admin_ops;
REVOKE ALL ON SCHEMA public FROM restio_app, restio_admin_ops;
GRANT USAGE ON SCHEMA public TO restio_app, restio_admin_ops;

-- Aucune séquence à accorder : toutes les clés de la base métier sont des uuid (uuidv7()).

/* restio_app (apps/web) */

-- restaurants : UPDATE limité aux colonnes modifiables par le restaurateur (jamais id, status, order_seq, created_at).
-- Un UPDATE accordé sur toute la table l'emporterait sur tout REVOKE par colonne. Pas de DELETE.
GRANT SELECT, INSERT ON public.restaurants TO restio_app;
GRANT UPDATE (
  slug, name, country_code, city, address, opened_on, currency, timezone, description,
  logo_key, banner_key, public_phone, public_whatsapp, appearance,
  is_published, is_indexable, onboarding, updated_at
) ON public.restaurants TO restio_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles,
  public.categories,
  public.dishes,
  public.push_subscriptions,
  public.announcement_dismissals
TO restio_app;

GRANT SELECT, INSERT ON public.restaurant_members TO restio_app;

GRANT SELECT, INSERT ON public.orders TO restio_app;
GRANT UPDATE (status, updated_at) ON public.orders TO restio_app;

GRANT SELECT, INSERT ON public.order_items, public.order_status_events TO restio_app;

GRANT SELECT, INSERT ON public.notifications TO restio_app;
GRANT UPDATE (read_at) ON public.notifications TO restio_app;

-- slug_history : écrit uniquement par le trigger restaurants_slug_guard (0005_guards.sql).
GRANT SELECT ON public.slug_history TO restio_app;
GRANT SELECT, INSERT, UPDATE ON public.menu_views_daily TO restio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limit_buckets TO restio_app;

GRANT SELECT ON public.platform_settings, public.announcements, public.plans, public.subscriptions TO restio_app;

-- next_order_number n'est appelé que par le trigger orders_force_defaults (0005_guards.sql) : aucun EXECUTE pour restio_app.
REVOKE EXECUTE ON FUNCTION public.next_order_number(uuid) FROM restio_app;

/* restio_admin_ops (apps/admin, base métier) */

GRANT SELECT ON
  public.profiles,
  public.restaurants,
  public.restaurant_members,
  public.slug_history,
  public.categories,
  public.dishes,
  public.orders,
  public.order_items,
  public.order_status_events,
  public.notifications,
  public.push_subscriptions,
  public.menu_views_daily,
  public.platform_settings,
  public.announcements,
  public.announcement_dismissals,
  public.plans,
  public.subscriptions
TO restio_admin_ops;

GRANT UPDATE (status, updated_at) ON public.restaurants TO restio_admin_ops;
GRANT DELETE ON public.restaurants, public.profiles, public.announcement_dismissals TO restio_admin_ops;
GRANT INSERT, UPDATE, DELETE ON public.platform_settings, public.announcements TO restio_admin_ops;

-- Les objets créés plus tard par le rôle de migration ne reçoivent aucun droit implicite.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, restio_app, restio_admin_ops;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, restio_app, restio_admin_ops;
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

COMMIT;
