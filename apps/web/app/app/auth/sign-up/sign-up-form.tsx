'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CircleAlert, Mail } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { PasswordInput } from '@restio/ui/components/password-input';
import { TextInput } from '@restio/ui/components/text-input';
import { Toast } from '@/components/toast';
import { signUpAction } from '@/lib/auth/actions';
import { GoogleSignIn, OrDivider } from '../_components/google-sign-in';
import { useAuthForm } from '../_components/use-auth-form';

const legalLink = 'text-ink underline underline-offset-2';

export function SignUpForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { state, pending, formProps } = useAuthForm(signUpAction);
  const termsError = state?.fieldErrors?.terms;
  const legal = (href: string, chunks: React.ReactNode) => (
    <Link href={href} target="_blank" rel="noopener" className={legalLink}>
      {chunks}
      <span className="sr-only"> {tc('newTab')}</span>
    </Link>
  );
  return (
    <div className="grid gap-5">
      <form {...formProps} className="grid gap-4">
        {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
        <Field id="email" label={t('fields.email')} error={state?.fieldErrors?.email}>
          <TextInput icon={Mail} iconClassName="max-lg:hidden" className="max-lg:pl-3.5" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder={t('fields.emailPlaceholder')} required />
        </Field>
        <Field id="password" label={t('fields.password')} hint={t('fields.passwordHint')} error={state?.fieldErrors?.password}>
          <PasswordInput name="password" autoComplete="new-password" minLength={10} placeholder={t('fields.passwordMin')} showLabel={tc('showPassword')} hideLabel={tc('hidePassword')} required />
        </Field>
        <div className="grid gap-1.5">
          {/* Consentement obligatoire : vérifié aussi côté serveur (signUpAction). */}
          <label htmlFor="terms" className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-ink">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              aria-invalid={termsError ? true : undefined}
              aria-describedby={termsError ? 'terms-error' : undefined}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-ink aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-status-danger"
            />
            <span>{t.rich('fields.terms', { terms: (c) => legal('/legal/conditions', c), privacy: (c) => legal('/legal/confidentialite', c) })}</span>
          </label>
          {termsError && (
            <p id="terms-error" className="flex items-start gap-1.5 text-sm font-medium text-status-danger">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
              {termsError}
            </p>
          )}
        </div>
        <Button type="submit" variant="primary" block loading={pending} loadingText={t('signUp.loading')}>
          {t('signUp.submit')}
        </Button>
      </form>
      <OrDivider />
      <GoogleSignIn />
      <p className="text-center text-sm text-text-2">{t('google.consent')}</p>
    </div>
  );
}
