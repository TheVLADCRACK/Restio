'use client';

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from 'react';
import type { AuthFormState } from '@/lib/auth/actions';

type AuthAction = (prev: AuthFormState, form: FormData) => Promise<AuthFormState>;

/**
 * Relie un formulaire à une action serveur d'authentification.
 * Avec JavaScript, l'envoi passe par une transition : React ne vide pas les champs après une erreur
 * (il le fait avec action={…} seul). Sans JavaScript, `action` garde le formulaire fonctionnel.
 */
export function useAuthForm(action: AuthAction) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Place le curseur sur le premier champ en erreur pour corriger sans chercher.
  useEffect(() => {
    if (state?.fieldErrors) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return { state, pending, formProps: { ref: formRef, action: formAction, onSubmit, noValidate: true } };
}
