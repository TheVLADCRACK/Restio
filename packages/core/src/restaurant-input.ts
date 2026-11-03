import { z } from 'zod';
import { isSupportedCountry } from 'libphonenumber-js';
import { isValidTimeZone } from './locale-defaults';

// UTC+14 (Kiribati) : la date locale peut avoir un jour d'avance sur la date UTC du serveur.
const MAX_TZ_AHEAD_MS = 14 * 3_600_000;

export const countryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/)
  .refine((c) => isSupportedCountry(c), 'invalid_country');

export const currencySchema = z
  .string()
  .regex(/^[A-Z]{3}$/)
  .refine((c) => Intl.supportedValuesOf('currency').includes(c), 'invalid_currency');

export const restaurantInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  countryCode: countryCodeSchema,
  city: z.string().trim().min(1).max(80),
  openedOn: z.iso
    .date()
    .optional()
    .refine((d) => d === undefined || d <= latestAllowedDay(), 'future_date'),
  currency: currencySchema,
  timezone: z.string().trim().max(64).refine(isValidTimeZone, 'invalid_timezone'),
});

export type RestaurantInput = z.input<typeof restaurantInputSchema>;
export type RestaurantData = z.output<typeof restaurantInputSchema>;

function latestAllowedDay(now: number = Date.now()): string {
  return new Date(now + MAX_TZ_AHEAD_MS).toISOString().slice(0, 10);
}
