import { Minus, Plus } from 'lucide-react';

/** Commande de quantité de la planche (« .qc ») : cible de 44 px, pastille de 34 px. */
export function QtyControl({ quantity, min = 0, addLabel, removeLabel, onChange, size = 'md' }: { quantity: number; min?: number; addLabel: string; removeLabel: string; onChange: (quantity: number) => void; size?: 'md' | 'sm' }) {
  const box = size === 'sm' ? 'size-10' : 'size-11';
  const dot = size === 'sm' ? 'size-[30px]' : 'size-[34px]';
  return (
    <div className="flex items-center gap-0.5">
      {quantity > 0 && (
        <>
          <button type="button" aria-label={removeLabel} disabled={quantity <= min} onClick={() => onChange(quantity - 1)} className={`grid ${box} cursor-pointer place-items-center rounded-full disabled:cursor-not-allowed disabled:opacity-40`}>
            <span className={`grid ${dot} place-items-center rounded-full border border-line-strong bg-surface`}>
              <Minus aria-hidden="true" className="size-4" strokeWidth={2.25} />
            </span>
          </button>
          <output aria-live="polite" className="min-w-[22px] text-center font-bold tabular">
            {quantity}
          </output>
        </>
      )}
      <button type="button" aria-label={addLabel} onClick={() => onChange(quantity + 1)} className={`grid ${box} cursor-pointer place-items-center rounded-full`}>
        <span className={`grid ${dot} place-items-center rounded-full border border-ink bg-ink text-surface`}>
          <Plus aria-hidden="true" className="size-4" strokeWidth={2.25} />
        </span>
      </button>
    </div>
  );
}
