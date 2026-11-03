import { describe, it, expect } from 'vitest';
import { restaurantInputSchema } from './restaurant-input';

const valid = { name: 'Chez Mama', countryCode: 'CM', city: 'Douala', currency: 'XAF', timezone: 'Africa/Douala' };
const day = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
const ok = (over: Record<string, unknown>) => restaurantInputSchema.safeParse({ ...valid, ...over }).success;

describe('restaurantInputSchema', () => {
  it('accepts a valid restaurant and normalises fields', () => {
    const r = restaurantInputSchema.safeParse({ ...valid, name: '  Chez Mama  ', countryCode: ' cm ', city: ' Douala ' });
    expect(r.success && r.data).toEqual({ name: 'Chez Mama', countryCode: 'CM', city: 'Douala', currency: 'XAF', timezone: 'Africa/Douala' });
  });

  it('enforces name and city lengths', () => {
    expect(ok({ name: 'A' })).toBe(false);
    expect(ok({ name: '  A  ' })).toBe(false);
    expect(ok({ name: 'AB' })).toBe(true);
    expect(ok({ name: 'x'.repeat(80) })).toBe(true);
    expect(ok({ name: 'x'.repeat(81) })).toBe(false);
    expect(ok({ name: 'x'.repeat(100_000) })).toBe(false);
    expect(ok({ city: '' })).toBe(false);
    expect(ok({ city: 'x'.repeat(81) })).toBe(false);
  });

  it('keeps HTML as raw text', () => {
    const r = restaurantInputSchema.safeParse({ ...valid, name: '<img src=x onerror=alert(1)>' });
    expect(r.success && r.data.name).toBe('<img src=x onerror=alert(1)>');
  });

  it('validates ISO country codes', () => {
    expect(ok({ countryCode: 'FR' })).toBe(true);
    expect(ok({ countryCode: 'US' })).toBe(true);
    for (const c of ['ZZ', 'FRA', 'F', '12', '']) expect(ok({ countryCode: c }), c).toBe(false);
  });

  it('validates ISO 4217 currencies in upper case', () => {
    for (const c of ['XOF', 'XAF', 'EUR', 'USD']) expect(ok({ currency: c }), c).toBe(true);
    for (const c of ['eur', 'EU', 'EURO', 'ABC', '']) expect(ok({ currency: c }), c).toBe(false);
  });

  it('accepts an optional, non-future opening date', () => {
    expect(ok({ openedOn: undefined })).toBe(true);
    expect(ok({ openedOn: '2019-05-01' })).toBe(true);
    expect(ok({ openedOn: day(0) })).toBe(true);
    expect(ok({ openedOn: day(3) })).toBe(false);
    expect(ok({ openedOn: '2999-01-01' })).toBe(false);
    expect(ok({ openedOn: '2025-02-30' })).toBe(false);
    expect(ok({ openedOn: '01/05/2019' })).toBe(false);
    expect(ok({ openedOn: '' })).toBe(false);
  });
});

describe('restaurantInputSchema timezone', () => {
  it('refuse un fuseau inconnu', () => {
    expect(restaurantInputSchema.safeParse({ ...valid, timezone: 'Mars/Olympus' }).success).toBe(false);
  });
});
