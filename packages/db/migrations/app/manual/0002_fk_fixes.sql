-- Drizzle ne sait pas exprimer ON DELETE SET NULL (colonne) (Postgres 15+).
-- Un SET NULL classique viderait aussi restaurant_id (NOT NULL) : la suppression d'un plat échouerait.
-- Ici, seul dish_id devient NULL : l'historique des commandes est conservé.
-- Rejouable : la contrainte est supprimée puis recréée dans la même transaction.

BEGIN;

ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_dish_fk;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_dish_fk
  FOREIGN KEY (dish_id, restaurant_id)
  REFERENCES public.dishes (id, restaurant_id)
  ON DELETE SET NULL (dish_id);

COMMIT;
