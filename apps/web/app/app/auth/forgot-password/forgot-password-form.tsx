'use client';

import { Mail } from 'lucide-react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { requestPasswordResetAction } from '@/lib/auth/actions';
import { useAuthForm } from '../_components/use-auth-form';

export function ForgotPasswordForm() {
  const { state, pending, formProps } = useAuthForm(requestPasswordResetAction);
  return (
    <form {...formProps} className="grid gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field id="email" label="Adresse email" error={state?.fieldErrors?.email}>
        <TextInput icon={Mail} name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required />
      </Field>
      <Button type="submit" variant="primary" block loading={pending} loadingText="Envoi…" className="mt-2">
        Recevoir un code
      </Button>
    </form>
  );
}
