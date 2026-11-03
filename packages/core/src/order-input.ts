import { z } from 'zod';
import { MoneyError, fromCents, toCents } from './money';

export const MAX_ORDER_LINES = 50;
export const MAX_QUANTITY = 99;

// Aucun prix, total ni restaurantId : ces valeurs viennent exclusivement du serveur.
export const orderItemInputSchema = z.strictObject({
  dishId: z.uuid(),
  quantity: z.int().min(1).max(MAX_QUANTITY),
});

// Postgres refuse le caractère NUL ; l'étiquette de table n'accepte aucun caractère de contrôle.
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const NUL = /\u0000/;

export const createOrderInputSchema = z.strictObject({
  idempotencyKey: z.uuid(),
  tableLabel: z.string().trim().min(1).max(20).refine((v) => !CONTROL_CHARS.test(v), 'invalid_characters'),
  customerNote: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !NUL.test(v), 'invalid_characters')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  items: z.array(orderItemInputSchema).min(1).max(MAX_ORDER_LINES),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export type OrderErrorCode =
  | 'quantity_exceeded'
  | 'too_many_lines'
  | 'empty_order'
  | 'dish_not_found'
  | 'dish_wrong_restaurant'
  | 'dish_unavailable'
  | 'category_hidden'
  | 'invalid_price'
  | 'total_overflow';

export class OrderError extends Error {
  readonly code: OrderErrorCode;
  readonly dishId: string | undefined;
  constructor(code: OrderErrorCode, dishId?: string) {
    super(code);
    this.name = 'OrderError';
    this.code = code;
    this.dishId = dishId;
  }
}

export function normalizeOrderItems(items: readonly OrderItemInput[]): OrderItemInput[] {
  const merged = new Map<string, number>();
  for (const { dishId, quantity } of items) {
    const total = (merged.get(dishId) ?? 0) + quantity;
    if (total > MAX_QUANTITY) throw new OrderError('quantity_exceeded', dishId);
    merged.set(dishId, total);
  }
  if (merged.size === 0) throw new OrderError('empty_order');
  if (merged.size > MAX_ORDER_LINES) throw new OrderError('too_many_lines');
  return [...merged].map(([dishId, quantity]) => ({ dishId, quantity }));
}

export type DishFromDb = {
  id: string;
  restaurantId: string;
  name: string;
  categoryName: string;
  price: string;
  isAvailable: boolean;
  categoryVisible: boolean;
};

export type PricedOrderLine = {
  dishId: string;
  dishName: string;
  categoryName: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
};

export type PricedOrder = { lines: PricedOrderLine[]; total: string };

export function priceOrder(
  items: readonly OrderItemInput[],
  dishesFromDb: readonly DishFromDb[],
  restaurantId: string,
): PricedOrder {
  const byId = new Map(dishesFromDb.map((d) => [d.id, d]));
  let totalCents = 0n;
  const lines = normalizeOrderItems(items).map(({ dishId, quantity }) => {
    const dish = byId.get(dishId);
    if (!dish) throw new OrderError('dish_not_found', dishId);
    if (dish.restaurantId !== restaurantId) throw new OrderError('dish_wrong_restaurant', dishId);
    if (!dish.isAvailable) throw new OrderError('dish_unavailable', dishId);
    if (!dish.categoryVisible) throw new OrderError('category_hidden', dishId);
    let unitCents: bigint;
    try {
      unitCents = toCents(dish.price);
    } catch {
      throw new OrderError('invalid_price', dishId);
    }
    const lineCents = unitCents * BigInt(quantity);
    totalCents += lineCents;
    return {
      dishId,
      dishName: dish.name,
      categoryName: dish.categoryName,
      unitPrice: fromCents(unitCents),
      quantity,
      lineTotal: toAmount(lineCents),
    };
  });
  return { lines, total: toAmount(totalCents) };
}

function toAmount(cents: bigint): string {
  try {
    return fromCents(cents);
  } catch (e) {
    if (e instanceof MoneyError) throw new OrderError('total_overflow');
    throw e;
  }
}
