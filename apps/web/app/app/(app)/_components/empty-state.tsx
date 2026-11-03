import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** État vide : pictogramme au trait (2 px Ink) avec une seule touche citron, titre, phrase courte, action utile. */
export function EmptyState({ icon: Icon, title, children, action, compact, level = 2 }: { icon: LucideIcon; title: string; children: ReactNode; action?: ReactNode; compact?: boolean; level?: 2 | 3 }) {
  const Heading = level === 3 ? 'h3' : 'h2';
  return (
    <div className={`grid justify-items-center gap-2.5 text-center ${compact ? 'px-2 py-6' : 'px-5 py-10'}`}>
      <span aria-hidden="true" className="relative mb-1 grid size-16 place-items-center rounded-full bg-sunken text-ink">
        <Icon className="size-7" strokeWidth={2} />
        <span className="absolute right-0.5 top-0.5 size-3.5 rounded-full bg-lime ring-[3px] ring-surface" />
      </span>
      <Heading className="text-lg font-bold">{title}</Heading>
      <p className="max-w-[34ch] text-[0.9375rem] text-text-2">{children}</p>
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
