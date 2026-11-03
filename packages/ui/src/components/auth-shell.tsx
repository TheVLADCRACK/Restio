import type { ReactNode } from 'react';

export type AuthShellProps = {
  title: string;
  /** Phrase d'introduction sous le titre. */
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Photo plein cadre (élément <picture>/<img> en object-cover). Sans photo : panneau noir sobre avec le symbole blanc. */
  media?: ReactNode;
  /** Promesse produit affichée sur la photo, à partir de 1024 px. */
  promise?: ReactNode;
  /** Rendu du symbole Restio (ex. next/image) ; par défaut <img src="/brand/…">. */
  renderMark?: RenderMark;
};

type RenderMark = (tone: 'ink' | 'white', size: number) => ReactNode;

// Par défaut : PNG statique de /public/brand (servi tel quel sur l'hôte admin).
const defaultMark: RenderMark = (tone, size) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/brand/restio-mark-${tone}.png`} alt="" width={size} height={size} style={{ width: size, height: size }} />
);

function Brand({ tone, mark }: { tone: 'ink' | 'white'; mark: RenderMark }) {
  return (
    <span className={`flex h-10 items-center gap-2.5 ${tone === 'white' ? 'text-surface' : 'text-ink'}`}>
      {mark(tone, 30)}
      <span className="text-[1.3125rem] font-bold tracking-[-0.02em]">Restio</span>
    </span>
  );
}

/**
 * Écrans d'authentification (planche « Connexion et inscription ») :
 * - mobile : grande photo en haut, feuille blanche arrondie qui la chevauche ;
 * - ordinateur (≥ 1024 px) : carte scindée, formulaire à gauche, panneau visuel à droite.
 */
export function AuthShell({ title, description, children, footer, media, promise, renderMark = defaultMark }: AuthShellProps) {
  return (
    <div className="min-h-dvh lg:flex lg:p-8">
      <div className="flex min-h-dvh flex-col lg:mx-auto lg:grid lg:min-h-[calc(100dvh-4rem)] lg:w-full lg:max-w-[1440px] lg:grid-cols-2 lg:rounded-xl lg:border lg:border-line lg:bg-surface lg:p-3">
        <div className={`relative shrink-0 overflow-hidden bg-ink lg:order-2 lg:h-auto lg:rounded-lg ${media ? 'h-[clamp(220px,40dvh,360px)]' : 'h-44'}`}>
          {media ? (
            <>
              <div className="absolute inset-0 [&_img]:size-full [&_img]:object-cover">{media}</div>
              {/* Mobile : voile en haut pour lire le logo ; ordinateur : voile en bas pour lire la promesse. */}
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,.55)_0%,rgba(15,15,15,0)_35%)] lg:bg-[linear-gradient(180deg,rgba(15,15,15,.15)_0%,rgba(15,15,15,.25)_40%,rgba(15,15,15,.92)_78%)]" />
              <span className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-10 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-bold text-surface lg:left-5 lg:right-auto lg:top-5">
                Photo de démonstration
              </span>
            </>
          ) : (
            <div aria-hidden="true" className="absolute inset-0 hidden place-items-center lg:grid">
              {renderMark('white', 112)}
            </div>
          )}
          <div className="absolute left-3 top-[max(12px,env(safe-area-inset-top))] z-10 lg:hidden">
            <Brand tone="white" mark={renderMark} />
          </div>
          {promise && <div className="absolute inset-x-11 bottom-10 z-10 hidden text-surface lg:grid">{promise}</div>}
        </div>

        <main className="relative z-10 -mt-7 flex flex-1 flex-col rounded-t-xl bg-surface px-5 pb-6 pt-7 sm:px-8 lg:order-1 lg:mt-0 lg:rounded-none lg:px-9 lg:pb-4 lg:pt-5">
          <div className="hidden lg:block">
            <Brand tone="ink" mark={renderMark} />
          </div>
          <div className="mx-auto w-full max-w-[400px] lg:my-auto lg:py-10">
            <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink lg:text-[1.875rem]">{title}</h1>
            {description && <div className="mt-2 text-base text-text-2">{description}</div>}
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 text-center text-[0.9375rem] text-text-2">{footer}</div>}
          </div>
          <p className="mx-auto mt-auto w-full max-w-[400px] pt-8 text-center text-sm text-text-2 lg:mx-0 lg:pt-0 lg:max-w-none lg:text-left">© {new Date().getFullYear()} Restio</p>
        </main>
      </div>
    </div>
  );
}
