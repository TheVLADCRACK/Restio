'use client';

import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { PasswordInput } from '@restio/ui/components/password-input';
import { TextInput } from '@restio/ui/components/text-input';
import { Toast } from '@/components/toast';
import { signInAction } from '@/lib/auth/actions';
import { AuthLink } from '../_components/auth-link';
import { GoogleSignIn, OrDivider } from '../_components/google-sign-in';
import { useAuthForm } from '../_components/use-auth-form';

export function SignInForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { state, pending, formProps } = useAuthForm(signInAction);
  return (
    <div className="grid gap-5">
      <form {...formProps} className="grid gap-4">
        {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
        <Field id="email" label={t('fields.email')} error={state?.fieldErrors?.email}>
          <TextInput icon={Mail} name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder={t('fields.emailPlaceholder')} required />
        </Field>
        <Field id="password" label={t('fields.password')} error={state?.fieldErrors?.password}>
          <PasswordInput name="password" autoComplete="current-password" placeholder={t('fields.passwordPlaceholder')} showLabel={tc('showPassword')} hideLabel={tc('hidePassword')} required />
        </Field>
        <div className="-my-1 flex flex-wrap items-center justify-between gap-x-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.9375rem] text-ink">
            <input name="remember" type="checkbox" defaultChecked className="size-5 cursor-pointer accent-ink" />
            {t('fields.remember')}
          </label>
          <AuthLink href="/auth/forgot-password" className="text-[0.9375rem]">
            {t('signIn.forgot')}
          </AuthLink>
        </div>
        <Button type="submit" variant="primary" block loading={pending} loadingText={t('signIn.loading')}>
          {t('signIn.submit')}
        </Button>
      </form>
      <OrDivider />
      <GoogleSignIn />
    </div>
  );
}
