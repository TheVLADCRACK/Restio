CREATE TYPE "public"."announcement_display" AS ENUM('banner', 'modal', 'inbox');--> statement-breakpoint
CREATE TYPE "public"."announcement_kind" AS ENUM('feature', 'tutorial', 'maintenance', 'promotion', 'info');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order_new', 'order_status', 'system');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('new', 'accepted', 'preparing', 'ready', 'completed', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."restaurant_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trialing', 'past_due', 'canceled');--> statement-breakpoint
CREATE TABLE "announcement_dismissals" (
	"announcement_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"dismissed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "announcement_dismissals_pkey" PRIMARY KEY("announcement_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"kind" "announcement_kind" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"link_url" text,
	"youtube_video_id" text,
	"audience" jsonb NOT NULL,
	"display" "announcement_display" NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "announcements_title_len" CHECK (char_length("announcements"."title") <= 120),
	CONSTRAINT "announcements_body_len" CHECK (char_length("announcements"."body") <= 2000),
	CONSTRAINT "announcements_link_url_https" CHECK ("announcements"."link_url" ~ '^https://'),
	CONSTRAINT "announcements_link_url_len" CHECK (char_length("announcements"."link_url") <= 2048),
	CONSTRAINT "announcements_youtube_video_id_format" CHECK ("announcements"."youtube_video_id" ~ '^[A-Za-z0-9_-]{11}$'),
	CONSTRAINT "announcements_window" CHECK ("announcements"."ends_at" > "announcements"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_id_restaurant_id_key" UNIQUE("id","restaurant_id"),
	CONSTRAINT "categories_name_len" CHECK (char_length("categories"."name") BETWEEN 1 AND 60)
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"image_key" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dishes_id_restaurant_id_key" UNIQUE("id","restaurant_id"),
	CONSTRAINT "dishes_name_len" CHECK (char_length("dishes"."name") BETWEEN 1 AND 80),
	CONSTRAINT "dishes_description_len" CHECK (char_length("dishes"."description") <= 300),
	CONSTRAINT "dishes_price_non_negative" CHECK ("dishes"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "menu_views_daily" (
	"restaurant_id" uuid NOT NULL,
	"day" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "menu_views_daily_pkey" PRIMARY KEY("restaurant_id","day"),
	CONSTRAINT "menu_views_daily_views_non_negative" CHECK ("menu_views_daily"."views" >= 0)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"order_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_title_len" CHECK (char_length("notifications"."title") <= 120),
	CONSTRAINT "notifications_body_len" CHECK (char_length("notifications"."body") <= 500)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"order_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"dish_id" uuid,
	"dish_name" text NOT NULL,
	"category_name" text NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	CONSTRAINT "order_items_unit_price_non_negative" CHECK ("order_items"."unit_price" >= 0),
	CONSTRAINT "order_items_quantity_range" CHECK ("order_items"."quantity" BETWEEN 1 AND 99),
	CONSTRAINT "order_items_line_total" CHECK ("order_items"."line_total" = "order_items"."unit_price" * "order_items"."quantity")
);
--> statement-breakpoint
CREATE TABLE "order_status_events" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"order_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status" NOT NULL,
	"actor_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"order_number" integer NOT NULL,
	"table_label" text NOT NULL,
	"customer_note" text,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"currency" char(3) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_id_restaurant_id_key" UNIQUE("id","restaurant_id"),
	CONSTRAINT "orders_restaurant_order_number_key" UNIQUE("restaurant_id","order_number"),
	CONSTRAINT "orders_restaurant_idempotency_key" UNIQUE("restaurant_id","idempotency_key"),
	CONSTRAINT "orders_order_number_positive" CHECK ("orders"."order_number" > 0),
	CONSTRAINT "orders_table_label_len" CHECK (char_length("orders"."table_label") BETWEEN 1 AND 20),
	CONSTRAINT "orders_customer_note_len" CHECK (char_length("orders"."customer_note") <= 500),
	CONSTRAINT "orders_currency_format" CHECK ("orders"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "orders_total_amount_non_negative" CHECK ("orders"."total_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "plans_id_format" CHECK ("plans"."id" ~ '^[a-z][a-z0-9_]{0,31}$'),
	CONSTRAINT "plans_name_len" CHECK (char_length("plans"."name") BETWEEN 1 AND 60)
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_settings_key_format" CHECK ("platform_settings"."key" ~ '^[a-z][a-z0-9_]{0,63}$')
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone_e164" text NOT NULL,
	"whatsapp_e164" text NOT NULL,
	"tour_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_first_name_len" CHECK (char_length("profiles"."first_name") BETWEEN 1 AND 80),
	CONSTRAINT "profiles_last_name_len" CHECK (char_length("profiles"."last_name") BETWEEN 1 AND 80),
	CONSTRAINT "profiles_phone_e164_format" CHECK ("profiles"."phone_e164" ~ '^\+[1-9][0-9]{6,14}$'),
	CONSTRAINT "profiles_whatsapp_e164_format" CHECK ("profiles"."whatsapp_e164" ~ '^\+[1-9][0-9]{6,14}$')
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_success_at" timestamp with time zone,
	CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE("endpoint"),
	CONSTRAINT "push_subscriptions_endpoint_https" CHECK ("push_subscriptions"."endpoint" ~ '^https://'),
	CONSTRAINT "push_subscriptions_endpoint_len" CHECK (char_length("push_subscriptions"."endpoint") <= 2048),
	CONSTRAINT "push_subscriptions_failure_count_non_negative" CHECK ("push_subscriptions"."failure_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limit_buckets_key_len" CHECK (char_length("rate_limit_buckets"."key") BETWEEN 1 AND 200),
	CONSTRAINT "rate_limit_buckets_hits_non_negative" CHECK ("rate_limit_buckets"."hits" >= 0)
);
--> statement-breakpoint
CREATE TABLE "restaurant_members" (
	"restaurant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurant_members_pkey" PRIMARY KEY("restaurant_id","user_id"),
	CONSTRAINT "restaurant_members_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"country_code" char(2) NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"opened_on" date,
	"currency" char(3) NOT NULL,
	"timezone" text NOT NULL,
	"description" text,
	"logo_key" text,
	"banner_key" text,
	"public_phone" text,
	"public_whatsapp" text,
	"appearance" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_indexable" boolean DEFAULT true NOT NULL,
	"status" "restaurant_status" DEFAULT 'active' NOT NULL,
	"onboarding" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"order_seq" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_slug_key" UNIQUE("slug"),
	CONSTRAINT "restaurants_slug_format" CHECK ("restaurants"."slug" ~ '^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$'),
	CONSTRAINT "restaurants_name_len" CHECK (char_length("restaurants"."name") BETWEEN 2 AND 80),
	CONSTRAINT "restaurants_country_code_format" CHECK ("restaurants"."country_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "restaurants_city_len" CHECK (char_length("restaurants"."city") BETWEEN 1 AND 80),
	CONSTRAINT "restaurants_address_len" CHECK (char_length("restaurants"."address") <= 200),
	CONSTRAINT "restaurants_currency_format" CHECK ("restaurants"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "restaurants_timezone_len" CHECK (char_length("restaurants"."timezone") BETWEEN 1 AND 64),
	CONSTRAINT "restaurants_description_len" CHECK (char_length("restaurants"."description") <= 500),
	CONSTRAINT "restaurants_public_phone_format" CHECK ("restaurants"."public_phone" ~ '^\+[1-9][0-9]{6,14}$'),
	CONSTRAINT "restaurants_public_whatsapp_format" CHECK ("restaurants"."public_whatsapp" ~ '^\+[1-9][0-9]{6,14}$'),
	CONSTRAINT "restaurants_order_seq_positive" CHECK ("restaurants"."order_seq" >= 0)
);
--> statement-breakpoint
CREATE TABLE "slug_history" (
	"slug" text PRIMARY KEY NOT NULL,
	"restaurant_id" uuid,
	"retired_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"restaurant_id" uuid PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"status" "subscription_status" NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcement_dismissals" ADD CONSTRAINT "announcement_dismissals_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_category_fk" FOREIGN KEY ("category_id","restaurant_id") REFERENCES "public"."categories"("id","restaurant_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_views_daily" ADD CONSTRAINT "menu_views_daily_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_fk" FOREIGN KEY ("order_id","restaurant_id") REFERENCES "public"."orders"("id","restaurant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_fk" FOREIGN KEY ("order_id","restaurant_id") REFERENCES "public"."orders"("id","restaurant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_dish_fk" FOREIGN KEY ("dish_id","restaurant_id") REFERENCES "public"."dishes"("id","restaurant_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_order_fk" FOREIGN KEY ("order_id","restaurant_id") REFERENCES "public"."orders"("id","restaurant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_members" ADD CONSTRAINT "restaurant_members_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slug_history" ADD CONSTRAINT "slug_history_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcement_dismissals_user_id_idx" ON "announcement_dismissals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "announcements_active_window_idx" ON "announcements" USING btree ("is_active","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "categories_restaurant_position_idx" ON "categories" USING btree ("restaurant_id","position");--> statement-breakpoint
CREATE INDEX "dishes_restaurant_category_position_idx" ON "dishes" USING btree ("restaurant_id","category_id","position");--> statement-breakpoint
CREATE INDEX "notifications_restaurant_unread_idx" ON "notifications" USING btree ("restaurant_id","created_at" DESC NULLS LAST) WHERE "notifications"."read_at" IS NULL;--> statement-breakpoint
CREATE INDEX "notifications_order_id_idx" ON "notifications" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_restaurant_dish_idx" ON "order_items" USING btree ("restaurant_id","dish_id");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_status_events_order_created_idx" ON "order_status_events" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_restaurant_created_at_idx" ON "orders" USING btree ("restaurant_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "orders_restaurant_active_status_idx" ON "orders" USING btree ("restaurant_id","status") WHERE "orders"."status" IN ('new', 'accepted', 'preparing', 'ready');--> statement-breakpoint
CREATE INDEX "push_subscriptions_restaurant_id_idx" ON "push_subscriptions" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rate_limit_buckets_window_start_idx" ON "rate_limit_buckets" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "slug_history_restaurant_id_idx" ON "slug_history" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions" USING btree ("plan_id");