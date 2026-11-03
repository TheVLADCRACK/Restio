'use client';

import { Lock } from 'lucide-react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { resetPasswordAction } from '@/lib/auth/actions';
import { useAuthForm } from '../_components/use-auth-form';

export function ResetPasswordForm() {
  const { state, pending, formProps } = useAuthForm(resetPasswordAction);
  return (
    <form {...formProps} className="grid gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field id="code" label="Code reçu par email" error={state?.fieldErrors?.code}>
        <TextInput name="code" inputMode="numeric" autoComplete="one-time-code" className="tabular text-lg tracking-[0.3em]" required />
      </Field>
      <Field id="password" label="Nouveau mot de passe" hint="10 caractères minimum" error={state?.fieldErrors?.password}>
        <TextInput icon={Lock} name="password" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <Button type="submit" variant="primary" block loading={pending} loadingText="Enregistrement…" className="mt-2">
        Enregistrer le mot de passe
      </Button>
    </form>
  );
}
