import type { ReactNode } from 'react';

/** Barre de titre mobile de la planche (« .m-head ») : titre centré, action à droite. */
export function MobileHead({ title, start, end }: { title: string; start?: ReactNode; end?: ReactNode }) {
  return (
    <div className="-mx-4 -mt-2 grid h-[calc(52px+env(safe-area-inset-top))] grid-cols-[48px_minmax(0,1fr)_48px] items-center px-1 pt-[env(safe-area-inset-top)] md:hidden">
      <span>{start}</span>
      <h1 className="truncate text-center text-[1.0625rem] font-bold">{title}</h1>
      <span className="justify-self-end">{end}</span>
    </div>
  );
}
