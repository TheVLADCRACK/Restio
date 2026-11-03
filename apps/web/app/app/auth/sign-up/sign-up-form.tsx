'use client';

import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { signUpAction } from '@/lib/auth/actions';
import { GoogleSignIn } from '../_components/google-sign-in';
import { useAuthForm } from '../_components/use-auth-form';

export function SignUpForm() {
  const { state, pending, formProps } = useAuthForm(signUpAction);
  return (
    <div className="grid gap-6">
      <GoogleSignIn />
      <form {...formProps} className="grid gap-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        <Field id="email" label="Adresse email" error={state?.fieldErrors?.email}>
          <TextInput name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required />
        </Field>
        <Field id="password" label="Mot de passe" hint="10 caractères minimum" error={state?.fieldErrors?.password}>
          <TextInput name="password" type="password" autoComplete="new-password" minLength={10} required />
        </Field>
        <Button type="submit" variant="primary" block loading={pending} loadingText="Création du compte…" className="mt-2">
          Créer mon compte
        </Button>
      </form>
    </div>
  );
}
