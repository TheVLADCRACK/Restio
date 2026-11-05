'use client';

import { useActionState, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { OtpInput } from '@/components/otp-input';
import { Toast } from '@/components/toast';
import { resendCodeAction, verifyEmailAction } from '@/lib/auth/actions';
import { useAuthForm } from '../_components/use-auth-form';

const RESEND_DELAY = 60;

export function VerifyEmailForm() {
  const t = useTranslations('auth');
  const { state, pending, formProps } = useAuthForm(verifyEmailAction);
  const [resend, resendAction, resending] = useActionState(resendCodeAction, null);
  const [wait, setWait] = useState(RESEND_DELAY);
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);
  return (
    <div className="grid gap-4">
      <form {...formProps} className="grid gap-[18px]">
        {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
        <Field id="code" label={t('fields.codeFromEmail')} error={state?.fieldErrors?.code}>
          <OtpInput name="code" label={t('fields.code')} digitLabel={(index) => t('fields.digit', { index })} />
        </Field>
        <Button type="submit" variant="primary" block loading={pending} loadingText={t('verify.loading')}>
          {t('verify.submit')}
        </Button>
      </form>
      <form action={resendAction} onSubmit={() => setWait(RESEND_DELAY)}>
        {resend?.info && !resending && <Toast tone="info">{resend.info}</Toast>}
        {resend?.error && !resending && <Toast tone="error">{resend.error}</Toast>}
        <p className="text-center text-sm text-text-2">
          {t('verify.nothing')}{' '}
          {wait > 0 ? (
            <>
              <b className="text-ink">{t('verify.resendLower')}</b> {t('verify.in')} <span className="tabular">0:{String(wait).padStart(2, '0')}</span>.
            </>
          ) : (
            <button type="submit" disabled={resending} className="cursor-pointer font-bold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              {t('verify.resendLower')}
            </button>
          )}
        </p>
      </form>
    </div>
  );
}
