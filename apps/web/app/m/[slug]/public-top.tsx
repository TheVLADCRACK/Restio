import { RestaurantMonogram } from '@/app/app/(app)/_components/public-menu';
import { LanguageSelect } from '@/components/language-select';

/** Barre haute du menu public sur ordinateur (« .pubd-top ») ; absente sur mobile. */
export function PublicTop({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="hidden h-16 border-b border-line bg-surface md:block">
      <div className="mx-auto flex h-full max-w-[720px] items-center gap-3">
        <RestaurantMonogram name={name} logoUrl={logoUrl} />
        <b className="min-w-0 truncate text-[1.0625rem]">{name}</b>
        <LanguageSelect short className="ml-auto" />
      </div>
    </div>
  );
}
