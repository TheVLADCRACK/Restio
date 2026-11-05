'use client';

import { startTransition, useActionState, useRef, type FormEvent } from 'react';
import type { SettingsFormState } from '@/lib/settings/actions';

type Action = (prev: SettingsFormState, form: FormData) => Promise<SettingsFormState>;

/** Envoi sans vider les champs en cas d'erreur ; le compteur réaffiche le toast de succès à chaque enregistrement. */
export function useSettingsForm(action: Action, extra?: (data: FormData) => void) {
  const [{ state, saved }, formAction, pending] = useActionState(
    async (previous: { state: SettingsFormState; saved: number }, form: FormData) => {
      const next = await action(previous.state, form);
      return { state: next, saved: previous.saved + (next?.ok ? 1 : 0) };
    },
    { state: null, saved: 0 },
  );
  const formRef = useRef<HTMLFormElement>(null);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    extra?.(data);
    startTransition(() => formAction(data));
  }
  return { state, pending, saved, formProps: { ref: formRef, onSubmit, noValidate: true } };
}
