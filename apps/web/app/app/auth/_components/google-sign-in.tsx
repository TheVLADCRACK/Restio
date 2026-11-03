'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { authClient } from '@/lib/auth/client';

// Séparateur « ou » entre le formulaire et Google (planche).
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-sm text-text-2">
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      ou
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  );
}

export function GoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // Retour arrière depuis Google : la page revient du cache avec le bouton encore « en cours ».
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLoading(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  async function signIn() {
    setLoading(true);
    setFailed(false);
    try {
      const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' });
      if (!error) return; // Le navigateur part vers Google : le bouton reste bloqué.
      console.error(`[auth] google sign-in failed: ${error.code ?? error.status}`);
    } catch {
      console.error('[auth] google sign-in failed: network');
    }
    setFailed(true);
    setLoading(false);
  }

  return (
    <div className="grid gap-3">
      <Button variant="secondary" block loading={loading} loadingText="Ouverture de Google…" onClick={signIn}>
        <GoogleLogo />
        Continuer avec Google
      </Button>
      {failed && <Alert tone="error">La connexion avec Google n’a pas abouti. Réessayez dans un instant.</Alert>}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5 shrink-0">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
