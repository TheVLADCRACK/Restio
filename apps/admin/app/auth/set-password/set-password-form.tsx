'use client';

import { useActionState } from 'react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { setAdminPasswordAction } from '@/lib/auth/actions';

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setAdminPasswordAction, null);
  return (
    <form action={action} className="grid gap-4" noValidate>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field id="code" label="Code reçu par email">
        <TextInput name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
      </Field>
      <Field id="password" label="Nouveau mot de passe" hint="14 caractères minimum.">
        <TextInput name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" variant="dark" block loading={pending} loadingText="Enregistrement…">
        Enregistrer le mot de passe
      </Button>
    </form>
  );
}
