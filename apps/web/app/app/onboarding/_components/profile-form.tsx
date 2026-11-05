'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { Toast } from '@/components/toast';
import { saveProfileAction } from '@/lib/onboarding/actions';
import { useAuthForm } from '../../auth/_components/use-auth-form';
import type { CountryOption } from './options';
import { PhoneInput } from './phone-input';
import { SelectInput } from './select-input';

type Initial = { firstName: string; lastName: string; phone: string };

export function ProfileForm({ countries, initialCountry, initial }: { countries: CountryOption[]; initialCountry: string; initial?: Initial }) {
  const t = useTranslations('onboarding.profile');
  const { state, pending, formProps } = useAuthForm(saveProfileAction);
  const [country, setCountry] = useState(initialCountry);
  const dial = countries.find((c) => c.code === country)?.dial;
  const errors = state?.fieldErrors;

  return (
    <form {...formProps} className="grid gap-[18px]">
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      <div className="grid gap-3.5 md:grid-cols-2">
        <Field id="firstName" label={t('firstName')} error={errors?.firstName}>
          <TextInput name="firstName" defaultValue={initial?.firstName} autoComplete="given-name" autoCapitalize="words" maxLength={80} required />
        </Field>
        <Field id="lastName" label={t('lastName')} error={errors?.lastName}>
          <TextInput name="lastName" defaultValue={initial?.lastName} autoComplete="family-name" autoCapitalize="words" maxLength={80} required />
        </Field>
        <Field id="phoneCountry" label={t('phoneCountry')} error={errors?.phoneCountry} className="md:col-span-2">
          <SelectInput name="phoneCountry" autoComplete="tel-country-code" value={country} onChange={(event) => setCountry(event.target.value)} required>
            <option value="" disabled>
              {t('chooseCountry')}
            </option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} (+{c.dial})
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field id="phone" label={t('phone')} error={errors?.phone} className="md:col-span-2">
          <PhoneInput name="phone" dialCode={dial} defaultValue={initial?.phone} autoComplete="tel-national" maxLength={40} required />
        </Field>
      </div>
      <Button type="submit" variant="primary" block loading={pending} loadingText={t('loading')}>
        {t('submit')}
      </Button>
    </form>
  );
}
