import { describe, it, expect } from 'vitest';
import { OrderError, createOrderInputSchema, normalizeOrderItems, priceOrder, type DishFromDb } from './order-input';

const R1 = '0192f1a0-0000-7000-8000-000000000001';
const R2 = '0192f1a0-0000-7000-8000-000000000002';
const D1 = '0192f1a0-0000-7000-8000-0000000000d1';
const D2 = '0192f1a0-0000-7000-8000-0000000000d2';
const D3 = '0192f1a0-0000-7000-8000-0000000000d3';
const KEY = '3b241101-e2bb-4255-8caf-4136c566a962';

const body = (over: Record<string, unknown> = {}) => ({
  idempotencyKey: KEY,
  tableLabel: '12',
  items: [{ dishId: D1, quantity: 1 }],
  ...over,
});

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (e) {
    return e instanceof OrderError ? e.code : 'not_order_error';
  }
  return undefined;
}

describe('createOrderInputSchema', () => {
  it('accepts a minimal valid body and trims text', () => {
    const r = createOrderInputSchema.safeParse(body({ tableLabel: '  Terrasse 3  ', customerNote: '  sans piment ' }));
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tableLabel).toBe('Terrasse 3');
      expect(r.data.customerNote).toBe('sans piment');
    }
  });

  it('turns an empty or blank note into undefined', () => {
    for (const note of ['', '   ']) {
      const r = createOrderInputSchema.safeParse(body({ customerNote: note }));
      expect(r.success && r.data.customerNote).toBeUndefined();
    }
  });

  it('keeps HTML as raw text (never interpreted here)', () => {
    const note = '<script>alert(1)</script><img src=x onerror=alert(1)>';
    const r = createOrderInputSchema.safeParse(body({ customerNote: note, tableLabel: '<b>1</b>' }));
    expect(r.success && r.data.customerNote).toBe(note);
    expect(r.success && r.data.tableLabel).toBe('<b>1</b>');
  });

  it('rejects client-supplied prices, totals or restaurantId', () => {
    expect(createOrderInputSchema.safeParse(body({ total: '0.00' })).success).toBe(false);
    expect(createOrderInputSchema.safeParse(body({ restaurantId: R2 })).success).toBe(false);
    expect(createOrderInputSchema.safeParse(body({ items: [{ dishId: D1, quantity: 1, price: '0.01' }] })).success).toBe(false);
  });

  it('enforces lengths and ranges', () => {
    const bad: Record<string, unknown>[] = [
      { tableLabel: '' },
      { tableLabel: '   ' },
      { tableLabel: 'x'.repeat(21) },
      { customerNote: 'x'.repeat(501) },
      { customerNote: 'x'.repeat(1_000_000) },
      { customerNote: null },
      { idempotencyKey: 'not-a-uuid' },
      { idempotencyKey: `${KEY}' OR 1=1 --` },
      { items: [] },
      { items: [{ dishId: D1, quantity: 0 }] },
      { items: [{ dishId: D1, quantity: 100 }] },
      { items: [{ dishId: D1, quantity: 1.5 }] },
      { items: [{ dishId: D1, quantity: '2' }] },
      { items: [{ dishId: 'abc', quantity: 1 }] },
      { items: Array.from({ length: 51 }, () => ({ dishId: D1, quantity: 1 })) },
      { items: 'D1' },
    ];
    for (const over of bad) {
      expect(createOrderInputSchema.safeParse(body(over)).success, JSON.stringify(over).slice(0, 80)).toBe(false);
    }
    expect(createOrderInputSchema.safeParse(body({ tableLabel: 'x'.repeat(20), customerNote: 'x'.repeat(500) })).success).toBe(true);
    expect(
      createOrderInputSchema.safeParse(body({ items: Array.from({ length: 50 }, () => ({ dishId: D1, quantity: 1 })) })).success,
    ).toBe(true);
  });

  it('rejects non-object bodies', () => {
    for (const v of [null, undefined, 'x', 42, []]) expect(createOrderInputSchema.safeParse(v).success).toBe(false);
  });
});

describe('normalizeOrderItems', () => {
  it('merges duplicate dishes, keeping first-seen order', () => {
    expect(
      normalizeOrderItems([
        { dishId: D1, quantity: 2 },
        { dishId: D2, quantity: 1 },
        { dishId: D1, quantity: 3 },
      ]),
    ).toEqual([
      { dishId: D1, quantity: 5 },
      { dishId: D2, quantity: 1 },
    ]);
  });

  it('allows exactly 99 after merge and rejects 100', () => {
    expect(normalizeOrderItems([{ dishId: D1, quantity: 50 }, { dishId: D1, quantity: 49 }])).toEqual([{ dishId: D1, quantity: 99 }]);
    expect(codeOf(() => normalizeOrderItems([{ dishId: D1, quantity: 50 }, { dishId: D1, quantity: 50 }]))).toBe('quantity_exceeded');
  });

  it('collapses 50 identical lines into one', () => {
    expect(normalizeOrderItems(Array.from({ length: 50 }, () => ({ dishId: D1, quantity: 1 })))).toEqual([{ dishId: D1, quantity: 50 }]);
  });

  it('rejects an empty list', () => {
    expect(codeOf(() => normalizeOrderItems([]))).toBe('empty_order');
  });
});

describe('priceOrder', () => {
  const dishes: DishFromDb[] = [
    { id: D1, restaurantId: R1, name: 'Ndolé', categoryName: 'Plats', price: '3500.00', isAvailable: true, categoryVisible: true },
    { id: D2, restaurantId: R1, name: 'Jus de bissap', categoryName: 'Boissons', price: '0.10', isAvailable: true, categoryVisible: true },
  ];

  it('prices lines from the database only', () => {
    const r = priceOrder(
      [
        { dishId: D1, quantity: 2 },
        { dishId: D2, quantity: 3 },
        { dishId: D1, quantity: 1 },
      ],
      dishes,
      R1,
    );
    expect(r).toEqual({
      lines: [
        { dishId: D1, dishName: 'Ndolé', categoryName: 'Plats', unitPrice: '3500.00', quantity: 3, lineTotal: '10500.00' },
        { dishId: D2, dishName: 'Jus de bissap', categoryName: 'Boissons', unitPrice: '0.10', quantity: 3, lineTotal: '0.30' },
      ],
      total: '10500.30',
    });
  });

  it('ignores any price smuggled into the items at runtime', () => {
    const smuggled = [{ dishId: D1, quantity: 1, price: '0.01', unitPrice: '0.01' }];
    expect(priceOrder(smuggled, dishes, R1).total).toBe('3500.00');
  });

  it('rejects unknown, foreign, unavailable and hidden dishes', () => {
    expect(codeOf(() => priceOrder([{ dishId: D3, quantity: 1 }], dishes, R1))).toBe('dish_not_found');
    const foreign = [{ ...dishes[0]!, restaurantId: R2 }];
    expect(codeOf(() => priceOrder([{ dishId: D1, quantity: 1 }], foreign, R1))).toBe('dish_wrong_restaurant');
    const off = [{ ...dishes[0]!, isAvailable: false }];
    expect(codeOf(() => priceOrder([{ dishId: D1, quantity: 1 }], off, R1))).toBe('dish_unavailable');
    const hidden = [{ ...dishes[0]!, categoryVisible: false }];
    expect(codeOf(() => priceOrder([{ dishId: D1, quantity: 1 }], hidden, R1))).toBe('category_hidden');
  });

  it('reports the offending dish id', () => {
    try {
      priceOrder([{ dishId: D1, quantity: 1 }, { dishId: D3, quantity: 1 }], dishes, R1);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(OrderError);
      expect((e as OrderError).dishId).toBe(D3);
    }
  });

  it('rejects corrupt prices and overflowing totals', () => {
    const corrupt = [{ ...dishes[0]!, price: '-1.00' }];
    expect(codeOf(() => priceOrder([{ dishId: D1, quantity: 1 }], corrupt, R1))).toBe('invalid_price');
    const huge = [{ ...dishes[0]!, price: '9999999999.99' }];
    expect(priceOrder([{ dishId: D1, quantity: 1 }], huge, R1).total).toBe('9999999999.99');
    expect(codeOf(() => priceOrder([{ dishId: D1, quantity: 2 }], huge, R1))).toBe('total_overflow');
  });
});
