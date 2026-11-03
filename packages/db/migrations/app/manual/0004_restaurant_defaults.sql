-- À la création d'un restaurant, la base impose les valeurs que l'application ne doit pas choisir,
-- et crée l'abonnement gratuit (restio_app n'a que SELECT sur subscriptions).
-- Rejouable : CREATE OR REPLACE, DROP TRIGGER IF EXISTS, ON CONFLICT DO NOTHING.

INSERT INTO public.plans (id, name, is_active, sort)
VALUES ('free', 'Gratuit', true, 0)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.restaurants_force_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.status := 'active';
  NEW.order_seq := 0;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restaurants_force_defaults ON public.restaurants;
CREATE TRIGGER restaurants_force_defaults
  BEFORE INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.restaurants_force_defaults();

CREATE OR REPLACE FUNCTION public.restaurants_create_free_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.subscriptions (restaurant_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (restaurant_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.restaurants_create_free_subscription() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.restaurants_force_defaults() FROM PUBLIC;

DROP TRIGGER IF EXISTS restaurants_create_free_subscription ON public.restaurants;
CREATE TRIGGER restaurants_create_free_subscription
  AFTER INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.restaurants_create_free_subscription();
