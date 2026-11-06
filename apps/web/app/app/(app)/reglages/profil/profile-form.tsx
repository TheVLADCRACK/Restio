'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BadgeCheck } from 'lucide-react';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { Toast } from '@/components/toast';
import { saveProfileSettingsAction } from '@/lib/settings/actions';
import { SelectInput } from '../../../onboarding/_components/select-input';
import { formCard, SaveBar, Section } from '../_components/settings-form';
import { useSettingsForm } from '../_components/use-settings-form';

type Props = { firstName: string; lastName: string; email: string; phone: string; phoneCountry: string; countries: { code: string; name: string; dial: string }[] };

export function ProfileSettingsForm({ firstName, lastName, email, phone, phoneCountry, countries }: Props) {
  const t = useTranslations('settingsPages');
  const router = useRouter();
  const { state, pending, saved, formProps } = useSettingsForm(saveProfileSettingsAction);
  const errors = state?.fieldErrors;

  return (
    <form {...formProps} className={formCard}>
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      {saved > 0 && !pending && <Toast key={saved} tone="success">{t('saved')}</Toast>}
      <Section title={t('profile.you')}>
        <div className="grid items-start gap-4 md:grid-cols-2">
          <Field id="firstName" label={t('profile.firstName')} error={errors?.firstName}>
            <TextInput name="firstName" defaultValue={firstName} autoComplete="given-name" maxLength={80} required />
          </Field>
          <Field id="lastName" label={t('profile.lastName')} error={errors?.lastName}>
            <TextInput name="lastName" defaultValue={lastName} autoComplete="family-name" maxLength={80} required />
          </Field>
          <div className="grid gap-2 md:col-span-2">
            <Field id="email" label={t('profile.email')}>
              <TextInput value={email} disabled readOnly />
            </Field>
            <span className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-status-ok">
              <BadgeCheck aria-hidden="true" className="size-4" strokeWidth={1.75} />
              {t('profile.verified')}
            </span>
          </div>
          <Field id="phoneCountry" label={t('profile.phoneCountry')}>
            <SelectInput name="phoneCountry" defaultValue={phoneCountry}>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.name} (+{c.dial})</option>)}
            </SelectInput>
          </Field>
          <Field id="phone" label={t('profile.phone')} error={errors?.phone}>
            <TextInput name="phone" type="tel" inputMode="tel" autoComplete="tel-national" defaultValue={phone} maxLength={40} required />
          </Field>
        </div>
      </Section>
      <SaveBar label={t('save')} loadingLabel={t('saving')} pending={pending} cancelLabel={t('cancel')} onCancel={() => router.push('/reglages')} />
    </form>
  );
}
