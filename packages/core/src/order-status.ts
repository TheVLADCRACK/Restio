export const ORDER_STATUSES = ['new', 'accepted', 'preparing', 'ready', 'completed', 'rejected', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// UML.md §7 : toute transition absente de cette table est refusée côté serveur.
export const ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  new: ['accepted', 'rejected', 'preparing'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  rejected: [],
  cancelled: [],
};

const NEXT_STEP: Readonly<Partial<Record<OrderStatus, OrderStatus>>> = {
  new: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return Object.hasOwn(ORDER_TRANSITIONS, from) && ORDER_TRANSITIONS[from].includes(to);
}

export function nextStep(status: OrderStatus): OrderStatus | null {
  return Object.hasOwn(NEXT_STEP, status) ? (NEXT_STEP[status] ?? null) : null;
}

export function isActive(status: OrderStatus): boolean {
  return Object.hasOwn(ORDER_TRANSITIONS, status) && ORDER_TRANSITIONS[status].length > 0;
}
