import { describe, expect, it } from 'vitest';
import { resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('prefers a valid cookie over the device language', () => {
    expect(resolveLocale('en', 'fr-FR,fr;q=0.9')).toBe('en');
  });

  it('ignores an unknown cookie value', () => {
    expect(resolveLocale('de', 'fr-CM,fr;q=0.9')).toBe('fr');
  });

  it('follows the highest-weighted supported device language', () => {
    expect(resolveLocale(undefined, 'de-DE,de;q=0.9,en;q=0.5,fr;q=0.8')).toBe('fr');
    expect(resolveLocale(undefined, 'en-US,en;q=0.9,fr;q=0.8')).toBe('en');
  });

  it('skips languages explicitly refused with q=0', () => {
    expect(resolveLocale(undefined, 'fr;q=0,en;q=0.1')).toBe('en');
  });

  it('falls back to English without a supported language', () => {
    expect(resolveLocale(undefined, 'es-ES,es;q=0.9')).toBe('en');
    expect(resolveLocale(undefined, null)).toBe('en');
  });
});

describe('messages', () => {
  const keys = (value: unknown, prefix = ''): string[] =>
    typeof value === 'object' && value !== null
      ? Object.entries(value).flatMap(([key, child]) => keys(child, `${prefix}${key}.`))
      : [prefix.slice(0, -1)];

  it('has the same keys in French and English', async () => {
    const [fr, en] = await Promise.all([import('../messages/fr.json'), import('../messages/en.json')]);
    expect(keys(en.default).sort()).toEqual(keys(fr.default).sort());
  });
});
