CREATE TABLE "rate_limit_buckets" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limit_buckets_key_len" CHECK (char_length("rate_limit_buckets"."key") BETWEEN 1 AND 200),
	CONSTRAINT "rate_limit_buckets_hits_non_negative" CHECK ("rate_limit_buckets"."hits" >= 0)
);
--> statement-breakpoint
CREATE INDEX "rate_limit_buckets_window_start_idx" ON "rate_limit_buckets" USING btree ("window_start");