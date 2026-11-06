'use client';

import { useActionState } from 'react';
import { Mail } from 'lucide-react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { PasswordInput } from '@restio/ui/components/password-input';
import { TextInput } from '@restio/ui/components/text-input';
import { adminSignInAction } from '@/lib/auth/actions';

export function AdminSignInForm() {
  const [state, action, pending] = useActionState(adminSignInAction, null);
  return (
    <form action={action} className="grid gap-4 md:gap-[18px]" noValidate>
      {state?.error && !pending && <Alert tone="error">{state.error}</Alert>}
      <Field id="email" label="Adresse e-mail">
        <TextInput icon={Mail} name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
      </Field>
      <Field id="password" label="Mot de passe">
        <PasswordInput name="password" autoComplete="current-password" showLabel="Afficher le mot de passe" hideLabel="Masquer le mot de passe" required />
      </Field>
      <Button type="submit" variant="dark" block loading={pending} loadingText="Connexion…">
        Se connecter
      </Button>
    </form>
  );
}
