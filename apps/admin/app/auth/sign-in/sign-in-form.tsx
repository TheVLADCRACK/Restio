'use client';

import { useActionState } from 'react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { adminSignInAction } from '@/lib/auth/actions';

export function AdminSignInForm() {
  const [state, action, pending] = useActionState(adminSignInAction, null);
  return (
    <form action={action} className="grid gap-4" noValidate>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field id="email" label="Adresse email">
        <TextInput name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
      </Field>
      <Field id="password" label="Mot de passe">
        <TextInput name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" variant="dark" block loading={pending} loadingText="Connexion…">
        Se connecter
      </Button>
    </form>
  );
}
