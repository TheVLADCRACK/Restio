import Image, { getImageProps } from 'next/image';
import { Check } from 'lucide-react';
import { AuthShell, type AuthShellProps } from '@restio/ui/components/auth-shell';

const PHOTOS = {
  bowl: { mobile: { src: '/images/auth/dish-bowl-800.webp', width: 800, height: 1200 }, desktop: { src: '/images/auth/dish-bowl-1400.webp', width: 1400, height: 2100 } },
  grill: { mobile: { src: '/images/auth/dish-grill-800.webp', width: 800, height: 533 }, desktop: { src: '/images/auth/dish-grill-1400.webp', width: 1400, height: 933 } },
} as const;

// Direction artistique : un seul <img>, la variante 1400 px n'est chargée qu'à partir de 1024 px.
function AuthPhoto({ dish }: { dish: keyof typeof PHOTOS }) {
  const { mobile, desktop } = PHOTOS[dish];
  const common = { alt: '', quality: 70 };
  const { props: { srcSet: desktopSet } } = getImageProps({ ...common, ...desktop, sizes: '50vw' });
  const { props: { srcSet: mobileSet, ...img } } = getImageProps({ ...common, ...mobile, sizes: '100vw', loading: 'eager', fetchPriority: 'high' });
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopSet} sizes="50vw" />
      <source srcSet={mobileSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt vide fourni par getImageProps (photo décorative) */}
      <img {...img} />
    </picture>
  );
}

function AuthPromise() {
  return (
    <div className="grid gap-[18px]">
      <p className="max-w-[18ch] text-[2.125rem] font-bold leading-[1.12] tracking-[-0.025em]">Votre menu QR qui reçoit les commandes des tables.</p>
      <ul className="grid gap-2.5 text-base">
        {['Chaque commande est enregistrée, jamais perdue', 'Suivie de la table à la remise', 'Pensé pour votre téléphone et votre ordinateur'].map((line) => (
          <li key={line} className="flex items-center gap-2.5">
            <span aria-hidden="true" className="grid size-[22px] shrink-0 place-items-center rounded-full bg-lime text-ink">
              <Check className="size-4" strokeWidth={2.5} />
            </span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Sur l'hôte app.*, le proxy réécrit /brand/… vers /app/brand/… : le symbole passe donc par next/image.
const renderMark = (tone: 'ink' | 'white', size: number) => <Image src={`/brand/restio-mark-${tone}.png`} alt="" width={size} height={size} style={{ width: size, height: size }} />;

/** AuthShell de l'application restaurateur : photo de plat et promesse produit. */
export function WebAuthShell({ dish = 'bowl', ...props }: Omit<AuthShellProps, 'media' | 'promise'> & { dish?: keyof typeof PHOTOS }) {
  return <AuthShell {...props} media={<AuthPhoto dish={dish} />} promise={<AuthPromise />} renderMark={renderMark} />;
}
