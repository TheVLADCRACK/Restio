import type { LucideIcon } from 'lucide-react';
import { BellRing, Check, ChefHat, ConciergeBell } from 'lucide-react';
import type { OrderStatus } from '@restio/core';

// Statut = libellé + icône + teinte (jamais la couleur seule). Seules les étapes actives sont affichées ici.
const STATUS: Partial<Record<OrderStatus, { label: string; icon: LucideIcon; className: string }>> = {
  new: { label: 'Nouvelle', icon: BellRing, className: 'bg-status-new-bg text-status-new' },
  accepted: { label: 'Acceptée', icon: Check, className: 'bg-status-info-bg text-status-info' },
  preparing: { label: 'En préparation', icon: ChefHat, className: 'bg-status-prep-bg text-status-prep' },
  ready: { label: 'Prête', icon: ConciergeBell, className: 'bg-status-ok-bg text-status-ok' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS[status];
  if (!meta) return null;
  return (
    <span className={`inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pl-2 pr-2.5 text-[0.8125rem] font-bold ${meta.className}`}>
      <meta.icon aria-hidden="true" className="size-[15px]" strokeWidth={2} />
      {meta.label}
    </span>
  );
}
