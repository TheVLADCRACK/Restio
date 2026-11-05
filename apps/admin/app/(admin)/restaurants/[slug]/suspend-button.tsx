'use client';

import { useState, useTransition } from 'react';
import { CirclePause, CirclePlay } from 'lucide-react';
import { Alert } from '@restio/ui/components/alert';
import { Button } from '@restio/ui/components/button';
import { setRestaurantSuspendedAction } from '@/lib/admin/actions';

export function SuspendButton({ id, suspended, block }: { id: string; suspended: boolean; block?: boolean }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Icon = suspended ? CirclePlay : CirclePause;
  function act() {
    // La suspension retire un menu public : deuxième appui requis ; la réactivation est immédiate.
    if (!suspended && !confirming) {
      setConfirming(true);
      return;
    }
    start(async () => {
      const result = await setRestaurantSuspendedAction(id, !suspended);
      setConfirming(false);
      if (result.error) setError(result.error);
    });
  }
  return (
    <>
      {error && <Alert tone="error">{error}</Alert>}
      <Button variant="ghost" block={block} loading={pending} className={suspended ? undefined : 'text-status-danger hover:bg-status-danger-bg'} onClick={act}>
        {!pending && <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />}
        {suspended ? 'Réactiver' : confirming ? 'Confirmer la suspension' : block ? 'Suspendre le restaurant' : 'Suspendre'}
      </Button>
    </>
  );
}
