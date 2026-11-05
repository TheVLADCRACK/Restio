'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BadgeCheck, Trash2 } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { ConfirmDialog } from '@/components/sheet';
import { Toast } from '@/components/toast';
import { requestAccountDeletionAction, saveProfileSettingsAction } from '@/lib/settings/actions';
import { SelectInput } from '../../../onboarding/_components/select-input';
import { formCard, SaveBar, Section } from '../_components/settings-form';
import { useSettingsForm } from '../_components/use-settings-form';

type Props = { firstName: string; lastName: string; email: string; phone: string; phoneCountry: string; countries: { code: string; name: string; dial: string }[] };

export function ProfileSettingsForm({ firstName, lastName, email, phone, phoneCountry, countries }: Props) {
  const t = useTranslations('settingsPages');
  const router = useRouter();
  const { state, pending, saved, formProps } = useSettingsForm(saveProfileSettingsAction);
  const [confirming, setConfirming] = useState(false);
  const [requested, setRequested] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const errors = state?.fieldErrors;

  function requestDeletion() {
    startDelete(async () => {
      const result = await requestAccountDeletionAction();
      setConfirming(false);
      if (result.error) setDeleteError(result.error);
      else setRequested(true);
    });
  }

  return (
    <form {...formProps} className={formCard}>
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      {deleteError && <Toast tone="error">{deleteError}</Toast>}
      {requested && <Toast tone="success">{t('profile.requested')}</Toast>}
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
      <Section title={t('profile.delete')}>
        <p className="text-[0.9375rem] text-text-2">{t('profile.deleteText')}</p>
        <div>
          <Button variant="ghost" className="px-3 text-status-danger hover:bg-status-danger-bg" onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t('profile.deleteButton')}
          </Button>
        </div>
      </Section>
      <SaveBar label={t('save')} loadingLabel={t('saving')} pending={pending} cancelLabel={t('cancel')} onCancel={() => router.push('/reglages')} />
      {confirming && (
        <ConfirmDialog
          title={t('profile.confirmTitle')}
          onCancel={() => setConfirming(false)}
          actions={
            <>
              <Button size="sm" onClick={() => setConfirming(false)}>{t('profile.keep')}</Button>
              <Button size="sm" variant="danger" loading={deleting} onClick={requestDeletion}>{t('profile.confirm')}</Button>
            </>
          }
        >
          {t('profile.confirmText')}
        </ConfirmDialog>
      )}
    </form>
  );
}
