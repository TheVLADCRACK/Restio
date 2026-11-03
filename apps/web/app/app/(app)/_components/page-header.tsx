import type { ReactNode } from 'react';

/** En-tête de page : titre, sous-titre, actions alignées à droite (empilées sous le titre sur mobile). */
export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:min-h-14 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-[2rem] font-bold leading-[1.1] tracking-[-0.025em] md:text-[1.875rem] md:leading-[1.15] md:tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[0.9375rem] text-text-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{actions}</div>}
    </header>
  );
}
