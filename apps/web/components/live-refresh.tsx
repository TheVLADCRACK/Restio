'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Suivi en direct par rafraîchissement léger, suspendu quand l'onglet est caché pour économiser les données. */
export function LiveRefresh({ intervalMs = 10_000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs]);
  return null;
}
