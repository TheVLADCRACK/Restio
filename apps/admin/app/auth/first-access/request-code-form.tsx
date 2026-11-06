'use client';

import { useActionState } from 'react';
import { Mail } from 'lucide-react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { TextInput } from '@restio/ui/components/text-input';
import { requestAdminCodeAction } from '@/lib/auth/actions';

export function RequestCodeForm() {
  const [state, action, pending] = useActionState(requestAdminCodeAction, null);
  return (
    <form action={action} className="grid gap-4 md:gap-[18px]" noValidate>
      {state?.error && !pending && <Alert tone="error">{state.error}</Alert>}
      <Field id="email" label="Adresse e-mail" hint="Seules les adresses de l’équipe Restio reçoivent un code.">
        <TextInput icon={Mail} name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
      </Field>
      <Button type="submit" variant="dark" block loading={pending} loadingText="Envoi…">
        Recevoir un code
      </Button>
    </form>
  );
}
