'use client';

import { useState } from 'react';
import { LiveRefresh } from '@/components/live-refresh';
import { Toast } from '@/components/toast';
import { useNewOrderAlert } from '@/components/use-new-order-alert';
import type { OrderView } from '@/lib/orders/queries';
import { CloseOrderDialog } from '../commandes/close-order-dialog';
import { OrderTicket } from '../commandes/order-ticket';

/** Commandes à traiter de l'accueil : mêmes tickets et mêmes gestes que la page Commandes. */
export function DashboardOrders({ orders, newCount, alertTitle }: { orders: OrderView[]; newCount: number; alertTitle: string }) {
  const [closing, setClosing] = useState<OrderView | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  useNewOrderAlert(newCount, alertTitle);
  const fail = (message: string) => setToast((previous) => ({ id: (previous?.id ?? 0) + 1, message }));
  return (
    <>
      <LiveRefresh intervalMs={15_000} />
      {toast && <Toast key={toast.id} tone="error">{toast.message}</Toast>}
      {closing && <CloseOrderDialog order={closing} onClose={() => setClosing(null)} onError={fail} />}
      <div className="grid items-start gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {orders.map((order) => (
          <OrderTicket key={order.id} order={order} onError={fail} onAskClose={setClosing} />
        ))}
      </div>
    </>
  );
}
