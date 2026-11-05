'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, X } from 'lucide-react';

type SheetProps = { title: string; closeLabel: string; onClose: () => void; children: ReactNode; footer?: ReactNode };

/**
 * Fiche de la planche : tiroir de 520 px à droite sur ordinateur, plein écran avec retour sur mobile.
 * <dialog> natif : piège le focus, ferme avec Échap et rend le reste de la page inerte.
 */
export function Sheet({ title, closeLabel, onClose, children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-none bg-ground text-ink backdrop:bg-ink/45 md:w-[520px] md:bg-surface md:shadow-[-12px_0_32px_rgba(15,15,15,.14)]"
    >
      <div className="flex h-full flex-col">
        <header className="grid h-[52px] shrink-0 grid-cols-[48px_minmax(0,1fr)_48px] items-center px-1 md:flex md:h-auto md:gap-3 md:border-b md:border-line md:px-6 md:py-5">
          <button type="button" onClick={onClose} aria-label={closeLabel} className="grid size-12 place-items-center rounded-full hover:bg-sunken md:hidden">
            <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </button>
          <h2 className="truncate text-center text-[1.0625rem] font-bold md:text-left md:text-[1.375rem] md:tracking-[-0.01em]">{title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="ml-auto hidden size-10 place-items-center rounded-full hover:bg-sunken md:grid">
            <X aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
          </button>
        </header>
        <div className="grid flex-1 content-start gap-4 overflow-y-auto px-4 pb-6 pt-1 md:gap-[18px] md:p-6">{children}</div>
        {footer && <footer className="grid shrink-0 gap-2 border-t border-line bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:flex md:px-6 md:py-4">{footer}</footer>}
      </div>
    </dialog>
  );
}

/** Confirmation d'une action irréversible : petite fenêtre centrée. */
export function ConfirmDialog({ title, children, onCancel, actions }: { title: string; children: ReactNode; onCancel: () => void; actions: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  return (
    <dialog ref={ref} aria-label={title} onClose={onCancel} className="m-auto w-[calc(100%-32px)] max-w-sm rounded-lg bg-surface p-5 text-ink backdrop:bg-ink/45">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1.5 text-[0.9375rem] text-text-2 [overflow-wrap:anywhere]">{children}</p>
      <div className="mt-5 flex justify-end gap-2">{actions}</div>
    </dialog>
  );
}
