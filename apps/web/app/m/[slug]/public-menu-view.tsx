'use client';
/* eslint-disable @next/next/no-img-element -- images déjà optimisées (WebP) servies depuis le stockage */

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CircleSlash, Search, UtensilsCrossed } from 'lucide-react';
import { formatMoney, fromCents, toCents } from '@restio/core/money';
import { buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import type { PublicDish, PublicMenu } from '@/lib/public/queries';
import { EmptyState } from '@/app/app/(app)/_components/empty-state';
import { useCart } from './cart';
import { DishDialog } from './dish-dialog';
import { QtyControl } from './qty-control';

const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const ALL = 'all';

export function PublicMenuView({ menu, table }: { menu: PublicMenu; table?: string }) {
  const t = useTranslations('pub');
  const locale = useLocale();
  const { restaurant, categories, dishes } = menu;
  const { cart, setQuantity, setTable } = useCart(restaurant.slug);
  const [selected, setSelected] = useState(ALL);
  const [query, setQuery] = useState('');
  const [openDish, setOpenDish] = useState<PublicDish | null>(null);

  useEffect(() => {
    if (table) setTable(table);
  }, [table, setTable]);

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return dishes.filter((d) => (selected === ALL || d.categoryId === selected) && (!needle || normalize(d.name).includes(needle)));
  }, [dishes, selected, query]);

  const lines = dishes.filter((d) => d.isAvailable && (cart.items[d.id] ?? 0) > 0);
  const count = lines.reduce((sum, d) => sum + (cart.items[d.id] ?? 0), 0);
  const total = fromCents(lines.reduce((sum, d) => sum + toCents(d.price) * BigInt(cart.items[d.id] ?? 0), 0n));

  const tab = 'inline-flex h-10 shrink-0 cursor-pointer items-center rounded-full border border-line-strong bg-surface px-3.5 text-sm font-bold aria-selected:border-ink aria-selected:bg-ink aria-selected:text-surface';

  return (
    <div className="mx-auto max-w-[720px] pb-28 md:pb-[140px] md:pt-6">
      <div className="px-3 pt-2 md:p-0">
        {restaurant.bannerUrl ? (
          <img src={restaurant.bannerUrl} alt="" className="h-[184px] w-full rounded-lg object-cover md:h-[200px] md:rounded-xl" />
        ) : (
          <div aria-hidden="true" className="grid h-[184px] place-items-center rounded-lg bg-ink text-[3.5rem] font-black text-lime md:h-[200px] md:rounded-xl">
            {restaurant.name.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="px-4 pb-3.5 pt-4 md:px-0 md:pb-4 md:pt-6">
        <h1 className="text-[1.625rem] font-bold leading-[1.15] tracking-[-0.02em] md:text-[2.125rem]">{restaurant.name}</h1>
        {restaurant.meta && <p className="mt-0.5 text-[0.9375rem] text-text-2">{restaurant.meta}</p>}
        {restaurant.description && <p className="mt-2 text-[0.9375rem]">{restaurant.description}</p>}
      </div>
      <label className="relative mx-4 block md:mx-0">
        <span className="sr-only">{t('search')}</span>
        <Search aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-3" strokeWidth={1.75} />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('search')} className="h-12 w-full rounded-full border border-line-strong bg-surface pl-[46px] pr-4 text-base placeholder:text-text-3 focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none" />
      </label>
      <div role="tablist" aria-label={t('categories')} className="sticky top-0 z-10 flex gap-2 overflow-x-auto bg-ground px-4 py-3 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden">
        <button type="button" role="tab" aria-selected={selected === ALL} onClick={() => setSelected(ALL)} className={tab}>
          {t('all')}
        </button>
        {categories.map((category) => (
          <button key={category.id} type="button" role="tab" aria-selected={selected === category.id} onClick={() => setSelected(category.id)} className={tab}>
            {category.name}
          </button>
        ))}
      </div>

      <div className="border-y border-line bg-surface md:overflow-hidden md:rounded-lg md:border-x">
        {visible.length === 0 ? (
          query.trim() ? (
            <EmptyState icon={Search} title={t('noResultTitle')} compact>
              {t('noResult')}
            </EmptyState>
          ) : (
            <EmptyState icon={UtensilsCrossed} title={t('emptyTitle')} compact>
              {t('empty')}
            </EmptyState>
          )
        ) : (
          visible.map((dish, index) => {
            const quantity = cart.items[dish.id] ?? 0;
            const newCategory = visible[index - 1]?.categoryId !== dish.categoryId;
            return (
              <div key={dish.id}>
                {newCategory && <h2 className="px-4 pb-0.5 pt-[18px] text-lg font-bold tracking-[-0.01em] md:px-5">{dish.categoryName}</h2>}
                <article className={cn('grid gap-3 px-4 py-3.5 md:gap-4 md:px-5 md:py-4', dish.image && restaurant.showPhotos ? 'grid-cols-[88px_minmax(0,1fr)] md:grid-cols-[104px_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)]', !newCategory && 'border-t border-line')}>
                  {dish.image && restaurant.showPhotos && <button type="button" disabled={!dish.isAvailable} onClick={() => setOpenDish(dish)} className="size-[88px] cursor-pointer overflow-hidden rounded-md disabled:cursor-default md:size-[104px]" aria-label={dish.name}>
                    {dish.image && restaurant.showPhotos ? (
                      <img src={dish.image.thumb} alt="" width={104} height={104} loading="lazy" className={cn('size-full object-cover', !dish.isAvailable && 'opacity-60 grayscale')} />
                    ) : (
                      <span aria-hidden="true" className="grid size-full place-items-center bg-sunken text-text-3">
                        <UtensilsCrossed className="size-7" strokeWidth={1.75} />
                      </span>
                    )}
                  </button>}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <button type="button" disabled={!dish.isAvailable} onClick={() => setOpenDish(dish)} className="cursor-pointer text-left disabled:cursor-default">
                      <b className={cn('text-base leading-[1.3]', !dish.isAvailable && 'text-text-2')}>{dish.name}</b>
                    </button>
                    {dish.description && restaurant.showDescriptions && <p className="line-clamp-2 text-sm text-text-2">{dish.description}</p>}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
                      <span className={cn('whitespace-nowrap text-base font-bold tabular', !dish.isAvailable && 'text-text-2')}>{dish.priceLabel}</span>
                      {dish.isAvailable && !restaurant.ordersEnabled ? null : dish.isAvailable ? (
                        <QtyControl quantity={quantity} addLabel={t('add', { name: dish.name })} removeLabel={t('remove', { name: dish.name })} onChange={(next) => setQuantity(dish.id, next)} />
                      ) : (
                        <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-status-muted-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-muted">
                          <CircleSlash aria-hidden="true" className="size-[15px]" strokeWidth={2} />
                          {t('soldOut')}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            );
          })
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 px-4 pb-7 pt-6 text-[0.8125rem] text-text-2 md:hidden">
        {t('poweredBy')}
        <Image src="/brand/restio-mark-ink.png" alt="" width={18} height={18} />
        <b className="text-ink">Restio</b>
      </p>

      {count > 0 && restaurant.ordersEnabled && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-line bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:inset-x-auto md:bottom-6 md:left-1/2 md:w-[720px] md:-translate-x-1/2 md:rounded-lg md:border md:py-3 md:pl-5 md:pr-3 md:shadow-[var(--shadow-floating)]">
          <div className="grid min-w-0">
            <span className="whitespace-nowrap text-[0.8125rem] text-text-2 tabular">{t('bar.total', { count })}</span>
            <b className="whitespace-nowrap text-xl font-bold tracking-[-0.01em] tabular">{formatMoney(total, restaurant.currency, locale)}</b>
          </div>
          <Link href={`/@${restaurant.slug}/commande`} className={buttonClass({ variant: 'primary', className: 'ml-auto' })}>
            {t('bar.order')}
          </Link>
        </div>
      )}

      {openDish && restaurant.ordersEnabled && <DishDialog dish={openDish} currency={restaurant.currency} initialQuantity={cart.items[openDish.id] ?? 0} initialNote={cart.notes[openDish.id] ?? ''} slug={restaurant.slug} onClose={() => setOpenDish(null)} />}
    </div>
  );
}
