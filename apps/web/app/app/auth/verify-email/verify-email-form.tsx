'use client';

import { useActionState } from 'react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { resendCodeAction, verifyEmailAction } from '@/lib/auth/actions';
import { useAuthForm } from '../_components/use-auth-form';

export function VerifyEmailForm() {
  const { state, pending, formProps } = useAuthForm(verifyEmailAction);
  const [resend, resendAction, resending] = useActionState(resendCodeAction, null);
  return (
    <div className="grid gap-4">
      <form {...formProps} className="grid gap-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        <Field id="code" label="Code à 6 chiffres" error={state?.fieldErrors?.code}>
          <TextInput name="code" inputMode="numeric" autoComplete="one-time-code" className="tabular text-lg tracking-[0.3em]" required />
        </Field>
        <Button type="submit" variant="primary" block loading={pending} loadingText="Vérification…" className="mt-2">
          Valider le code
        </Button>
      </form>
      <form action={resendAction} className="grid gap-4">
        <Button type="submit" variant="secondary" block loading={resending} loadingText="Envoi…">
          Renvoyer le code
        </Button>
        {resend?.info && <Alert tone="info">{resend.info}</Alert>}
        {resend?.error && <Alert tone="error">{resend.error}</Alert>}
      </form>
    </div>
  );
}
