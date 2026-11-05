import 'server-only';
import { asc, eq } from 'drizzle-orm';
import { formatMoney } from '@restio/core';
import { appSchema } from '@restio/db';
import { readDb } from '@/lib/db';
import { mediaUrls } from '@/lib/storage';

const { categories, dishes, restaurants } = appSchema;

export type MenuCategory = { id: string; name: string; dishCount: number };
export type MenuDish = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceLabel: string;
  priceInput: string;
  isAvailable: boolean;
  image: { full: string; thumb: string } | null;
};
export type MenuData = { categories: MenuCategory[]; dishes: MenuDish[]; currency: string; currencySymbol: string; slug: string };

/** Menu complet du restaurant de la session : prix déjà formatés pour ne pas envoyer de logique monétaire au navigateur. */
export async function getMenu(restaurantId: string, locale: string): Promise<MenuData> {
  const d = readDb();
  const [[restaurant], cats, rows] = await d.batch([
    d.select({ currency: restaurants.currency, slug: restaurants.slug }).from(restaurants).where(eq(restaurants.id, restaurantId)),
    d.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.restaurantId, restaurantId)).orderBy(asc(categories.position), asc(categories.createdAt)),
    d.select().from(dishes).where(eq(dishes.restaurantId, restaurantId)).orderBy(asc(dishes.position), asc(dishes.createdAt)),
  ]);
  if (!restaurant) throw new Error('restaurant not found');
  const { currency, slug } = restaurant;
  const plain = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const symbol = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? currency;
  return {
    currency,
    currencySymbol: symbol,
    slug,
    categories: cats.map((c) => ({ ...c, dishCount: rows.filter((r) => r.categoryId === c.id).length })),
    dishes: rows.map((r) => ({
      id: r.id,
      categoryId: r.categoryId,
      name: r.name,
      description: r.description ?? '',
      priceLabel: formatMoney(r.price, currency, locale),
      priceInput: plain.format(Number(r.price)),
      isAvailable: r.isAvailable,
      image: r.imageKey ? mediaUrls(r.imageKey) : null,
    })),
  };
}
