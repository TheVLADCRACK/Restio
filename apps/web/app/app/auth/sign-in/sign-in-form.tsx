'use client';

import { Lock, Mail } from 'lucide-react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { signInAction } from '@/lib/auth/actions';
import { AuthLink } from '../_components/auth-link';
import { GoogleSignIn, OrDivider } from '../_components/google-sign-in';
import { useAuthForm } from '../_components/use-auth-form';

export function SignInForm() {
  const { state, pending, formProps } = useAuthForm(signInAction);
  return (
    <div className="grid gap-5">
      <form {...formProps} className="grid gap-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        <Field id="email" label="Adresse email" error={state?.fieldErrors?.email}>
          <TextInput icon={Mail} name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="vous@exemple.com" required />
        </Field>
        <div className="grid">
          <Field id="password" label="Mot de passe" error={state?.fieldErrors?.password}>
            <TextInput icon={Lock} name="password" type="password" autoComplete="current-password" required />
          </Field>
          <AuthLink href="/auth/forgot-password" className="justify-self-end text-[0.9375rem]">
            Mot de passe oublié ?
          </AuthLink>
        </div>
        <Button type="submit" variant="primary" block loading={pending} loadingText="Connexion…">
          Se connecter
        </Button>
      </form>
      <OrDivider />
      <GoogleSignIn />
    </div>
  );
}
