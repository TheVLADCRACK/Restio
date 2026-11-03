'use client';

import { useState } from 'react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { saveProfileAction } from '@/lib/onboarding/actions';
import { useAuthForm } from '../../auth/_components/use-auth-form';
import type { CountryOption } from './options';
import { PhoneInput } from './phone-input';
import { SelectInput } from './select-input';

export function ProfileForm({ countries, initialCountry }: { countries: CountryOption[]; initialCountry: string }) {
  const { state, pending, formProps } = useAuthForm(saveProfileAction);
  const [country, setCountry] = useState(initialCountry);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameNumber, setSameNumber] = useState(false);
  const dial = countries.find((c) => c.code === country)?.dial;
  const errors = state?.fieldErrors;

  return (
    <form {...formProps} className="grid gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field id="firstName" label="Prénom" error={errors?.firstName}>
        <TextInput name="firstName" autoComplete="given-name" autoCapitalize="words" maxLength={80} required />
      </Field>
      <Field id="lastName" label="Nom" error={errors?.lastName}>
        <TextInput name="lastName" autoComplete="family-name" autoCapitalize="words" maxLength={80} required />
      </Field>
      <Field id="phoneCountry" label="Pays de votre numéro" error={errors?.phoneCountry}>
        <SelectInput name="phoneCountry" autoComplete="tel-country-code" value={country} onChange={(e) => setCountry(e.target.value)} required>
          <option value="" disabled>
            Choisissez un pays
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} (+{c.dial})
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field id="phone" label="Numéro de téléphone" error={errors?.phone}>
        <PhoneInput name="phone" dialCode={dial} autoComplete="tel-national" maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </Field>
      <label className="-my-1 flex min-h-11 cursor-pointer items-center gap-3 text-base text-ink">
        <input type="checkbox" checked={sameNumber} onChange={(e) => setSameNumber(e.target.checked)} className="size-5 shrink-0 cursor-pointer accent-ink" />
        Même numéro que le téléphone
      </label>
      <Field
        id="whatsapp"
        label="Numéro WhatsApp"
        hint={sameNumber ? 'Recopié depuis le téléphone. Décochez la case pour en saisir un autre.' : undefined}
        error={errors?.whatsapp}
      >
        {/* readOnly et non disabled : un champ désactivé ne serait pas envoyé. */}
        <PhoneInput
          name="whatsapp"
          dialCode={dial}
          autoComplete="tel-national"
          maxLength={40}
          value={sameNumber ? phone : whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          readOnly={sameNumber}
          required
        />
      </Field>
      <Button type="submit" variant="primary" block loading={pending} loadingText="Enregistrement…" className="mt-2">
        Enregistrer et continuer
      </Button>
    </form>
  );
}
