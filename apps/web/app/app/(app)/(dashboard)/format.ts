import { formatMoney, fromCents, toCents } from '@restio/core';

const LOCALE = 'fr-FR';

/** Montant formaté et découpé pour l'affichage en grand : la devise en plus petit (planche). */
export function moneyParts(amount: string, currency: string): { full: string; value: string; unit: string } {
  const full = formatMoney(amount, currency, LOCALE);
  const parts = new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).formatToParts(Number(amount));
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

/** Âge lisible depuis une date : « à l'instant », « 6 min », « 1 h 05 ». */
export function minutesSince(date: Date | string, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(date).getTime()) / 60_000));
}
export function ageLabel(minutes: number): string {
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
}

/** Plafond « rond » de l'axe des ventes (1, 2, 2,5, 5 × 10ⁿ). */
export function niceMax(value: number): number {
  if (!(value > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => value / p <= s) ?? 10;
  return step * p;
}

/** « Mer 28 » à partir d'un jour « AAAA-MM-JJ » (déjà exprimé dans le fuseau du restaurant). */
export function dayLabel(day: string): { weekday: string; date: number } {
  const d = new Date(`${day}T12:00:00Z`);
  const wd = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', timeZone: 'UTC' }).format(d).replace('.', '');
  return { weekday: wd.charAt(0).toUpperCase() + wd.slice(1), date: d.getUTCDate() };
}

/** « Mardi 3 novembre » dans le fuseau du restaurant. */
export function todayLabel(timeZone: string, now: Date = new Date()): string {
  const s = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', timeZone }).format(now);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** « 7 » devient « Table 7 » ; un libellé libre (« Terrasse 3 ») reste tel quel. */
export function tableLabel(label: string): string {
  return /^\d+$/.test(label) ? `Table ${label}` : label;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n > 1 ? many : one}`;
}
