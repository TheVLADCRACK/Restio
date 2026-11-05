import { formatMoney, fromCents, toCents } from '@restio/core';

/** Montant formaté et découpé pour l'affichage en grand : la devise en plus petit (planche). */
export function moneyParts(amount: string, currency: string, locale: string): { full: string; value: string; unit: string } {
  const full = formatMoney(amount, currency, locale);
  const parts = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(Number(amount));
  const unit = parts.find((p) => p.type === 'currency')?.value ?? '';
  const value = parts.filter((p) => p.type !== 'currency' && p.type !== 'literal').map((p) => p.value).join('');
  return { full, value: value || full, unit: value ? unit : '' };
}

/** Moyenne exacte en centimes (arrondie au centime le plus proche) ; null si aucune commande. */
export function averageAmount(total: string, count: number): string | null {
  if (count <= 0) return null;
  const n = BigInt(count);
  return fromCents((toCents(total) + n / 2n) / n);
}

/** Minutes écoulées depuis une date. */
export function minutesSince(date: Date | string, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(date).getTime()) / 60_000));
}
/** Âge lisible (« 6 min », « 1 h 05 ») ; « à l'instant » reste au choix de l'appelant. */
export type AgeMessages = (key: 'minutes' | 'hours', values: { h?: number; m: number | string }) => string;
export function ageLabel(minutes: number, t: AgeMessages): string {
  if (minutes < 60) return t('minutes', { m: minutes });
  return t('hours', { h: Math.floor(minutes / 60), m: String(minutes % 60).padStart(2, '0') });
}

/** Plafond « rond » de l'axe des ventes (1, 2, 2,5, 5 × 10ⁿ). */
export function niceMax(value: number): number {
  if (!(value > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => value / p <= s) ?? 10;
  return step * p;
}

/** « Mer 28 » à partir d'un jour « AAAA-MM-JJ » (déjà exprimé dans le fuseau du restaurant). */
export function dayLabel(day: string, locale: string): { weekday: string; date: number } {
  const d = new Date(`${day}T12:00:00Z`);
  const wd = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(d).replace('.', '');
  return { weekday: wd.charAt(0).toUpperCase() + wd.slice(1), date: d.getUTCDate() };
}

/** « Mardi 3 novembre » dans le fuseau du restaurant. */
export function todayLabel(timeZone: string, locale: string, now: Date = new Date()): string {
  const s = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone }).format(now);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function compactNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
