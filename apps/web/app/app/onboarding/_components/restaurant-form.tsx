'use client';

import { useState, useSyncExternalStore } from 'react';
// Sous-chemins légers : le paquet complet (zod, libphonenumber) ne doit pas partir dans le JS du navigateur.
import { defaultTimeZoneFor, isValidTimeZone } from '@restio/core/locale-defaults';
import { slugify } from '@restio/core/slug';
import { useTranslations } from 'next-intl';
import { Toast } from '@/components/toast';
import Link from 'next/link';
import { Button, buttonClass } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { createRestaurantAction } from '@/lib/onboarding/actions';
import { useAuthForm } from '../../auth/_components/use-auth-form';
import type { CountryOption, CurrencyOption } from './options';
import { PhoneInput } from './phone-input';
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
  const t = useTranslations('onboarding.restaurant');
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
  const slug = slugify(name) || t('slugPlaceholder');

  function onCountryChange(code: string) {
    setCountry(code);
    const suggested = countries.find((c) => c.code === code)?.currency;
    if (!currencyChosen && suggested) setCurrency(suggested);
  }

  return (
    <form {...formProps} className="grid gap-[18px]">
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      {errors?.timezone && !pending && <Toast tone="error">{t('timezoneError')}</Toast>}
      <div className="grid items-start gap-3.5 md:grid-cols-2">
        <Field id="name" label={t('name')} hint={t('nameHint', { slug })} error={errors?.name} className="[overflow-wrap:anywhere] md:col-span-2">
          <TextInput name="name" autoComplete="organization" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field id="countryCode" label={t('country')} error={errors?.countryCode}>
          <SelectInput name="countryCode" autoComplete="country" value={country} onChange={(e) => onCountryChange(e.target.value)} required>
            <option value="" disabled>
              {t('chooseCountry')}
            </option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field id="city" label={t('city')} error={errors?.city}>
          <TextInput name="city" autoComplete="address-level2" autoCapitalize="words" maxLength={80} required />
        </Field>
        <Field id="whatsapp" label={t('whatsapp')} error={errors?.whatsapp} className="md:col-span-2">
          <PhoneInput name="whatsapp" dialCode={countries.find((c) => c.code === country)?.dial} autoComplete="tel-national" maxLength={40} />
        </Field>
        <Field id="currency" label={t('currency')} hint={t('currencyHint')} error={errors?.currency}>
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
              {t('chooseCurrency')}
            </option>
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field id="openedOn" label={t('openedOn')} hint={t('openedOnHint')} error={errors?.openedOn}>
          <TextInput name="openedOn" type="date" max={today} />
        </Field>
      </div>
      <input type="hidden" name="timezone" value={timezone} />
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <Link href="/onboarding?etape=profil" className={buttonClass()}>
          {t('back')}
        </Link>
        <Button type="submit" variant="primary" loading={pending} loadingText={t('loading')}>
          {t('submit')}
        </Button>
      </div>
    </form>
  );
}
