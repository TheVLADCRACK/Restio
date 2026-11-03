'use client';

import Link from 'next/link';
import { CircleAlert, Lock, Mail } from 'lucide-react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { signUpAction } from '@/lib/auth/actions';
import { GoogleSignIn, OrDivider } from '../_components/google-sign-in';
import { useAuthForm } from '../_components/use-auth-form';

const legalLink = 'font-bold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink';

export function SignUpForm() {
  const { state, pending, formProps } = useAuthForm(signUpAction);
  const termsError = state?.fieldErrors?.terms;
  return (
    <div className="grid gap-5">
      <form {...formProps} className="grid gap-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        <Field id="email" label="Adresse email" error={state?.fieldErrors?.email}>
          <TextInput icon={Mail} name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="vous@exemple.com" required />
        </Field>
        <Field id="password" label="Mot de passe" hint="10 caractères minimum" error={state?.fieldErrors?.password}>
          <TextInput icon={Lock} name="password" type="password" autoComplete="new-password" minLength={10} required />
        </Field>
        <div className="grid gap-1.5">
          {/* Consentement obligatoire : vérifié aussi côté serveur (signUpAction). */}
          <label htmlFor="terms" className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-[0.9375rem] text-ink">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              aria-invalid={termsError ? true : undefined}
              aria-describedby={termsError ? 'terms-error' : undefined}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-ink aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-status-danger"
            />
            <span>
              J’accepte les{' '}
              <Link href="/legal/conditions" target="_blank" rel="noopener" className={legalLink}>
                conditions d’utilisation<span className="sr-only"> (nouvel onglet)</span>
              </Link>{' '}
              et la{' '}
              <Link href="/legal/confidentialite" target="_blank" rel="noopener" className={legalLink}>
                politique de confidentialité<span className="sr-only"> (nouvel onglet)</span>
              </Link>
              .
            </span>
          </label>
          {termsError && (
            <p id="terms-error" className="flex items-start gap-1.5 text-sm font-medium text-status-danger">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
              {termsError}
            </p>
          )}
        </div>
        <Button type="submit" variant="primary" block loading={pending} loadingText="Création du compte…">
          Créer mon compte
        </Button>
      </form>
      <OrDivider />
      <GoogleSignIn />
      <p className="text-center text-sm text-text-2">Avec Google, vous acceptez les mêmes conditions d’utilisation et politique de confidentialité.</p>
    </div>
  );
}
