import type { ReactNode } from 'react';
import { Button } from '@restio/ui/components/button';
import { Switch } from '@restio/ui/components/switch';

/** Section : carte sur mobile, bloc d'une carte unique sur ordinateur (« .fsec »). */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-3.5 rounded-lg border border-line bg-surface p-4 md:gap-4 md:rounded-none md:border-0 md:border-t md:p-6 md:first:border-t-0">
      <h2 className="text-[0.9375rem] font-bold md:text-[1.0625rem]">{title}</h2>
      {children}
    </section>
  );
}

export const formCard = 'grid gap-4 pb-24 md:block md:overflow-hidden md:rounded-lg md:border md:border-line md:bg-surface md:pb-0';

/** Barre d'enregistrement : fixée en bas sur mobile, fond clair en bas de carte sur ordinateur. */
export function SaveBar({ label, loadingLabel, pending, left, cancelLabel, onCancel }: { label: string; loadingLabel: string; pending: boolean; left?: ReactNode; cancelLabel: string; onCancel: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:static md:flex md:items-center md:justify-end md:gap-2 md:bg-ground md:px-6 md:py-4">
      {left && <span className="mr-auto hidden text-sm text-text-2 md:block">{left}</span>}
      <Button variant="ghost" className="hidden md:inline-flex" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="submit" variant="primary" className="w-full md:w-auto" loading={pending} loadingText={loadingLabel}>
        {label}
      </Button>
    </div>
  );
}

/** Ligne avec interrupteur (« .trow ») ; `name` envoie la valeur dans le formulaire. */
export function ToggleRow({ title, hint, name, checked, onChange, disabled }: { title: string; hint?: string; name?: string; checked: boolean; onChange: (on: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-4 border-t border-line py-3.5 first:border-t-0 first:pt-0 last:pb-0 [h2+&]:border-t-0 [h2+&]:pt-0">
      <div className="min-w-0 flex-1">
        <b className="block text-base font-medium">{title}</b>
        {hint && <span className="block text-sm text-text-2">{hint}</span>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} disabled={disabled} className={disabled ? 'cursor-not-allowed opacity-50' : undefined} />
      {name && checked && <input type="hidden" name={name} value="on" />}
    </div>
  );
}
