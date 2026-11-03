'use client';

import { useState, useSyncExternalStore } from 'react';
// Sous-chemins légers : le paquet complet (zod, libphonenumber) ne doit pas partir dans le JS du navigateur.
import { defaultTimeZoneFor, isValidTimeZone } from '@restio/core/locale-defaults';
import { slugify } from '@restio/core/slug';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { createRestaurantAction } from '@/lib/onboarding/actions';
import { useAuthForm } from '../../auth/_components/use-auth-form';
import type { CountryOption, CurrencyOption } from './options';
import { SelectInput } from './select-input';

type Props = { countries: CountryOption[]; currencies: CurrencyOption[]; initialCountry: string; initialCurrency: string };

let cachedTimeZone: string | undefined;
function browserTimeZone(): string {
  if (cachedTimeZone === undefined) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      cachedTimeZone = tz && isValidTimeZone(tz) ? tz : 'UTC';
    } catch (error) {
      // Navigateur trop ancien pour Intl.supportedValuesOf : UTC reste accepté par le serveur.
      console.warn('Fuseau horaire du navigateur illisible, UTC utilisé.', error);
      cachedTimeZone = 'UTC';
    }
  }
  return cachedTimeZone;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const neverChanges = () => () => {};

export function RestaurantForm({ countries, currencies, initialCountry, initialCurrency }: Props) {
  const { state, pending, formProps } = useAuthForm(createRestaurantAction);
  const [name, setName] = useState('');
  const [country, setCountry] = useState(initialCountry);
  const [currency, setCurrency] = useState(initialCurrency);
  const [currencyChosen, setCurrencyChosen] = useState(false);
  // Valeurs propres au navigateur : lues après hydratation pour ne pas diverger du rendu serveur.
  const browserTz = useSyncExternalStore(neverChanges, browserTimeZone, () => 'UTC');
  // Le fuseau du pays du restaurant prime : le restaurateur peut configurer depuis l'étranger.
  const timezone = defaultTimeZoneFor(country) ?? browserTz;
  const today = useSyncExternalStore(neverChanges, localToday, () => undefined);
  const errors = state?.fieldErrors;
  const slug = slugify(name) || 'nom-du-restaurant';

  function onCountryChange(code: string) {
    setCountry(code);
    const suggested = countries.find((c) => c.code === code)?.currency;
    if (!currencyChosen && suggested) setCurrency(suggested);
  }

  return (
    <form {...formProps} className="grid gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {errors?.timezone && <Alert tone="error">Votre fuseau horaire n’a pas été reconnu. Rechargez la page puis réessayez.</Alert>}
      <Field
        id="name"
        label="Nom du restaurant"
        hint={`Adresse de votre menu : restio-app.com/@${slug}. Elle sera légèrement ajustée si elle est déjà prise.`}
        error={errors?.name}
        className="[overflow-wrap:anywhere]"
      >
        <TextInput name="name" autoComplete="organization" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field id="countryCode" label="Pays" error={errors?.countryCode}>
        <SelectInput name="countryCode" autoComplete="country" value={country} onChange={(e) => onCountryChange(e.target.value)} required>
          <option value="" disabled>
            Choisissez un pays
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field id="city" label="Ville" error={errors?.city}>
        <TextInput name="city" autoComplete="address-level2" autoCapitalize="words" maxLength={80} required />
      </Field>
      <Field id="currency" label="Devise des prix" error={errors?.currency}>
        <SelectInput
          name="currency"
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
            setCurrencyChosen(true);
          }}
          required
        >
          <option value="" disabled>
            Choisissez une devise
          </option>
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field id="openedOn" label="Date d’ouverture (facultatif)" hint="Laissez vide si vous ne savez plus." error={errors?.openedOn}>
        <TextInput name="openedOn" type="date" max={today} />
      </Field>
      <input type="hidden" name="timezone" value={timezone} />
      <Button type="submit" variant="primary" block loading={pending} loadingText="Création…" className="mt-2">
        Créer mon restaurant
      </Button>
    </form>
  );
}
