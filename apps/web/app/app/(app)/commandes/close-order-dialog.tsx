'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@restio/ui/components/button';
import { ConfirmDialog } from '@/components/sheet';
import { moveOrderAction } from '@/lib/orders/actions';
import type { OrderView } from '@/lib/orders/queries';

/** Refus (commande nouvelle) ou annulation (déjà acceptée) : toujours confirmés, car visibles du client. */
export function CloseOrderDialog({ order, onClose, onError }: { order: OrderView; onClose: () => void; onError: (message: string) => void }) {
  const t = useTranslations('orders');
  const [pending, start] = useTransition();
  const reject = order.status === 'new';

  function confirm() {
    start(async () => {
      try {
        const result = await moveOrderAction(order.id, order.status, reject ? 'rejected' : 'cancelled');
        if (result.error) onError(result.error);
      } catch (error) {
        console.error('[orders] close failed', error);
        onError(t('errors.generic'));
      }
      onClose();
    });
  }

  return (
    <ConfirmDialog
      title={reject ? t('confirm.rejectTitle') : t('confirm.cancelTitle')}
      onCancel={onClose}
      actions={
        <>
          <Button size="sm" onClick={onClose}>
            {t('confirm.keep')}
          </Button>
          <Button size="sm" variant="danger" loading={pending} onClick={confirm}>
            {reject ? t('confirm.reject') : t('confirm.cancel')}
          </Button>
        </>
      }
    >
      {reject ? t('confirm.rejectText', { number: order.number }) : t('confirm.cancelText', { number: order.number })}
    </ConfirmDialog>
  );
}
