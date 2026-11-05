'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { Toast } from '@/components/toast';
import { saveRestaurantInfoAction } from '@/lib/settings/actions';
import { SelectInput } from '../../../onboarding/_components/select-input';
import { formCard, SaveBar, Section, ToggleRow } from '../_components/settings-form';
import { useSettingsForm } from '../_components/use-settings-form';

type Settings = { name: string; cuisine: string; city: string; description: string; countryCode: string; publicWhatsapp: string; currency: string; timezone: string; ordersEnabled: boolean };
type Option = { code: string; name: string };

export function InfoForm({ settings, countries, currencies, timezones }: { settings: Settings; countries: Option[]; currencies: Option[]; timezones: string[] }) {
  const t = useTranslations('settingsPages');
  const router = useRouter();
  const [description, setDescription] = useState(settings.description);
  const [ordersEnabled, setOrdersEnabled] = useState(settings.ordersEnabled);
  const { state, pending, saved, formProps } = useSettingsForm(saveRestaurantInfoAction);
  const errors = state?.fieldErrors;
  return (
    <form {...formProps} className={formCard}>
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      {saved > 0 && !pending && <Toast key={saved} tone="success">{t('saved')}</Toast>}
      <Section title={t('info.restaurant')}>
        <div className="grid items-start gap-4 md:grid-cols-2">
          <Field id="name" label={t('info.name')} error={errors?.name} className="md:col-span-2">
            <TextInput name="name" defaultValue={settings.name} maxLength={80} required />
          </Field>
          <Field id="cuisine" label={t('info.cuisine')} error={errors?.cuisine}>
            <TextInput name="cuisine" defaultValue={settings.cuisine} maxLength={40} />
          </Field>
          <Field id="city" label={t('info.city')} error={errors?.city}>
            <TextInput name="city" defaultValue={settings.city} autoComplete="address-level2" maxLength={80} required />
          </Field>
          <div className="grid gap-1 md:col-span-2">
            <Field id="description" label={t('info.description')} error={errors?.description}>
              <textarea name="description" rows={3} maxLength={160} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full min-w-0 resize-none rounded-md border border-line-strong bg-surface px-3.5 py-3 text-base text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none" />
            </Field>
            <p aria-live="polite" className="text-right text-[0.8125rem] text-text-3 tabular">{description.length} / 160</p>
          </div>
        </div>
      </Section>
      <Section title={t('info.contact')}>
        <div className="grid items-start gap-4 md:grid-cols-2">
          <Field id="countryCode" label={t('info.country')} error={errors?.countryCode}>
            <SelectInput name="countryCode" defaultValue={settings.countryCode}>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </SelectInput>
          </Field>
          <Field id="whatsapp" label={t('info.whatsapp')} error={errors?.whatsapp}>
            <TextInput name="whatsapp" type="tel" inputMode="tel" defaultValue={settings.publicWhatsapp} maxLength={40} />
          </Field>
          <Field id="currency" label={t('info.currency')} error={errors?.currency}>
            <SelectInput name="currency" defaultValue={settings.currency}>
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
            </SelectInput>
          </Field>
          <Field id="timezone" label={t('info.timezone')} hint={t('info.timezoneHint')} error={errors?.timezone}>
            <SelectInput name="timezone" defaultValue={settings.timezone}>
              {timezones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </SelectInput>
          </Field>
        </div>
      </Section>
      <Section title={t('info.orders')}>
        <ToggleRow title={t('info.ordersEnabled')} hint={t('info.ordersEnabledHint')} name="ordersEnabled" checked={ordersEnabled} onChange={setOrdersEnabled} />
      </Section>
      <SaveBar label={t('save')} loadingLabel={t('saving')} pending={pending} cancelLabel={t('cancel')} onCancel={() => router.push('/reglages')} />
    </form>
  );
}
