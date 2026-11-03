import type { ReactNode } from 'react';

export type AuthShellProps = {
  title: string;
  /** Phrase d'introduction sous le titre. */
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

// Mise en page des écrans d'authentification : une colonne, pensée pour 360 px.
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-4 pb-8 pt-6 sm:justify-center sm:py-12">
      {/* shortcut: monogramme texte faute de SVG du symbole ; remplacer par le logo vectoriel dès qu'il existe. */}
      <div className="grid size-10 place-items-center rounded-[12px] bg-ink text-lg font-black text-lime">
        <span aria-hidden="true">R</span>
        <span className="sr-only">Restio</span>
      </div>
      <h1 className="mt-8 text-display font-bold text-ink">{title}</h1>
      {description && <div className="mt-3 text-lg font-medium leading-[1.45] text-text-2">{description}</div>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 text-center text-base text-text-2">{footer}</div>}
    </main>
  );
}
