import 'server-only';
import { getCountries } from 'libphonenumber-js';
import { callingCodeFor, defaultCurrencyFor } from '@restio/core';

export type CountryOption = { code: string; name: string; dial: string; currency?: string };
export type CurrencyOption = { code: string; name: string };

// Listes calculées côté serveur : mêmes libellés au rendu et à l'hydratation, et aucun calcul Intl sur les petits téléphones.
export function countryOptions(): CountryOption[] {
  const names = new Intl.DisplayNames(['fr'], { type: 'region' });
  return getCountries()
    .map((code) => ({ code, name: names.of(code) ?? code, dial: callingCodeFor(code), currency: defaultCurrencyFor(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export function currencyOptions(): CurrencyOption[] {
  const names = new Intl.DisplayNames(['fr'], { type: 'currency' });
  return Intl.supportedValuesOf('currency')
    .map((code) => ({ code, name: capitalize(names.of(code) ?? code) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

// Intl écrit les devises en minuscules (« franc CFA (BCEAO) ») ; on aligne sur les noms de pays.
const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('fr') + s.slice(1);

/** Garde la suggestion seulement si elle figure dans la liste, sinon le select afficherait une valeur fantôme. */
export function pick(suggested: string | undefined, options: { code: string }[]): string {
  return suggested && options.some((o) => o.code === suggested) ? suggested : '';
}
