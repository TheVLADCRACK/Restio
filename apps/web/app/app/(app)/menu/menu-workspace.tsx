'use client';
/* eslint-disable @next/next/no-img-element -- vignettes déjà recadrées et servies depuis le stockage */

import { useCallback, useMemo, useOptimistic, useState, useTransition, type DragEvent, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Ellipsis, Eye, FolderPlus, GripVertical, ImagePlus, LayoutGrid, Pencil, Plus, Search, Settings2, UtensilsCrossed } from 'lucide-react';
import { Button, buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { Switch } from '@restio/ui/components/switch';
import { Toast } from '@/components/toast';
import { reorderCategoriesAction, setDishAvailabilityAction } from '@/lib/menu/actions';
import type { MenuCategory, MenuData, MenuDish } from '@/lib/menu/queries';
import { EmptyState } from '../_components/empty-state';
import { MobileHead } from '../_components/mobile-head';
import { PageHeader } from '../_components/page-header';
import { CategorySheet, ManageCategoriesSheet } from './category-sheet';
import { DishSheet } from './dish-sheet';

const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const ALL = 'all';

type DishSheetState = { dish: MenuDish | null } | null;
type CategorySheetState = { category: MenuCategory | null } | null;

export function MenuWorkspace({ menu, previewHref }: { menu: MenuData; previewHref: string }) {
  const t = useTranslations('menu');
  const [selected, setSelected] = useState<string>(menu.categories[0]?.id ?? ALL);
  const [query, setQuery] = useState('');
  const [dishSheet, setDishSheet] = useState<DishSheetState>(null);
  const [categorySheet, setCategorySheet] = useState<CategorySheetState>(null);
  const [managing, setManaging] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [, startTransition] = useTransition();

  const [dishes, setOptimisticAvailability] = useOptimistic(menu.dishes, (state, change: { id: string; isAvailable: boolean }) => state.map((d) => (d.id === change.id ? { ...d, isAvailable: change.isAvailable } : d)));
  const [categories, setOptimisticOrder] = useOptimistic(menu.categories, (_state, next: MenuCategory[]) => next);
  const fail = (message: string) => setToast((previous) => ({ id: (previous?.id ?? 0) + 1, message }));

  // Catégorie supprimée entre-temps : retour à la première.
  const current = selected === ALL ? null : (categories.find((c) => c.id === selected) ?? null);
  const scope = selected === ALL || current ? selected : (categories[0]?.id ?? ALL);

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return dishes.filter((d) => (scope === ALL || d.categoryId === scope) && (!needle || normalize(d.name).includes(needle)));
  }, [dishes, scope, query]);
  const inScope = dishes.filter((d) => scope === ALL || d.categoryId === scope);
  const soldOut = (list: MenuDish[]) => list.filter((d) => !d.isAvailable).length;

  function toggle(dish: MenuDish, isAvailable: boolean) {
    startTransition(async () => {
      setOptimisticAvailability({ id: dish.id, isAvailable });
      const result = await setDishAvailabilityAction(dish.id, isAvailable);
      if (result.error) fail(result.error);
    });
  }

  function reorder(next: MenuCategory[]) {
    startTransition(async () => {
      setOptimisticOrder(next);
      const result = await reorderCategoriesAction(next.map((c) => c.id));
      if (result.error) fail(result.error);
    });
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    reorder(next);
  }

  function drop(event: DragEvent, targetId: string) {
    event.preventDefault();
    if (!dragged || dragged === targetId) return;
    const from = categories.findIndex((c) => c.id === dragged);
    const to = categories.findIndex((c) => c.id === targetId);
    const next = [...categories];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    setDragged(null);
    reorder(next);
  }

  // Clavier : Alt + flèches pour déplacer la catégorie sélectionnée.
  function onCategoryKey(event: KeyboardEvent, index: number) {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    event.preventDefault();
    move(index, event.key === 'ArrowUp' ? -1 : 1);
  }

  const openNewDish = () => (categories.length === 0 ? setCategorySheet({ category: null }) : setDishSheet({ dish: null }));
  const closeDish = useCallback(() => setDishSheet(null), []);
  const closeCategory = useCallback(() => setCategorySheet(null), []);

  const emptyList =
    query.trim() !== '' ? (
      <EmptyState icon={Search} title={t('noResultTitle')} level={3} compact>
        {t('noResult')}
      </EmptyState>
    ) : (
      <EmptyState
        icon={UtensilsCrossed}
        title={t('emptyCategoryTitle')}
        level={3}
        compact
        action={
          <Button size="sm" variant="dark" onClick={openNewDish}>
            <Plus aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            {t('addDish')}
          </Button>
        }
      >
        {t('emptyCategory')}
      </EmptyState>
    );

  const sheets = (
    <>
      {toast && (
        <Toast key={toast.id} tone="error">
          {toast.message}
        </Toast>
      )}
      {dishSheet && <DishSheet key={dishSheet.dish?.id ?? 'new'} dish={dishSheet.dish} categories={categories} defaultCategoryId={scope === ALL ? undefined : scope} currencySymbol={menu.currencySymbol} onClose={closeDish} />}
      {categorySheet && <CategorySheet key={categorySheet.category?.id ?? 'new'} category={categorySheet.category} onClose={closeCategory} />}
      {managing && !categorySheet && <ManageCategoriesSheet categories={categories} onMove={move} onEdit={(category) => setCategorySheet({ category })} onAdd={() => setCategorySheet({ category: null })} onClose={() => setManaging(false)} />}
    </>
  );

  const header = (
    <>
      <MobileHead
        title={t('title')}
        end={
          <a href={previewHref} target="_blank" rel="noopener noreferrer" aria-label={t('previewLabel')} className="grid size-12 place-items-center rounded-full hover:bg-sunken">
            <Eye aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </a>
        }
      />
      <div className="hidden md:block">
        <PageHeader
          title={t('title')}
          subtitle={<span className="tabular">{t('summary', { dishes: dishes.length, categories: categories.length, soldOut: soldOut(dishes) })}</span>}
          actions={
            <>
              <a href={previewHref} target="_blank" rel="noopener noreferrer" className={buttonClass()}>
                <Eye aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {t('preview')}
              </a>
              <Button variant="primary" onClick={openNewDish}>
                <Plus aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {t('addDish')}
              </Button>
            </>
          }
        />
      </div>
    </>
  );

  const title = current?.name ?? t('allDishes');
  const summary = t('sectionSummary', { dishes: inScope.length, soldOut: soldOut(inScope) });
  const search = (id: string, className: string) => (
    <label htmlFor={id} className={cn('relative block', className)}>
      <span className="sr-only">{t('search')}</span>
      <Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-text-3" strokeWidth={1.75} />
      <input id={id} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('search')} className="h-11 w-full rounded-full border border-line-strong bg-surface pl-[42px] pr-4 text-base placeholder:text-text-3 focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none" />
    </label>
  );
  const tab = 'inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 text-sm font-bold aria-selected:border-ink aria-selected:bg-ink aria-selected:text-surface group';
  const tabCount = 'grid h-[22px] min-w-[22px] place-items-center rounded-full bg-sunken px-1.5 text-xs not-italic tabular group-aria-selected:bg-lime group-aria-selected:text-ink';
  const catButton = 'flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-[12px] pl-2 pr-3 text-left text-[0.9375rem] font-medium hover:bg-sunken aria-[current=true]:bg-lime-soft aria-[current=true]:font-bold';

  // Une seule structure de rendu : les fiches ouvertes survivent au passage de l'état vide à la liste.
  const empty = (
    <div className="mt-2 rounded-lg border border-line bg-surface md:mt-6">
      <EmptyState
        icon={FolderPlus}
        title={t('emptyTitle')}
        action={
          <Button variant="primary" onClick={() => setCategorySheet({ category: null })}>
            <Plus aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t('newCategory')}
          </Button>
        }
      >
        {t('empty')}
      </EmptyState>
    </div>
  );

  const workspace = (
    <>
      {/* Bureau, à partir de 1280 px : catégories à gauche, tableau des plats à droite. */}
      <div className="mt-6 hidden grid-cols-[280px_minmax(0,1fr)] items-start gap-6 xl:grid">
        <nav aria-label={t('categories')} className="grid gap-0.5 rounded-lg border border-line bg-surface p-3">
          <div className="flex items-center px-2 pb-2.5 pt-1.5">
            <h2 className="text-lg font-bold leading-[1.3]">{t('categories')}</h2>
            <Button size="sm" variant="ghost" aria-label={t('addCategory')} className="ml-auto w-10 px-0" onClick={() => setCategorySheet({ category: null })}>
              <Plus aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            </Button>
          </div>
          <button type="button" aria-current={scope === ALL} onClick={() => setSelected(ALL)} className={catButton}>
            <LayoutGrid aria-hidden="true" className="size-[18px] text-text-3" strokeWidth={1.75} />
            {t('allDishes')}
            <span className="ml-auto text-sm font-medium text-text-2 tabular">{dishes.length}</span>
          </button>
          {categories.map((category, index) => (
            <div
              key={category.id}
              draggable
              onDragStart={() => setDragged(category.id)}
              onDragEnd={() => setDragged(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => drop(event, category.id)}
              className={cn('group/cat relative rounded-[12px]', dragged === category.id && 'opacity-50')}
            >
              <button type="button" aria-current={scope === category.id} title={t('dragCategory', { name: category.name })} onClick={() => setSelected(category.id)} onKeyDown={(event) => onCategoryKey(event, index)} className={catButton}>
                <GripVertical aria-hidden="true" className="size-[18px] shrink-0 cursor-grab text-text-3" strokeWidth={1.75} />
                <span className="min-w-0 truncate">{category.name}</span>
                <span className="ml-auto text-sm font-medium text-text-2 tabular group-focus-within/cat:invisible group-hover/cat:invisible">{category.dishCount}</span>
              </button>
              <button type="button" aria-label={t('editCategory', { name: category.name })} onClick={() => setCategorySheet({ category })} className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full opacity-0 hover:bg-surface focus:opacity-100 group-focus-within/cat:opacity-100 group-hover/cat:opacity-100">
                <Pencil aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          ))}
          <Button size="sm" variant="ghost" block className="mt-1.5 justify-start pl-2" onClick={() => setCategorySheet({ category: null })}>
            <FolderPlus aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            {t('newCategory')}
          </Button>
        </nav>

        <section aria-labelledby="dishes-title" className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center gap-3 p-5">
            <div className="min-w-0">
              <h2 id="dishes-title" className="truncate text-lg font-bold leading-[1.3]">{title}</h2>
              <p className="text-[0.9375rem] text-text-2 tabular">{summary}</p>
            </div>
            {search('menu-search-desktop', 'ml-auto w-[280px] shrink-0')}
          </div>
          <div aria-hidden="true" className="grid grid-cols-[minmax(0,1fr)_140px_180px_48px] items-center gap-4 border-t border-line bg-ground px-5 py-2.5 text-[0.8125rem] font-medium text-text-2">
            <span>{t('colDish')}</span>
            <span className="text-right">{t('colPrice')}</span>
            <span>{t('colAvailability')}</span>
            <span />
          </div>
          {visible.length === 0 ? (
            <div className="border-t border-line">{emptyList}</div>
          ) : (
            <ul>
              {visible.map((dish) => (
                <li key={dish.id} className="grid grid-cols-[minmax(0,1fr)_140px_180px_48px] items-center gap-4 border-t border-line px-5 py-3">
                  <button type="button" onClick={() => setDishSheet({ dish })} className="flex min-w-0 cursor-pointer items-center gap-3.5 text-left">
                    <DishThumb dish={dish} photoLabel={t('photo')} />
                    <span className="min-w-0">
                      <b className={cn('block text-base', !dish.isAvailable && 'text-text-2')}>{dish.name}</b>
                      {dish.description && <span className="block truncate text-sm text-text-2">{dish.description}</span>}
                    </span>
                  </button>
                  <span className="text-right font-bold tabular">{dish.priceLabel}</span>
                  <span className="flex items-center gap-3 text-sm text-text-2">
                    <Switch checked={dish.isAvailable} onCheckedChange={(on) => toggle(dish, on)} aria-label={t('availableLabel', { name: dish.name })} />
                    {dish.isAvailable ? t('available') : t('soldOut')}
                  </span>
                  <Button size="sm" variant="ghost" aria-label={t('actions', { name: dish.name })} className="w-10 px-0" onClick={() => setDishSheet({ dish })}>
                    <Ellipsis aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Mobile et tablette : une catégorie à la fois. */}
      <div className="-mx-4 pb-20 md:mx-0 md:mt-6 md:pb-0 xl:hidden">
        {search('menu-search-mobile', 'mx-3 mb-3 md:mx-0')}
        <div role="tablist" aria-label={t('categories')} className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden">
          <button type="button" role="tab" aria-selected={scope === ALL} onClick={() => setSelected(ALL)} className={tab}>
            {t('all')} <em className={tabCount}>{dishes.length}</em>
          </button>
          {categories.map((category) => (
            <button key={category.id} type="button" role="tab" aria-selected={scope === category.id} onClick={() => setSelected(category.id)} className={tab}>
              {category.name} <em className={tabCount}>{category.dishCount}</em>
            </button>
          ))}
          <button type="button" onClick={() => setManaging(true)} className={tab}>
            <Settings2 aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            {t('manage')}
          </button>
        </div>
        <div className="grid gap-2 px-3 md:px-0">
          <h2 className="flex justify-between gap-3 px-1 pt-2 text-[0.9375rem] font-bold">
            <span className="min-w-0 truncate">{title}</span>
            <span className="shrink-0 font-medium text-text-2 tabular">{summary}</span>
          </h2>
          {visible.length === 0 ? (
            <div className="rounded-lg border border-line bg-surface">{emptyList}</div>
          ) : (
            <ul className="grid gap-2 md:grid-cols-2">
              {visible.map((dish) => (
                <li key={dish.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-surface p-3">
                  <button type="button" onClick={() => setDishSheet({ dish })} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left">
                    <DishThumb dish={dish} photoLabel={t('photo')} compact />
                    <span className="min-w-0 flex-1">
                      <b className={cn('line-clamp-2 text-base', !dish.isAvailable && 'text-text-2')}>{dish.name}</b>
                      <span className="text-sm text-text-2 tabular">{dish.isAvailable ? dish.priceLabel : t('soldOutToday')}</span>
                    </span>
                  </button>
                  <Switch checked={dish.isAvailable} onCheckedChange={(on) => toggle(dish, on)} aria-label={t('availableLabel', { name: dish.name })} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button variant="primary" className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-20 h-14 px-[22px] shadow-[var(--shadow-floating)] md:hidden" onClick={openNewDish}>
          <Plus aria-hidden="true" className="size-5" strokeWidth={1.75} />
          {t('addDish')}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {header}
      {categories.length === 0 ? empty : workspace}
      {sheets}
    </>
  );
}

function DishThumb({ dish, photoLabel, compact }: { dish: MenuDish; photoLabel: string; compact?: boolean }) {
  if (dish.image) return <img src={dish.image.thumb} alt="" width={64} height={64} loading="lazy" className={cn('size-16 shrink-0 rounded-md object-cover', !dish.isAvailable && 'opacity-70 grayscale')} />;
  return (
    <span aria-hidden="true" className={cn('grid size-16 shrink-0 place-items-center content-center gap-0.5 rounded-md bg-sunken text-center text-xs font-bold leading-[1.2] text-text-3', !compact && 'border-[1.5px] border-dashed border-line-strong')}>
      <ImagePlus className="size-[18px]" strokeWidth={1.75} />
      {!compact && photoLabel}
    </span>
  );
}
