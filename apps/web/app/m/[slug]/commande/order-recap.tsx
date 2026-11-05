'use client';
/* eslint-disable @next/next/no-img-element -- vignettes déjà optimisées (WebP) servies depuis le stockage */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, HandCoins, MapPin, ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import { formatMoney, fromCents, multiplyAmount, toCents } from '@restio/core/money';
import { Button, buttonClass } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { Toast } from '@/components/toast';
import { EmptyState } from '@/app/app/(app)/_components/empty-state';
import { createOrderAction } from '@/lib/public/actions';
import type { PublicMenu } from '@/lib/public/queries';
import { useCart } from '../cart';
import { QtyControl } from '../qty-control';

const card = 'grid gap-3.5 rounded-lg border border-line bg-surface p-4 md:p-5';
const cardTitle = 'text-[0.9375rem] font-bold md:text-lg';

export function OrderRecap({ menu }: { menu: PublicMenu }) {
  const t = useTranslations('pub');
  const tr = useTranslations('pub.recap');
  const locale = useLocale();
  const router = useRouter();
  const { slug, currency } = menu.restaurant;
  const { cart, setQuantity, ensureKey, clear } = useCart(slug);
  const [tableInput, setTableInput] = useState('');
  const [tableError, setTableError] = useState(false);
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [pending, startSend] = useTransition();

  const lines = menu.dishes.filter((d) => d.isAvailable && (cart.items[d.id] ?? 0) > 0);
  const count = lines.reduce((sum, d) => sum + (cart.items[d.id] ?? 0), 0);
  const total = fromCents(lines.reduce((sum, d) => sum + toCents(d.price) * BigInt(cart.items[d.id] ?? 0), 0n));
  const money = (amount: string) => formatMoney(amount, currency, locale);
  const menuHref = `/@${slug}`;
  const table = cart.table || tableInput.trim();

  function send() {
    if (pending) return;
    if (!table) {
      setTableError(true);
      return;
    }
    // Les précisions par plat rejoignent la note de commande, lue en cuisine.
    const dishNotes = lines.flatMap((d) => (cart.notes[d.id] ? [`${d.name} : ${cart.notes[d.id]}`] : []));
    const customerNote = [...dishNotes, note.trim()].filter(Boolean).join('\n').slice(0, 500);
    startSend(async () => {
      const result = await createOrderAction(slug, {
        idempotencyKey: ensureKey(),
        tableLabel: table,
        customerNote,
        customerName: name.trim(),
        items: lines.map((d) => ({ dishId: d.id, quantity: cart.items[d.id] ?? 0 })),
      });
      if ('orderId' in result) {
        clear();
        router.push(`/@${slug}/commande/${result.orderId}`);
        return;
      }
      if (result.error === 'dish_unavailable' && result.dishId) setQuantity(result.dishId, 0);
      router.refresh();
      setToast((previous) => ({ id: (previous?.id ?? 0) + 1, message: tr(`errors.${result.error}`) }));
    });
  }

  const sendButton = (className: string) => (
    <Button variant="primary" block className={`tabular ${className}`} loading={pending} loadingText={tr('sending')} onClick={send}>
      {tr('send', { amount: money(total) })}
    </Button>
  );

  return (
    <div className="mx-auto max-w-[720px] pb-28 md:pb-10">
      <div className="grid h-[calc(52px+env(safe-area-inset-top))] grid-cols-[48px_minmax(0,1fr)_48px] items-center px-1 pt-[env(safe-area-inset-top)] md:hidden">
        <Link href={menuHref} aria-label={tr('back')} className="grid size-12 place-items-center rounded-full hover:bg-sunken">
          <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </Link>
        <h1 className="truncate text-center text-[1.0625rem] font-bold">{tr('title')}</h1>
      </div>
      <div className="hidden pt-8 md:block">
        <Link href={menuHref} className="inline-flex items-center gap-1.5 text-[0.9375rem] font-bold">
          <ArrowLeft aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
          {tr('back')}
        </Link>
        <h1 className="mt-2.5 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.02em]">{tr('title')}</h1>
      </div>

      {toast && (
        <Toast key={toast.id} tone="error">
          {toast.message}
        </Toast>
      )}

      {lines.length === 0 ? (
        <div className="mx-4 mt-1 rounded-lg border border-line bg-surface md:mx-0 md:mt-4">
          <EmptyState icon={ShoppingBasket} title={tr('emptyTitle')} action={<Link href={menuHref} className={buttonClass({ variant: 'dark' })}>{tr('seeMenu')}</Link>}>
            {tr('empty')}
          </EmptyState>
        </div>
      ) : (
        <div className="grid gap-4 px-4 pb-6 pt-1 md:mt-4 md:px-0 md:pb-0 md:pt-0">
          {cart.table ? (
            <div className="flex items-center gap-3 rounded-md bg-lime-soft px-3.5 py-3">
              <MapPin aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.75} />
              <div>
                <b className="block">{tr('tableKnown', { table: cart.table })}</b>
                <span className="text-[0.8125rem] text-text-2">{tr('tableHint')}</span>
              </div>
            </div>
          ) : (
            <section className={card}>
              <Field id="order-table" label={tr('tableLabel')} error={tableError ? tr('errors.table') : undefined}>
                <TextInput
                  value={tableInput}
                  onChange={(event) => {
                    setTableInput(event.target.value);
                    setTableError(false);
                  }}
                  maxLength={20}
                  placeholder={tr('tablePlaceholder')}
                  required
                />
              </Field>
            </section>
          )}
          <section className={card}>
            <h2 className={cardTitle}>{tr('items')}</h2>
            <div>
              {lines.map((dish) => {
                const quantity = cart.items[dish.id] ?? 0;
                return (
                  <div key={dish.id} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0">
                    {dish.image ? (
                      <img src={dish.image.thumb} alt="" width={56} height={56} loading="lazy" className="size-14 rounded-sm object-cover" />
                    ) : (
                      <span aria-hidden="true" className="grid size-14 place-items-center rounded-sm bg-sunken text-text-3">
                        <UtensilsCrossed className="size-5" strokeWidth={1.75} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <b className="block text-[0.9375rem]">{dish.name}</b>
                      <span className="text-sm text-text-2 tabular">{money(multiplyAmount(dish.price, quantity))}</span>
                      {cart.notes[dish.id] && <span className="block truncate text-[0.8125rem] text-text-2">{cart.notes[dish.id]}</span>}
                    </div>
                    <QtyControl size="sm" quantity={quantity} addLabel={t('add', { name: dish.name })} removeLabel={t('remove', { name: dish.name })} onChange={(next) => setQuantity(dish.id, next)} />
                  </div>
                );
              })}
            </div>
          </section>
          <section className={card}>
            <Field id="order-note" label={tr('note')}>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={300} placeholder={tr('notePlaceholder')} className="w-full min-w-0 resize-none rounded-md border border-line-strong bg-surface px-3.5 py-3 text-base text-ink placeholder:text-text-3 focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none" />
            </Field>
            <Field id="order-name" label={tr('name')}>
              <TextInput value={name} onChange={(event) => setName(event.target.value)} maxLength={40} autoComplete="given-name" placeholder={tr('namePlaceholder')} />
            </Field>
          </section>
          <section className={card}>
            <div className="grid gap-2 text-[0.9375rem]">
              <div className="flex justify-between gap-3">
                <span>{tr('summary', { lines: lines.length, count })}</span>
                <span className="tabular">{money(total)}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-dashed border-line-strong pt-2.5 text-lg font-bold">
                <span>{tr('total')}</span>
                <span className="tabular">{money(total)}</span>
              </div>
            </div>
            <p className="flex items-center gap-2 text-sm text-text-2">
              <HandCoins aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.75} />
              {tr('payNote')}
            </p>
            {sendButton('hidden md:inline-flex')}
          </section>
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:hidden">{sendButton('')}</div>
        </div>
      )}
    </div>
  );
}
