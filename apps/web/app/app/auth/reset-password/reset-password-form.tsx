'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { OtpInput } from '@restio/ui/components/otp-input';
import { PasswordInput } from '@restio/ui/components/password-input';
import { Toast } from '@/components/toast';
import { resetPasswordAction } from '@/lib/auth/actions';
import { useAuthForm } from '../_components/use-auth-form';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { state, pending, formProps } = useAuthForm(resetPasswordAction);
  return (
    <form {...formProps} className="grid gap-4">
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      <Field id="code" label={t('fields.code')} error={state?.fieldErrors?.code}>
        <OtpInput name="code" label={t('fields.code')} digitLabel={(index) => t('fields.digit', { index })} />
      </Field>
      <Field id="password" label={t('fields.newPassword')} hint={t('fields.passwordHint')} error={state?.fieldErrors?.password}>
        <PasswordInput name="password" autoComplete="new-password" minLength={10} placeholder={t('fields.passwordMin')} showLabel={tc('showPassword')} hideLabel={tc('hidePassword')} required />
      </Field>
      <Button type="submit" variant="primary" block loading={pending} loadingText={t('reset.loading')} className="mt-2">
        {t('reset.submit')}
      </Button>
    </form>
  );
}
