'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { ConfirmDialog, Sheet } from '@/components/sheet';
import { Toast } from '@/components/toast';
import { deleteCategoryAction, saveCategoryAction } from '@/lib/menu/actions';
import type { MenuCategory } from '@/lib/menu/queries';

const danger = 'text-status-danger hover:bg-status-danger-bg';

/** Création ou modification d'une catégorie. */
export function CategorySheet({ category, onClose }: { category: MenuCategory | null; onClose: () => void }) {
  const t = useTranslations('menu.categoryForm');
  const tf = useTranslations('menu.form');
  const tConfirm = useTranslations('menu.confirm');
  const [state, action, pending] = useActionState(saveCategoryAction, null);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  function remove() {
    if (!category) return;
    startDelete(async () => {
      const result = await deleteCategoryAction(category.id);
      if (result.error) {
        setConfirming(false);
        setDeleteError(result.error);
      } else onClose();
    });
  }

  return (
    <Sheet
      title={category ? t('editTitle') : t('newTitle')}
      closeLabel={tf('close')}
      onClose={onClose}
      footer={
        <>
          {category && (
            <Button variant="ghost" className={`px-3 md:mr-auto ${danger}`} onClick={() => setConfirming(true)}>
              <Trash2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
              {tf('delete')}
            </Button>
          )}
          <Button className="hidden md:ml-auto md:inline-flex" onClick={onClose}>
            {tf('cancel')}
          </Button>
          <Button type="submit" form="category-form" variant="primary" loading={pending} loadingText={tf('saving')}>
            {tf('save')}
          </Button>
        </>
      }
    >
      <form id="category-form" action={action} noValidate className="grid gap-4">
        {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
        {deleteError && <Toast tone="error">{deleteError}</Toast>}
        {category && <input type="hidden" name="id" value={category.id} />}
        <Field id="category-name" label={t('name')} hint={category ? t('deleteHint') : undefined} error={state?.fieldErrors?.name}>
          <TextInput name="name" defaultValue={category?.name} placeholder={t('placeholder')} maxLength={60} autoCapitalize="sentences" autoFocus required />
        </Field>
      </form>
      {confirming && category && (
        <ConfirmDialog
          title={tConfirm('deleteCategoryTitle')}
          onCancel={() => setConfirming(false)}
          actions={
            <>
              <Button size="sm" onClick={() => setConfirming(false)}>
                {tConfirm('keep')}
              </Button>
              <Button size="sm" variant="danger" loading={deleting} onClick={remove}>
                {tf('delete')}
              </Button>
            </>
          }
        >
          {tConfirm('deleteCategory', { name: category.name })}
        </ConfirmDialog>
      )}
    </Sheet>
  );
}

/** Mobile (« Gérer ») : réordonner, modifier et ajouter sans glisser-déposer. */
export function ManageCategoriesSheet({ categories, onMove, onEdit, onAdd, onClose }: { categories: MenuCategory[]; onMove: (index: number, delta: -1 | 1) => void; onEdit: (category: MenuCategory) => void; onAdd: () => void; onClose: () => void }) {
  const t = useTranslations('menu');
  const iconButton = 'grid size-11 shrink-0 place-items-center rounded-full hover:bg-sunken disabled:text-line-strong disabled:hover:bg-transparent';
  return (
    <Sheet
      title={t('categoryForm.manageTitle')}
      closeLabel={t('form.close')}
      onClose={onClose}
      footer={
        <Button variant="primary" block onClick={onAdd}>
          <Plus aria-hidden="true" className="size-5" strokeWidth={1.75} />
          {t('newCategory')}
        </Button>
      }
    >
      <ul className="overflow-hidden rounded-lg border border-line bg-surface">
        {categories.map((category, index) => (
          <li key={category.id} className="flex items-center border-t border-line pl-3.5 pr-1 first:border-t-0">
            <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">{category.name}</span>
            <span className="px-1.5 text-sm text-text-2 tabular">{category.dishCount}</span>
            <button type="button" disabled={index === 0} aria-label={t('moveUp', { name: category.name })} onClick={() => onMove(index, -1)} className={iconButton}>
              <ArrowUp aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            </button>
            <button type="button" disabled={index === categories.length - 1} aria-label={t('moveDown', { name: category.name })} onClick={() => onMove(index, 1)} className={iconButton}>
              <ArrowDown aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            </button>
            <button type="button" aria-label={t('editCategory', { name: category.name })} onClick={() => onEdit(category)} className={iconButton}>
              <Pencil aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
