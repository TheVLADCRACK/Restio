ALTER TABLE "orders" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_name_len" CHECK (char_length("orders"."customer_name") <= 40);