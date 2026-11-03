import { describe, it, expect } from 'vitest';
import { MoneyError, formatMoney, fromCents, multiplyAmount, sumAmounts, toCents } from './money';

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (e) {
    return e instanceof MoneyError ? e.code : 'not_money_error';
  }
  return undefined;
}

describe('toCents / fromCents', () => {
  it('parses Postgres numeric strings', () => {
    expect(toCents('3500.00')).toBe(350000n);
    expect(toCents('0')).toBe(0n);
    expect(toCents('0.5')).toBe(50n);
    expect(toCents('12.34')).toBe(1234n);
    expect(toCents('9999999999.99')).toBe(999999999999n);
  });

  it('round-trips', () => {
    for (const s of ['0.00', '0.01', '0.10', '1.00', '3500.00', '9999999999.99']) {
      expect(fromCents(toCents(s))).toBe(s);
    }
  });

  it('rejects malformed, negative, NaN and over-precise values', () => {
    for (const bad of ['', ' ', '-1', '-0.01', 'NaN', 'Infinity', '1e3', '1.005', '1.', '.5', '1,50', '+1', '0x10', ' 1.00', '1.00 ']) {
      expect(codeOf(() => toCents(bad)), bad).toBe('invalid_amount');
    }
    expect(codeOf(() => toCents(1 as unknown as string))).toBe('invalid_amount');
  });

  it('rejects values beyond numeric(12,2)', () => {
    expect(codeOf(() => toCents('10000000000.00'))).toBe('invalid_amount');
    expect(codeOf(() => fromCents(1000000000000n))).toBe('amount_overflow');
    expect(codeOf(() => fromCents(-1n))).toBe('invalid_amount');
  });
});

describe('arithmetic', () => {
  it('adds without float drift (0.1 + 0.2)', () => {
    expect(sumAmounts(['0.1', '0.2'])).toBe('0.30');
    expect(sumAmounts([])).toBe('0.00');
  });

  it('multiplies exactly', () => {
    expect(multiplyAmount('0.10', 3)).toBe('0.30');
    expect(multiplyAmount('19.99', 99)).toBe('1979.01');
    expect(multiplyAmount('3500.00', 2)).toBe('7000.00');
    expect(multiplyAmount('5.00', 0)).toBe('0.00');
  });

  it('handles the numeric(12,2) ceiling', () => {
    expect(multiplyAmount('9999999999.99', 1)).toBe('9999999999.99');
    expect(codeOf(() => multiplyAmount('9999999999.99', 2))).toBe('amount_overflow');
    expect(codeOf(() => sumAmounts(['9999999999.99', '0.01']))).toBe('amount_overflow');
  });

  it('rejects bad quantities', () => {
    for (const q of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
      expect(codeOf(() => multiplyAmount('1.00', q)), String(q)).toBe('invalid_quantity');
    }
  });
});

describe('formatMoney', () => {
  it('uses Intl currency digits (XOF/XAF have none)', () => {
    expect(formatMoney('3500.00', 'XOF', 'fr-FR').replace(/\s/g, ' ')).toMatch(/^3 500 F/);
    expect(formatMoney('3500.00', 'XAF', 'fr-FR')).not.toMatch(/,00/);
    expect(formatMoney('12.50', 'EUR', 'fr-FR').replace(/\s/g, ' ')).toBe('12,50 €');
    expect(formatMoney('1234.5', 'USD', 'en-US')).toBe('$1,234.50');
    expect(formatMoney('9999999999.99', 'USD', 'en-US')).toBe('$9,999,999,999.99');
  });

  it('refuses invalid amounts', () => {
    expect(codeOf(() => formatMoney('abc', 'EUR', 'fr-FR'))).toBe('invalid_amount');
  });
});
