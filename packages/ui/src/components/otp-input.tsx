'use client';

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';

const LENGTH = 6;

/** Six cases de la planche (« .otp ») ; la valeur complète part dans un champ caché. Le collage et le remplissage SMS fonctionnent. */
export function OtpInput({ id, name, label, digitLabel, 'aria-invalid': invalid }: { id?: string; name: string; label: string; digitLabel: (index: number) => string; 'aria-invalid'?: boolean }) {
  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function fill(start: number, text: string) {
    const clean = text.replace(/\D/g, '').slice(0, LENGTH - start).split('');
    if (clean.length === 0) return;
    setDigits((current) => {
      const next = [...current];
      clean.forEach((digit, offset) => {
        next[start + offset] = digit;
      });
      return next;
    });
    inputs.current[Math.min(start + clean.length, LENGTH - 1)]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((current) => current.map((digit, i) => (i === index - 1 ? '' : digit)));
      inputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    event.preventDefault();
    fill(index, event.clipboardData.getData('text'));
  }

  return (
    <div role="group" aria-label={label} className="grid grid-cols-6 gap-2">
      <input type="hidden" name={name} value={digits.join('')} />
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          id={index === 0 ? id : undefined}
          value={digit}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={digitLabel(index + 1)}
          aria-invalid={invalid}
          onChange={(event) => {
            const value = event.target.value;
            if (value === '') setDigits((current) => current.map((d, i) => (i === index ? '' : d)));
            else fill(index, value);
          }}
          onKeyDown={(event) => onKeyDown(event, index)}
          onPaste={(event) => onPaste(event, index)}
          onFocus={(event) => event.target.select()}
          className="h-14 w-full min-w-0 rounded-md border border-line-strong bg-surface p-0 text-center text-[1.375rem] font-bold text-ink tabular focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none aria-invalid:border-status-danger"
        />
      ))}
    </div>
  );
}
