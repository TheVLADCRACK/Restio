import { cloneElement, isValidElement, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@restio/ui/cn';

type ControlProps = { id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string };

export type FieldProps = {
  /** Identifiant du contrôle : relie le libellé, l'aide et l'erreur. */
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  /** Un seul contrôle (ex. <TextInput />) : il reçoit id, aria-invalid et aria-describedby. */
  children: ReactNode;
};

export function Field({ id, label, hint, error, className, children }: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  const control = isValidElement<ControlProps>(children)
    ? cloneElement(children, { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })
    : children;

  return (
    <div className={cn('grid min-w-0 gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="text-sm text-text-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-status-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {error}
        </p>
      )}
    </div>
  );
}
