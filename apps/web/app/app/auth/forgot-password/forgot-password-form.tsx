'use client';

import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { Toast } from '@/components/toast';
import { requestPasswordResetAction } from '@/lib/auth/actions';
import { useAuthForm } from '../_components/use-auth-form';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const { state, pending, formProps } = useAuthForm(requestPasswordResetAction);
  return (
    <form {...formProps} className="grid gap-4">
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      <Field id="email" label={t('fields.email')} error={state?.fieldErrors?.email}>
        <TextInput icon={Mail} name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder={t('fields.emailPlaceholder')} required />
      </Field>
      <Button type="submit" variant="primary" block loading={pending} loadingText={t('forgot.loading')} className="mt-2">
        {t('forgot.submit')}
      </Button>
    </form>
  );
}
