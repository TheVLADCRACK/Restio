-- Règles imposées par la base, quel que soit le code applicatif.
-- 1. Un slug retiré n'est jamais réattribué à un autre restaurant (QR Codes déjà imprimés).
-- 2. Une commande naît toujours au statut « new » avec le prochain numéro du restaurant.
-- Rejouable : CREATE OR REPLACE, DROP TRIGGER IF EXISTS.

CREATE OR REPLACE FUNCTION public.restaurants_slug_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.slug = OLD.slug THEN
    RETURN NEW;
  END IF;

  -- Verrous pris dans un ordre stable (ancien slug puis nouveau) : deux changements croisés se sérialisent.
  IF TG_OP = 'UPDATE' THEN
    PERFORM pg_advisory_xact_lock(hashtext('restio_slug:' || OLD.slug));
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('restio_slug:' || NEW.slug));

  IF EXISTS (
    SELECT 1 FROM public.slug_history
     WHERE slug = NEW.slug AND restaurant_id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION 'slug_unavailable' USING ERRCODE = 'unique_violation';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.slug_history (slug, restaurant_id) VALUES (OLD.slug, NEW.id)
    ON CONFLICT (slug) DO NOTHING;
    -- Un restaurant peut reprendre l'un de ses propres anciens slugs.
    DELETE FROM public.slug_history WHERE slug = NEW.slug AND restaurant_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.restaurants_slug_guard() FROM PUBLIC;

DROP TRIGGER IF EXISTS restaurants_slug_guard ON public.restaurants;
CREATE TRIGGER restaurants_slug_guard
  BEFORE INSERT OR UPDATE OF slug ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.restaurants_slug_guard();

CREATE OR REPLACE FUNCTION public.orders_force_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.status := 'new';
  NEW.order_number := public.next_order_number(NEW.restaurant_id);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.orders_force_defaults() FROM PUBLIC;

DROP TRIGGER IF EXISTS orders_force_defaults ON public.orders;
CREATE TRIGGER orders_force_defaults
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_force_defaults();
