'use client';

import { useActionState } from 'react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { requestAdminCodeAction } from '@/lib/auth/actions';

export function RequestCodeForm() {
  const [state, action, pending] = useActionState(requestAdminCodeAction, null);
  return (
    <form action={action} className="grid gap-4" noValidate>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field id="email" label="Adresse email">
        <TextInput name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
      </Field>
      <Button type="submit" variant="dark" block loading={pending} loadingText="Envoi…">
        Recevoir un code
      </Button>
    </form>
  );
}
