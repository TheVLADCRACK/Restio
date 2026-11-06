'use client';

import { useActionState } from 'react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { OtpInput } from '@restio/ui/components/otp-input';
import { PasswordInput } from '@restio/ui/components/password-input';
import { setAdminPasswordAction } from '@/lib/auth/actions';

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setAdminPasswordAction, null);
  return (
    <form action={action} className="grid gap-4 md:gap-[18px]" noValidate>
      {state?.error && !pending && <Alert tone="error">{state.error}</Alert>}
      <Field id="code" label="Code reçu par e-mail">
        <OtpInput name="code" label="Code à 6 chiffres" digitLabel={(index) => `Chiffre ${index}`} />
      </Field>
      <Field id="password" label="Nouveau mot de passe" hint="14 caractères minimum.">
        <PasswordInput name="password" autoComplete="new-password" placeholder="14 caractères minimum" showLabel="Afficher le mot de passe" hideLabel="Masquer le mot de passe" required />
      </Field>
      <Button type="submit" variant="dark" block loading={pending} loadingText="Enregistrement…">
        Enregistrer le mot de passe
      </Button>
    </form>
  );
}
