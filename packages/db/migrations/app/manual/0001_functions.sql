-- Numéro de commande lisible, par restaurant. Seul moyen d'écrire restaurants.order_seq (restio_app n'a pas UPDATE sur cette colonne).
-- À appeler dans la transaction de création de commande : le verrou de ligne pris par l'UPDATE sérialise les créations simultanées.
-- Rejouable : CREATE OR REPLACE puis REVOKE.

CREATE OR REPLACE FUNCTION public.next_order_number(p_restaurant_id uuid)
RETURNS integer
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_next integer;
BEGIN
  UPDATE public.restaurants
     SET order_seq = order_seq + 1
   WHERE id = p_restaurant_id
  RETURNING order_seq INTO v_next;

  IF v_next IS NULL THEN
    RAISE EXCEPTION 'restaurant introuvable' USING ERRCODE = 'no_data_found';
  END IF;

  RETURN v_next;
END;
$$;

REVOKE ALL ON FUNCTION public.next_order_number(uuid) FROM PUBLIC;
