'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Field } from '@restio/ui/components/field';
import { PasswordInput } from '@restio/ui/components/password-input';
import { Toast } from '@/components/toast';
import { changePasswordAction } from '@/lib/settings/actions';
import { formCard, SaveBar, Section } from '../_components/settings-form';
import { useSettingsForm } from '../_components/use-settings-form';

export function PasswordForm() {
  const t = useTranslations('settingsPages');
  const tc = useTranslations('common');
  const router = useRouter();
  const { state, pending, saved, formProps } = useSettingsForm(changePasswordAction);
  const errors = state?.fieldErrors;
  const labels = { showLabel: tc('showPassword'), hideLabel: tc('hidePassword') };
  return (
    <form key={saved} {...formProps} className={formCard}>
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      {saved > 0 && !pending && <Toast tone="success">{t('password.saved')}</Toast>}
      <Section title={t('password.section')}>
        <Field id="current" label={t('password.current')} error={errors?.current}>
          <PasswordInput name="current" autoComplete="current-password" required {...labels} />
        </Field>
        <Field id="next" label={t('password.next')} hint={t('password.hint')} error={errors?.next}>
          <PasswordInput name="next" autoComplete="new-password" minLength={10} placeholder={t('password.placeholder')} required {...labels} />
        </Field>
        <Field id="confirm" label={t('password.confirm')} error={errors?.confirm}>
          <PasswordInput name="confirm" autoComplete="new-password" minLength={10} required {...labels} />
        </Field>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.9375rem]">
          <input type="checkbox" name="revoke" defaultChecked className="size-5 accent-ink" />
          {t('password.revoke')}
        </label>
      </Section>
      <SaveBar
        label={t('password.save')}
        loadingLabel={t('saving')}
        pending={pending}
        cancelLabel={t('cancel')}
        onCancel={() => router.push('/reglages')}
        left={<Link href="/auth/forgot-password" className="font-bold text-ink underline decoration-line-strong underline-offset-4">{t('password.forgot')}</Link>}
      />
    </form>
  );
}
