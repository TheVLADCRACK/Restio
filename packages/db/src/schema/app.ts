import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  char,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

// Base métier (branche `production`, base `neondb`). Référence : DATABASE.md §3.

export const restaurantStatus = pgEnum('restaurant_status', ['active', 'suspended']);
export const memberRole = pgEnum('member_role', ['owner']);
export const orderStatus = pgEnum('order_status', [
  'new',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'rejected',
  'cancelled',
]);
export const notificationType = pgEnum('notification_type', ['order_new', 'order_status', 'system']);
export const announcementKind = pgEnum('announcement_kind', [
  'feature',
  'tutorial',
  'maintenance',
  'promotion',
  'info',
]);
export const announcementDisplay = pgEnum('announcement_display', ['banner', 'modal', 'inbox']);
export const subscriptionStatus = pgEnum('subscription_status', [
  'active',
  'trialing',
  'past_due',
  'canceled',
]);

const id = () => uuid('id').primaryKey().default(sql`uuidv7()`);
const tstz = (name: string) => timestamp(name, { withTimezone: true });
const createdAt = () => tstz('created_at').notNull().defaultNow();
const updatedAt = () => tstz('updated_at').notNull().defaultNow();
const money = (name: string) => numeric(name, { precision: 12, scale: 2, mode: 'string' });

// sql.raw : bornes constantes du code, jamais une entrée utilisateur (drizzle-kit n'accepte pas de paramètres dans un CHECK).
const lengthBetween = (column: AnyPgColumn, min: number, max: number) =>
  sql`char_length(${column}) BETWEEN ${sql.raw(String(min))} AND ${sql.raw(String(max))}`;
const lengthAtMost = (column: AnyPgColumn, max: number) =>
  sql`char_length(${column}) <= ${sql.raw(String(max))}`;
const E164 = sql.raw(`'^\\+[1-9][0-9]{6,14}$'`);

/* 3.1 Comptes et restaurants */

export const profiles = pgTable(
  'profiles',
  {
    userId: uuid('user_id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phoneE164: text('phone_e164').notNull(),
    whatsappE164: text('whatsapp_e164').notNull(),
    tourCompletedAt: tstz('tour_completed_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('profiles_first_name_len', lengthBetween(t.firstName, 1, 80)),
    check('profiles_last_name_len', lengthBetween(t.lastName, 1, 80)),
    check('profiles_phone_e164_format', sql`${t.phoneE164} ~ ${E164}`),
    check('profiles_whatsapp_e164_format', sql`${t.whatsappE164} ~ ${E164}`),
  ],
);

export const restaurants = pgTable(
  'restaurants',
  {
    id: id(),
    slug: text('slug').notNull().unique('restaurants_slug_key'),
    name: text('name').notNull(),
    countryCode: char('country_code', { length: 2 }).notNull(),
    city: text('city').notNull(),
    address: text('address'),
    openedOn: date('opened_on', { mode: 'string' }),
    currency: char('currency', { length: 3 }).notNull(),
    timezone: text('timezone').notNull(),
    description: text('description'),
    logoKey: text('logo_key'),
    bannerKey: text('banner_key'),
    publicPhone: text('public_phone'),
    publicWhatsapp: text('public_whatsapp'),
    appearance: jsonb('appearance').notNull().default({}),
    isPublished: boolean('is_published').notNull().default(false),
    isIndexable: boolean('is_indexable').notNull().default(true),
    status: restaurantStatus('status').notNull().default('active'),
    onboarding: jsonb('onboarding').notNull().default({}),
    orderSeq: integer('order_seq').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('restaurants_slug_format', sql`${t.slug} ~ '^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$'`),
    check('restaurants_name_len', lengthBetween(t.name, 2, 80)),
    check('restaurants_country_code_format', sql`${t.countryCode} ~ '^[A-Z]{2}$'`),
    check('restaurants_city_len', lengthBetween(t.city, 1, 80)),
    check('restaurants_address_len', lengthAtMost(t.address, 200)),
    check('restaurants_currency_format', sql`${t.currency} ~ '^[A-Z]{3}$'`),
    check('restaurants_timezone_len', lengthBetween(t.timezone, 1, 64)),
    check('restaurants_description_len', lengthAtMost(t.description, 500)),
    check('restaurants_public_phone_format', sql`${t.publicPhone} ~ ${E164}`),
    check('restaurants_public_whatsapp_format', sql`${t.publicWhatsapp} ~ ${E164}`),
    check('restaurants_order_seq_positive', sql`${t.orderSeq} >= 0`),
  ],
);

export const restaurantMembers = pgTable(
  'restaurant_members',
  {
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    role: memberRole('role').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ name: 'restaurant_members_pkey', columns: [t.restaurantId, t.userId] }),
    // V1 : un compte = un restaurant. À retirer le jour du multi-restaurant.
    unique('restaurant_members_user_id_key').on(t.userId),
  ],
);

export const slugHistory = pgTable(
  'slug_history',
  {
    slug: text('slug').primaryKey(),
    restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'set null' }),
    retiredAt: tstz('retired_at').notNull().defaultNow(),
  },
  (t) => [index('slug_history_restaurant_id_idx').on(t.restaurantId)],
);

/* 3.2 Menu */

export const categories = pgTable(
  'categories',
  {
    id: id(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    position: integer('position').notNull(),
    isVisible: boolean('is_visible').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('categories_id_restaurant_id_key').on(t.id, t.restaurantId),
    index('categories_restaurant_position_idx').on(t.restaurantId, t.position),
    check('categories_name_len', lengthBetween(t.name, 1, 60)),
  ],
);

export const dishes = pgTable(
  'dishes',
  {
    id: id(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    price: money('price').notNull(),
    imageKey: text('image_key'),
    isAvailable: boolean('is_available').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    position: integer('position').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('dishes_id_restaurant_id_key').on(t.id, t.restaurantId),
    index('dishes_restaurant_category_position_idx').on(t.restaurantId, t.categoryId, t.position),
    // NO ACTION (contrôle en fin d'instruction) laisse passer la cascade d'un restaurant entier.
    foreignKey({
      name: 'dishes_category_fk',
      columns: [t.categoryId, t.restaurantId],
      foreignColumns: [categories.id, categories.restaurantId],
    }).onDelete('no action'),
    check('dishes_name_len', lengthBetween(t.name, 1, 80)),
    check('dishes_description_len', lengthAtMost(t.description, 300)),
    check('dishes_price_non_negative', sql`${t.price} >= 0`),
  ],
);

/* 3.3 Commandes */

export const orders = pgTable(
  'orders',
  {
    id: id(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    // Valeur imposée par le trigger orders_force_defaults (migration manual/0005_guards.sql).
    orderNumber: integer('order_number').notNull().default(0),
    tableLabel: text('table_label').notNull(),
    customerNote: text('customer_note'),
    customerName: text('customer_name'),
    status: orderStatus('status').notNull().default('new'),
    currency: char('currency', { length: 3 }).notNull(),
    totalAmount: money('total_amount').notNull(),
    idempotencyKey: uuid('idempotency_key').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('orders_id_restaurant_id_key').on(t.id, t.restaurantId),
    unique('orders_restaurant_order_number_key').on(t.restaurantId, t.orderNumber),
    unique('orders_restaurant_idempotency_key').on(t.restaurantId, t.idempotencyKey),
    index('orders_restaurant_created_at_idx').on(t.restaurantId, t.createdAt.desc()),
    index('orders_restaurant_active_status_idx')
      .on(t.restaurantId, t.status)
      .where(sql`${t.status} IN ('new', 'accepted', 'preparing', 'ready')`),
    check('orders_order_number_positive', sql`${t.orderNumber} > 0`),
    check('orders_table_label_len', lengthBetween(t.tableLabel, 1, 20)),
    check('orders_customer_note_len', lengthAtMost(t.customerNote, 500)),
    check('orders_customer_name_len', lengthAtMost(t.customerName, 40)),
    check('orders_currency_format', sql`${t.currency} ~ '^[A-Z]{3}$'`),
    check('orders_total_amount_non_negative', sql`${t.totalAmount} >= 0`),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: id(),
    orderId: uuid('order_id').notNull(),
    restaurantId: uuid('restaurant_id').notNull(),
    dishId: uuid('dish_id'),
    dishName: text('dish_name').notNull(),
    categoryName: text('category_name').notNull(),
    unitPrice: money('unit_price').notNull(),
    quantity: integer('quantity').notNull(),
    lineTotal: money('line_total').notNull(),
  },
  (t) => [
    index('order_items_restaurant_dish_idx').on(t.restaurantId, t.dishId),
    index('order_items_order_id_idx').on(t.orderId),
    foreignKey({
      name: 'order_items_order_fk',
      columns: [t.orderId, t.restaurantId],
      foreignColumns: [orders.id, orders.restaurantId],
    }).onDelete('cascade'),
    // Remplacée par migrations/app/manual/0002_fk_fixes.sql : ON DELETE SET NULL (dish_id), non exprimable en Drizzle.
    foreignKey({
      name: 'order_items_dish_fk',
      columns: [t.dishId, t.restaurantId],
      foreignColumns: [dishes.id, dishes.restaurantId],
    }).onDelete('set null'),
    check('order_items_unit_price_non_negative', sql`${t.unitPrice} >= 0`),
    check('order_items_quantity_range', sql`${t.quantity} BETWEEN 1 AND 99`),
    check('order_items_line_total', sql`${t.lineTotal} = ${t.unitPrice} * ${t.quantity}`),
  ],
);

export const orderStatusEvents = pgTable(
  'order_status_events',
  {
    id: id(),
    orderId: uuid('order_id').notNull(),
    restaurantId: uuid('restaurant_id').notNull(),
    fromStatus: orderStatus('from_status'),
    toStatus: orderStatus('to_status').notNull(),
    actorUserId: uuid('actor_user_id'),
    createdAt: createdAt(),
  },
  (t) => [
    index('order_status_events_order_created_idx').on(t.orderId, t.createdAt),
    foreignKey({
      name: 'order_status_events_order_fk',
      columns: [t.orderId, t.restaurantId],
      foreignColumns: [orders.id, orders.restaurantId],
    }).onDelete('cascade'),
  ],
);

/* 3.4 Notifications et présence */

export const notifications = pgTable(
  'notifications',
  {
    id: id(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    type: notificationType('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    orderId: uuid('order_id'),
    readAt: tstz('read_at'),
    createdAt: createdAt(),
  },
  (t) => [
    index('notifications_restaurant_unread_idx')
      .on(t.restaurantId, t.createdAt.desc())
      .where(sql`${t.readAt} IS NULL`),
    index('notifications_order_id_idx').on(t.orderId),
    foreignKey({
      name: 'notifications_order_fk',
      columns: [t.orderId, t.restaurantId],
      foreignColumns: [orders.id, orders.restaurantId],
    }).onDelete('cascade'),
    check('notifications_title_len', lengthAtMost(t.title, 120)),
    check('notifications_body_len', lengthAtMost(t.body, 500)),
  ],
);

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: id(),
    userId: uuid('user_id').notNull(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    // Liste blanche des hôtes de push vérifiée côté serveur ; la base impose seulement https.
    endpoint: text('endpoint').notNull().unique('push_subscriptions_endpoint_key'),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    failureCount: integer('failure_count').notNull().default(0),
    createdAt: createdAt(),
    lastSuccessAt: tstz('last_success_at'),
  },
  (t) => [
    index('push_subscriptions_restaurant_id_idx').on(t.restaurantId),
    index('push_subscriptions_user_id_idx').on(t.userId),
    check('push_subscriptions_endpoint_https', sql`${t.endpoint} ~ '^https://'`),
    check('push_subscriptions_endpoint_len', lengthAtMost(t.endpoint, 2048)),
    check('push_subscriptions_failure_count_non_negative', sql`${t.failureCount} >= 0`),
  ],
);

export const menuViewsDaily = pgTable(
  'menu_views_daily',
  {
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    day: date('day', { mode: 'string' }).notNull(),
    views: integer('views').notNull().default(0),
  },
  (t) => [
    primaryKey({ name: 'menu_views_daily_pkey', columns: [t.restaurantId, t.day] }),
    check('menu_views_daily_views_non_negative', sql`${t.views} >= 0`),
  ],
);

/* 3.5 Contenus publiés par l'administration */

export const platformSettings = pgTable(
  'platform_settings',
  {
    key: text('key').primaryKey(),
    value: jsonb('value').notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [check('platform_settings_key_format', sql`${t.key} ~ '^[a-z][a-z0-9_]{0,63}$'`)],
);

export const announcements = pgTable(
  'announcements',
  {
    id: id(),
    kind: announcementKind('kind').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    linkUrl: text('link_url'),
    youtubeVideoId: text('youtube_video_id'),
    audience: jsonb('audience').notNull(),
    display: announcementDisplay('display').notNull(),
    startsAt: tstz('starts_at').notNull(),
    endsAt: tstz('ends_at').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('announcements_active_window_idx').on(t.isActive, t.startsAt, t.endsAt),
    check('announcements_title_len', lengthAtMost(t.title, 120)),
    check('announcements_body_len', lengthAtMost(t.body, 2000)),
    check('announcements_link_url_https', sql`${t.linkUrl} ~ '^https://'`),
    check('announcements_link_url_len', lengthAtMost(t.linkUrl, 2048)),
    check('announcements_youtube_video_id_format', sql`${t.youtubeVideoId} ~ '^[A-Za-z0-9_-]{11}$'`),
    check('announcements_window', sql`${t.endsAt} > ${t.startsAt}`),
  ],
);

export const announcementDismissals = pgTable(
  'announcement_dismissals',
  {
    announcementId: uuid('announcement_id')
      .notNull()
      .references(() => announcements.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    dismissedAt: tstz('dismissed_at').notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ name: 'announcement_dismissals_pkey', columns: [t.announcementId, t.userId] }),
    index('announcement_dismissals_user_id_idx').on(t.userId),
  ],
);

/* 3.6 Abonnements (préparés, non activés) */

export const plans = pgTable(
  'plans',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    sort: integer('sort').notNull().default(0),
  },
  (t) => [
    check('plans_id_format', sql`${t.id} ~ '^[a-z][a-z0-9_]{0,31}$'`),
    check('plans_name_len', lengthBetween(t.name, 1, 60)),
  ],
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    restaurantId: uuid('restaurant_id')
      .primaryKey()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    planId: text('plan_id')
      .notNull()
      .references(() => plans.id),
    status: subscriptionStatus('status').notNull(),
    currentPeriodStart: tstz('current_period_start'),
    currentPeriodEnd: tstz('current_period_end'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('subscriptions_plan_id_idx').on(t.planId)],
);

/* 3.7 Protection contre les abus */

export const rateLimitBuckets = pgTable(
  'rate_limit_buckets',
  {
    key: text('key').primaryKey(),
    windowStart: tstz('window_start').notNull(),
    hits: integer('hits').notNull().default(0),
  },
  (t) => [
    index('rate_limit_buckets_window_start_idx').on(t.windowStart),
    check('rate_limit_buckets_key_len', lengthBetween(t.key, 1, 200)),
    check('rate_limit_buckets_hits_non_negative', sql`${t.hits} >= 0`),
  ],
);

/* Relations (jointures Drizzle uniquement, sans effet sur le schéma SQL) */

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  members: many(restaurantMembers),
  slugHistory: many(slugHistory),
  categories: many(categories),
  dishes: many(dishes),
  orders: many(orders),
  notifications: many(notifications),
  pushSubscriptions: many(pushSubscriptions),
  menuViewsDaily: many(menuViewsDaily),
  subscription: one(subscriptions, {
    fields: [restaurants.id],
    references: [subscriptions.restaurantId],
  }),
}));

export const restaurantMembersRelations = relations(restaurantMembers, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantMembers.restaurantId],
    references: [restaurants.id],
  }),
}));

export const slugHistoryRelations = relations(slugHistory, ({ one }) => ({
  restaurant: one(restaurants, { fields: [slugHistory.restaurantId], references: [restaurants.id] }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [categories.restaurantId], references: [restaurants.id] }),
  dishes: many(dishes),
}));

export const dishesRelations = relations(dishes, ({ one }) => ({
  restaurant: one(restaurants, { fields: [dishes.restaurantId], references: [restaurants.id] }),
  category: one(categories, { fields: [dishes.categoryId], references: [categories.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [orders.restaurantId], references: [restaurants.id] }),
  items: many(orderItems),
  statusEvents: many(orderStatusEvents),
  notifications: many(notifications),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  dish: one(dishes, { fields: [orderItems.dishId], references: [dishes.id] }),
}));

export const orderStatusEventsRelations = relations(orderStatusEvents, ({ one }) => ({
  order: one(orders, { fields: [orderStatusEvents.orderId], references: [orders.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [notifications.restaurantId],
    references: [restaurants.id],
  }),
  order: one(orders, { fields: [notifications.orderId], references: [orders.id] }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [pushSubscriptions.restaurantId],
    references: [restaurants.id],
  }),
}));

export const menuViewsDailyRelations = relations(menuViewsDaily, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [menuViewsDaily.restaurantId],
    references: [restaurants.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ many }) => ({
  dismissals: many(announcementDismissals),
}));

export const announcementDismissalsRelations = relations(announcementDismissals, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementDismissals.announcementId],
    references: [announcements.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [subscriptions.restaurantId],
    references: [restaurants.id],
  }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));
