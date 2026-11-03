CREATE TYPE "public"."deletion_step" AS ENUM('confirmed', 'typed', 'executed', 'cancelled');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"metadata" jsonb NOT NULL,
	"request_id" text NOT NULL,
	"ip_hash" text,
	CONSTRAINT "audit_log_action_format" CHECK ("audit_log"."action" ~ '^[a-z_]+(\.[a-z_]+)+$' AND char_length("audit_log"."action") <= 64),
	CONSTRAINT "audit_log_target_type_len" CHECK (char_length("audit_log"."target_type") <= 64),
	CONSTRAINT "audit_log_target_id_len" CHECK (char_length("audit_log"."target_id") <= 128),
	CONSTRAINT "audit_log_request_id_len" CHECK (char_length("audit_log"."request_id") BETWEEN 1 AND 128),
	CONSTRAINT "audit_log_ip_hash_len" CHECK (char_length("audit_log"."ip_hash") <= 128)
);
--> statement-breakpoint
CREATE TABLE "deletion_requests" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"restaurant_name_snapshot" text NOT NULL,
	"step" "deletion_step" NOT NULL,
	"requested_by" uuid NOT NULL,
	"reauthenticated_at" timestamp with time zone,
	"executed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deletion_requests_name_snapshot_len" CHECK (char_length("deletion_requests"."restaurant_name_snapshot") BETWEEN 1 AND 80)
);
--> statement-breakpoint
CREATE INDEX "audit_log_at_idx" ON "audit_log" USING btree ("at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_log_target_idx" ON "audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "deletion_requests_one_pending_idx" ON "deletion_requests" USING btree ("restaurant_id") WHERE "deletion_requests"."step" IN ('confirmed', 'typed');