// Montants au format numeric(12,2) : jamais de nombre flottant dans les calculs.
export type MoneyErrorCode = 'invalid_amount' | 'amount_overflow' | 'invalid_quantity';

export class MoneyError extends Error {
  readonly code: MoneyErrorCode;
  constructor(code: MoneyErrorCode) {
    super(code);
    this.name = 'MoneyError';
    this.code = code;
  }
}

const AMOUNT_RE = /^\d{1,10}(?:\.\d{1,2})?$/;
export const MAX_CENTS = 999_999_999_999n; // 9999999999.99, plafond de numeric(12,2)

export function toCents(amount: string): bigint {
  if (typeof amount !== 'string' || !AMOUNT_RE.test(amount)) throw new MoneyError('invalid_amount');
  const [int = '0', frac = ''] = amount.split('.');
  return BigInt(int) * 100n + BigInt(frac.padEnd(2, '0'));
}

export function fromCents(cents: bigint): string {
  if (cents < 0n) throw new MoneyError('invalid_amount');
  if (cents > MAX_CENTS) throw new MoneyError('amount_overflow');
  const int = cents / 100n;
  const frac = (cents % 100n).toString().padStart(2, '0');
  return `${int}.${frac}`;
}

export function isValidAmount(amount: string): boolean {
  return AMOUNT_RE.test(amount);
}

export function multiplyAmount(unitPrice: string, quantity: number): string {
  if (!Number.isSafeInteger(quantity) || quantity < 0) throw new MoneyError('invalid_quantity');
  return fromCents(toCents(unitPrice) * BigInt(quantity));
}

export function sumAmounts(amounts: readonly string[]): string {
  return fromCents(amounts.reduce((acc, a) => acc + toCents(a), 0n));
}

export function formatMoney(amount: string, currency: string, locale: string): string {
  toCents(amount);
  // 12 chiffres significatifs au plus : représentation exacte en double, l'affichage ne perd rien.
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(amount));
}
