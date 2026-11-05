import Image from 'next/image';
import type { ReactNode } from 'react';

/** Connexion admin de la planche : fond encre, carte blanche centrée ; mobile : bandeau encre et feuille arrondie. */
export function AdminAuthShell({ title, description, children, footer }: { title: string; description: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const brand = (
    <span className="flex h-10 items-center gap-2.5 text-surface">
      <Image src="/brand/restio-mark-white.png" alt="" width={30} height={30} />
      <b className="text-[1.3125rem] font-bold tracking-[-0.02em]">Restio</b>
    </span>
  );
  return (
    <div className="flex min-h-dvh flex-col bg-ink md:items-center md:justify-center md:gap-7 md:p-6">
      <div className="h-[200px] shrink-0 px-5 pt-[max(40px,env(safe-area-inset-top))] md:h-auto md:p-0">{brand}</div>
      <main className="relative z-10 -mt-7 flex flex-1 flex-col gap-4 rounded-t-xl bg-surface px-5 pb-[18px] pt-[26px] md:mt-0 md:w-[440px] md:flex-none md:gap-[18px] md:rounded-xl md:p-8">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-[-0.02em] md:text-[1.875rem]">{title}</h1>
          <div className="mt-1 text-text-2">{description}</div>
        </div>
        {children}
        {footer && <div className="text-center text-sm md:text-[0.9375rem] [&_a]:font-bold [&_a]:text-text-2 [&_a]:underline [&_a]:underline-offset-[3px]">{footer}</div>}
        <p className="mt-auto pt-4 text-center text-[0.8125rem] text-text-2 md:hidden">© {new Date().getFullYear()} Restio</p>
      </main>
    </div>
  );
}
