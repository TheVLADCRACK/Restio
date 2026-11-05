'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Check, Info, X } from 'lucide-react';
import { cn } from '@restio/ui/cn';

// Planche, composant « .toast » : fond encre, pastille de statut ronde.
const tones = {
  error: { dot: 'bg-status-danger text-surface', Icon: X, role: 'alert' },
  info: { dot: 'bg-lime text-ink', Icon: Info, role: 'status' },
  success: { dot: 'bg-lime text-ink', Icon: Check, role: 'status' },
} as const;

const LIFETIME_MS = 6000;

export type AlertProps = { tone: keyof typeof tones; className?: string; children: ReactNode; closeLabel?: string };

/**
 * Message temporaire (toast) : en haut au centre sur mobile, en haut à droite à partir de 640 px,
 * fermeture par la croix ou automatiquement. Le survol ou le focus suspend la fermeture.
 * Il réapparaît à chaque montage : l'appelant le démonte pendant l'envoi pour qu'une erreur répétée se revoie.
 */
export function Alert({ tone, className, children, closeLabel = 'Fermer le message' }: AlertProps) {
  const { dot, Icon, role } = tones[tone];
  const [open, setOpen] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!open || paused) return;
    const timer = setTimeout(() => setOpen(false), LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [open, paused]);

  if (!open) return null;
  return (
    <div
      role={role}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        'toast-in fixed inset-x-4 top-[max(16px,env(safe-area-inset-top))] z-50 mx-auto max-w-96 overflow-hidden rounded-md bg-ink text-surface shadow-[var(--shadow-floating)] sm:left-auto sm:right-6 sm:top-6 sm:mx-0 sm:w-96',
        className,
      )}
    >
      <div className="flex items-center gap-3 py-3 pl-4 pr-2 text-[0.9375rem]">
        <span aria-hidden="true" className={cn('grid size-7 shrink-0 place-items-center rounded-full', dot)}>
          <Icon className="size-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">{children}</div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={closeLabel}
          className="grid size-9 shrink-0 place-items-center rounded-full text-surface transition-colors hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-lime"
        >
          <X aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
      </div>
      <div
        aria-hidden="true"
        className="toast-life h-0.5 origin-left bg-surface/40"
        style={{ animationDuration: `${LIFETIME_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
      />
    </div>
  );
}
