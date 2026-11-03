import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Base d'administration (branche `admin`, base `restio_admin`). Référence : DATABASE.md §4.

export const deletionStep = pgEnum('deletion_step', ['confirmed', 'typed', 'executed', 'cancelled']);

export const auditLog = pgTable(
  'audit_log',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
    adminUserId: uuid('admin_user_id').notNull(),
    action: text('action').notNull(),
    targetType: text('target_type'),
    targetId: text('target_id'),
    metadata: jsonb('metadata').notNull(),
    requestId: text('request_id').notNull(),
    ipHash: text('ip_hash'),
  },
  (t) => [
    index('audit_log_at_idx').on(t.at.desc()),
    index('audit_log_target_idx').on(t.targetType, t.targetId),
    check('audit_log_action_format', sql`${t.action} ~ '^[a-z_]+(\\.[a-z_]+)+$' AND char_length(${t.action}) <= 64`),
    check('audit_log_target_type_len', sql`char_length(${t.targetType}) <= 64`),
    check('audit_log_target_id_len', sql`char_length(${t.targetId}) <= 128`),
    check('audit_log_request_id_len', sql`char_length(${t.requestId}) BETWEEN 1 AND 128`),
    check('audit_log_ip_hash_len', sql`char_length(${t.ipHash}) <= 128`),
  ],
);

export const deletionRequests = pgTable(
  'deletion_requests',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    // Pas de clé étrangère : le restaurant vit dans une autre base (branche `production`).
    restaurantId: uuid('restaurant_id').notNull(),
    restaurantNameSnapshot: text('restaurant_name_snapshot').notNull(),
    step: deletionStep('step').notNull(),
    requestedBy: uuid('requested_by').notNull(),
    reauthenticatedAt: timestamp('reauthenticated_at', { withTimezone: true }),
    executedAt: timestamp('executed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Une seule demande en cours par restaurant : empêche les doubles exécutions.
    uniqueIndex('deletion_requests_one_pending_idx')
      .on(t.restaurantId)
      .where(sql`${t.step} IN ('confirmed', 'typed')`),
    check('deletion_requests_name_snapshot_len', sql`char_length(${t.restaurantNameSnapshot}) BETWEEN 1 AND 80`),
  ],
);
