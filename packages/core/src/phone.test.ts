import { describe, it, expect } from 'vitest';
import { PhoneError, callingCodeFor, isValidPhone, normalizePhone } from './phone';

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (e) {
    return e instanceof PhoneError ? e.code : 'not_phone_error';
  }
  return undefined;
}

describe('normalizePhone', () => {
  it('normalises national numbers with the default country', () => {
    expect(normalizePhone('6 71 23 45 67', 'CM')).toBe('+237671234567');
    expect(normalizePhone('06 12 34 56 78', 'FR')).toBe('+33612345678');
    expect(normalizePhone('(201) 555-0123', 'US')).toBe('+12015550123');
  });

  it('accepts international formats', () => {
    expect(normalizePhone('+237 6 71 23 45 67', 'CM')).toBe('+237671234567');
    expect(normalizePhone('+33 6 12 34 56 78', 'FR')).toBe('+33612345678');
    expect(normalizePhone('  +1 201-555-0123  ', 'US')).toBe('+12015550123');
  });

  it('never rewrites an international number to the default country', () => {
    expect(normalizePhone('+237 6 71 23 45 67', 'FR')).toBe('+237671234567');
    expect(normalizePhone('+33 6 12 34 56 78', 'US')).toBe('+33612345678');
    expect(codeOf(() => normalizePhone('+999 123 456 789', 'CM'))).toBe('invalid_phone');
  });

  it('rejects invalid numbers', () => {
    for (const [input, country] of [
      ['12345', 'CM'],
      ['06 12', 'FR'],
      ['555-0123', 'US'],
      ['', 'FR'],
      ['   ', 'FR'],
      ['abc', 'FR'],
      ['+33 6 12 34 56 78 90 12', 'FR'],
      ['Appelez le +33 6 12 34 56 78', 'FR'],
      ['<script>alert(1)</script>', 'FR'],
      ['1'.repeat(10_000), 'FR'],
    ] as const) {
      expect(codeOf(() => normalizePhone(input, country)), input.slice(0, 40)).toBe('invalid_phone');
    }
  });

  it('rejects unknown default countries', () => {
    expect(codeOf(() => normalizePhone('0612345678', 'ZZ'))).toBe('invalid_country');
    expect(codeOf(() => normalizePhone('0612345678', 'fr'))).toBe('invalid_country');
  });

  it('isValidPhone mirrors normalizePhone', () => {
    expect(isValidPhone('06 12 34 56 78', 'FR')).toBe(true);
    expect(isValidPhone('06 12', 'FR')).toBe(false);
  });
});

describe('callingCodeFor', () => {
  it('returns calling codes', () => {
    expect(callingCodeFor('CM')).toBe('237');
    expect(callingCodeFor('FR')).toBe('33');
    expect(callingCodeFor('US')).toBe('1');
    expect(callingCodeFor('SN')).toBe('221');
  });

  it('rejects unknown countries', () => {
    expect(codeOf(() => callingCodeFor('XX'))).toBe('invalid_country');
  });
});
