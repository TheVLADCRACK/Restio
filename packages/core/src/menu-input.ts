import { z } from 'zod';
import { isValidAmount } from './money';

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
// Description sur plusieurs lignes : seuls les retours à la ligne et tabulations restent permis.
const CONTROL_CHARS_EXCEPT_NEWLINE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export const DISH_DESCRIPTION_MAX = 160;

export const categoryNameSchema = z.string().trim().min(1).max(60).refine((v) => !CONTROL_CHARS.test(v), 'invalid_characters');

export const dishInputSchema = z.strictObject({
  name: z.string().trim().min(1).max(80).refine((v) => !CONTROL_CHARS.test(v), 'invalid_characters'),
  description: z
    .string()
    .trim()
    .max(DISH_DESCRIPTION_MAX)
    .refine((v) => !CONTROL_CHARS_EXCEPT_NEWLINE.test(v), 'invalid_characters')
    .transform((v) => v || null),
  categoryId: z.uuid(),
  isAvailable: z.boolean(),
});

/**
 * Prix saisi (« 3 500 », « 12,50 ») vers le format numeric(12,2), ou null s'il est invalide.
 * Refuse plus de décimales que la devise n'en admet (aucune en FCFA).
 */
export function parsePriceInput(input: string, currency: string): string | null {
  const compact = input.replace(/[\s  ]/g, '').replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(compact)) return null;
  const [int = '', frac = ''] = compact.split('.');
  const digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  if (frac.length > digits) return null;
  const amount = frac ? `${int}.${frac}` : int;
  return isValidAmount(amount) ? amount : null;
}
