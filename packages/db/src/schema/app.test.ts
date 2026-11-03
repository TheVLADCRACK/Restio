import { describe, expect, it } from 'vitest';
import { is } from 'drizzle-orm';
import { PgTable, getTableConfig } from 'drizzle-orm/pg-core';
import * as app from './app';

const tables: PgTable[] = Object.values(app as Record<string, unknown>).filter(
  (value): value is PgTable => is(value, PgTable),
);
const configOf = (name: string) => {
  const table = tables.find((t) => getTableConfig(t).name === name);
  if (!table) throw new Error(`Table absente du schéma : ${name}`);
  return getTableConfig(table);
};

// Tables sans restaurant_id, chacune pour une raison explicite.
const EXEMPT: Record<string, string> = {
  restaurants: 'racine de l’isolation (id)',
  profiles: 'donnée de l’utilisateur, pas du restaurant',
  announcement_dismissals: 'donnée de l’utilisateur, pas du restaurant',
  plans: 'catalogue de la plateforme',
  platform_settings: 'configuration de la plateforme',
  announcements: 'contenu de la plateforme',
  rate_limit_buckets: 'protection technique transverse',
};

const compositeFk = (table: string, columns: string[], target: string) =>
  configOf(table).foreignKeys.some((fk) => {
    const ref = fk.reference();
    return (
      getTableConfig(ref.foreignTable).name === target &&
      ref.columns.map((c) => c.name).join() === columns.join() &&
      ref.foreignColumns.map((c) => c.name).join() === 'id,restaurant_id'
    );
  });

describe('schéma métier', () => {
  it('chaque table métier porte restaurant_id ou est explicitement exemptée', () => {
    expect(tables.length).toBeGreaterThan(10);
    for (const table of tables) {
      const { name, columns } = getTableConfig(table);
      if (name in EXEMPT) continue;
      expect(columns.map((c) => c.name), name).toContain('restaurant_id');
    }
  });

  it('les clés étrangères composites (id, restaurant_id) existent', () => {
    expect(compositeFk('dishes', ['category_id', 'restaurant_id'], 'categories')).toBe(true);
    expect(compositeFk('order_items', ['order_id', 'restaurant_id'], 'orders')).toBe(true);
    expect(compositeFk('order_items', ['dish_id', 'restaurant_id'], 'dishes')).toBe(true);
    expect(compositeFk('order_status_events', ['order_id', 'restaurant_id'], 'orders')).toBe(true);
    expect(compositeFk('notifications', ['order_id', 'restaurant_id'], 'orders')).toBe(true);
  });

  it('les cibles des clés composites ont un UNIQUE (id, restaurant_id)', () => {
    for (const name of ['categories', 'dishes', 'orders']) {
      const uniques = configOf(name).uniqueConstraints.map((u) => u.columns.map((c) => c.name).join());
      expect(uniques, name).toContain('id,restaurant_id');
    }
  });

  it('orders a l’unique (restaurant_id, idempotency_key)', () => {
    const uniques = configOf('orders').uniqueConstraints.map((u) => u.columns.map((c) => c.name).join());
    expect(uniques).toContain('restaurant_id,idempotency_key');
  });
});
