'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { TextInput, type TextInputProps } from './text-input';

export type PasswordInputProps = Omit<TextInputProps, 'type' | 'icon'> & { showLabel: string; hideLabel: string };

/** Champ mot de passe de la planche : cadenas à gauche, œil à droite pour afficher la saisie. */
export function PasswordInput({ showLabel, hideLabel, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative min-w-0">
      <TextInput icon={Lock} type={visible ? 'text' : 'password'} className={`pr-12 ${className ?? ''}`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="absolute right-1 top-1 grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-sunken focus-visible:outline-2 focus-visible:outline-ink"
      >
        {visible ? <EyeOff aria-hidden="true" className="size-5" strokeWidth={1.75} /> : <Eye aria-hidden="true" className="size-5" strokeWidth={1.75} />}
      </button>
    </div>
  );
}
