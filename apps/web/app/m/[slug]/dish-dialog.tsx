'use client';
/* eslint-disable @next/next/no-img-element -- images déjà optimisées (WebP) servies depuis le stockage */

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { formatMoney, multiplyAmount } from '@restio/core/money';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import type { PublicDish } from '@/lib/public/queries';
import { useCart } from './cart';
import { QtyControl } from './qty-control';

/** Fiche du plat : feuille en bas sur mobile, fenêtre centrée sur ordinateur. */
export function DishDialog({ dish, currency, initialQuantity, initialNote, slug, onClose }: { dish: PublicDish; currency: string; initialQuantity: number; initialNote: string; slug: string; onClose: () => void }) {
  const t = useTranslations('pub');
  const locale = useLocale();
  const { setQuantity, setNote } = useCart(slug);
  const [quantity, setLocalQuantity] = useState(Math.max(initialQuantity, 1));
  const [note, setLocalNote] = useState(initialNote);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function add() {
    setQuantity(dish.id, quantity);
    setNote(dish.id, note.trim());
    onClose();
  }

  return (
    <dialog
      ref={ref}
      aria-label={dish.name}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-xl bg-surface text-ink backdrop:bg-ink/45 md:m-auto md:w-[560px] md:rounded-xl md:shadow-[var(--shadow-floating)]"
    >
      <div autoFocus tabIndex={-1} className="flex max-h-[90dvh] flex-col outline-none">
        <div aria-hidden="true" className="mx-auto mt-2 h-[5px] w-10 shrink-0 rounded-full bg-line-strong md:hidden" />
        <div className="min-h-0 flex-1 overflow-y-auto">
          {dish.image && (
            <div className="relative md:mt-0">
              {/* La vignette, déjà en cache, sert de fond pendant le chargement de la grande photo. */}
              <img src={dish.image.full} alt={dish.name} style={{ backgroundImage: `url(${dish.image.thumb})` }} className="h-[220px] w-full bg-sunken bg-cover bg-center object-cover" />
              <button type="button" onClick={onClose} aria-label={t('close')} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-surface/90">
                <X aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
              </button>
            </div>
          )}
          <div className="grid gap-3.5 px-5 py-[18px]">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold leading-[1.15] tracking-[-0.02em]">{dish.name}</h2>
                <p className="mt-1.5 text-xl font-bold tabular">{dish.priceLabel}</p>
              </div>
              {!dish.image && (
                <button type="button" onClick={onClose} aria-label={t('close')} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-sunken">
                  <X aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                </button>
              )}
            </div>
            {dish.description && <p className="text-[0.9375rem] text-text-2">{dish.description}</p>}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex h-[30px] items-center rounded-full bg-sunken px-3 text-[0.8125rem] font-bold">{dish.categoryName}</span>
            </div>
            <Field id="dish-note" label={t('dish.note')}>
              <TextInput value={note} onChange={(event) => setLocalNote(event.target.value)} maxLength={120} placeholder={t('dish.notePlaceholder')} />
            </Field>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 border-t border-line px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:pb-4">
          <QtyControl quantity={quantity} min={1} addLabel={t('add', { name: dish.name })} removeLabel={t('remove', { name: dish.name })} onChange={setLocalQuantity} />
          <Button variant="primary" className="min-w-0 flex-1 tabular" onClick={add}>
            {t('dish.add', { amount: formatMoney(multiplyAmount(dish.price, quantity), currency, locale) })}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
