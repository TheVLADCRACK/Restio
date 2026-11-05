'use client';
/* eslint-disable @next/next/no-img-element -- photos déjà recadrées et servies depuis le stockage */

import { startTransition, useActionState, useEffect, useRef, useState, useTransition, type ChangeEvent, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Image as ImageIcon, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { Switch } from '@restio/ui/components/switch';
import { TextInput } from '@restio/ui/components/text-input';
import { ConfirmDialog, Sheet } from '@/components/sheet';
import { Toast } from '@/components/toast';
import { deleteDishAction, saveDishAction } from '@/lib/menu/actions';
import type { MenuCategory, MenuDish } from '@/lib/menu/queries';
import { SelectInput } from '../../onboarding/_components/select-input';
import { compressImage } from './compress-image';

const DESCRIPTION_MAX = 160;
const danger = 'text-status-danger hover:bg-status-danger-bg';

type Props = { dish: MenuDish | null; categories: MenuCategory[]; defaultCategoryId?: string; currencySymbol: string; onClose: () => void };

export function DishSheet({ dish, categories, defaultCategoryId, currencySymbol, onClose }: Props) {
  const t = useTranslations('menu.form');
  const tConfirm = useTranslations('menu.confirm');
  const tMenu = useTranslations('menu');
  const [state, action, pending] = useActionState(saveDishAction, null);
  const [description, setDescription] = useState(dish?.description ?? '');
  const [available, setAvailable] = useState(dish?.isAvailable ?? true);
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [removed, setRemoved] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const preview = photo?.url ?? (removed ? null : dish?.image?.full ?? null);

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);
  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = await compressImage(file);
    if ('error' in result) {
      setPhotoError(result.error === 'tooBig' ? t('photoTooBig') : t('photoUnreadable'));
      return;
    }
    setPhotoError(null);
    setRemoved(false);
    setPhoto({ blob: result.blob, url: URL.createObjectURL(result.blob) });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    if (photo) data.set('photo', photo.blob, 'photo.jpg');
    if (removed && !photo) data.set('removePhoto', 'on');
    startTransition(() => action(data));
  }

  function remove() {
    if (!dish) return;
    startDelete(async () => {
      const result = await deleteDishAction(dish.id);
      if (result.error) {
        setConfirming(false);
        setDeleteError(result.error);
      } else onClose();
    });
  }

  const photoFieldError = photoError ?? state?.fieldErrors?.photo;
  return (
    <Sheet
      title={dish ? t('editDish') : t('newDish')}
      closeLabel={t('close')}
      onClose={onClose}
      footer={
        <>
          {dish && (
            <Button variant="ghost" className={`mr-auto hidden px-3 md:inline-flex ${danger}`} onClick={() => setConfirming(true)}>
              <Trash2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
              {t('delete')}
            </Button>
          )}
          <Button className="hidden md:ml-auto md:inline-flex" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="dish-form" variant="primary" loading={pending} loadingText={t('saving')}>
            {t('save')}
          </Button>
        </>
      }
    >
      <form id="dish-form" onSubmit={submit} noValidate className="grid gap-4 md:gap-[18px]">
        {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
        {deleteError && <Toast tone="error">{deleteError}</Toast>}
        {dish && <input type="hidden" name="id" value={dish.id} />}
        <div className="grid gap-1.5">
          <div className="flex items-center gap-3 md:gap-4">
            {preview ? (
              <img src={preview} alt={t('currentPhoto', { name: dish?.name ?? '' })} className="size-20 shrink-0 rounded-md object-cover md:size-24" />
            ) : (
              <span aria-hidden="true" className="grid size-20 shrink-0 place-items-center rounded-md border-[1.5px] border-dashed border-line-strong bg-sunken text-text-3 md:size-24">
                <ImagePlus className="size-6" strokeWidth={1.75} />
              </span>
            )}
            <div className="grid min-w-0 gap-2">
              <div className="flex gap-2">
                <Button size="sm" onClick={() => input.current?.click()}>
                  <ImageIcon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                  {preview ? t('changePhoto') : t('addPhoto')}
                </Button>
                {preview && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPhoto(null);
                      setRemoved(true);
                    }}
                  >
                    {t('removePhoto')}
                  </Button>
                )}
              </div>
              <p className="text-[0.8125rem] text-text-2">{t('photoHint')}</p>
            </div>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} className="sr-only" tabIndex={-1} aria-hidden="true" />
          </div>
          {photoFieldError && <p className="text-sm font-medium text-status-danger">{photoFieldError}</p>}
        </div>
        <Field id="dish-name" label={t('name')} error={state?.fieldErrors?.name}>
          <TextInput name="name" defaultValue={dish?.name} maxLength={80} autoCapitalize="sentences" required />
        </Field>
        <Field id="dish-description" label={t('description')} error={state?.fieldErrors?.description}>
          <textarea
            name="description"
            rows={3}
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full min-w-0 resize-none rounded-md border border-line-strong bg-surface px-3.5 py-3 text-base text-ink transition-[border-color,box-shadow] duration-150 hover:border-[#B5B5B0] focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none aria-invalid:border-status-danger"
          />
        </Field>
        <p aria-live="polite" className="-mt-3 text-right text-[0.8125rem] text-text-3 tabular md:-mt-3.5">
          {description.length} / {DESCRIPTION_MAX}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="dish-price" label={t('price')} error={state?.fieldErrors?.price}>
            <PriceInput defaultValue={dish?.priceInput} suffix={currencySymbol} />
          </Field>
          <Field id="dish-category" label={t('category')} error={state?.fieldErrors?.categoryId}>
            <SelectInput name="categoryId" defaultValue={dish?.categoryId ?? defaultCategoryId ?? categories[0]?.id} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <div className="flex items-center gap-4 border-t border-line pt-3.5">
          <div className="min-w-0 flex-1">
            <b className="block text-base font-medium">{tMenu('available')}</b>
            <span className="block text-sm text-text-2">{t('availableHint')}</span>
          </div>
          <Switch checked={available} onCheckedChange={setAvailable} aria-label={tMenu('available')} />
          {available && <input type="hidden" name="isAvailable" value="on" />}
        </div>
        {dish && (
          <Button variant="ghost" block className={`md:hidden ${danger}`} onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t('deleteDish')}
          </Button>
        )}
      </form>
      {confirming && dish && (
        <ConfirmDialog
          title={tConfirm('deleteDishTitle')}
          onCancel={() => setConfirming(false)}
          actions={
            <>
              <Button size="sm" onClick={() => setConfirming(false)}>
                {tConfirm('keep')}
              </Button>
              <Button size="sm" variant="danger" loading={deleting} onClick={remove}>
                {t('delete')}
              </Button>
            </>
          }
        >
          {tConfirm('deleteDish', { name: dish.name })}
        </ConfirmDialog>
      )}
    </Sheet>
  );
}

// Field injecte id et aria-* sur son enfant direct : ils sont transmis au champ.
function PriceInput({ defaultValue, suffix, ...aria }: { defaultValue?: string; suffix: string; id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) {
  return (
    <div className="flex h-12 items-center overflow-hidden rounded-md border border-line-strong bg-surface transition-[border-color,box-shadow] duration-150 focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(15,15,15,.12)] has-aria-invalid:border-status-danger">
      <input {...aria} name="price" inputMode="decimal" defaultValue={defaultValue} required className="h-full w-full min-w-0 bg-transparent px-3.5 text-base text-ink tabular focus:outline-none" />
      <span className="pl-2 pr-3.5 font-medium text-text-2">{suffix}</span>
    </div>
  );
}
