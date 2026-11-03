import { describe, it, expect } from 'vitest';
import { RESERVED_SLUGS, SLUG_RE, isValidSlug, slugify, suggestSlug } from './slug';

describe('slugify', () => {
  it('lowercases and strips accents', () => {
    expect(slugify('Chez Mamá Ndolé')).toBe('chez-mama-ndole');
    expect(slugify('Crème Brûlée & Café')).toBe('creme-brulee-cafe');
    expect(slugify('ÉTÉ À NOËL')).toBe('ete-a-noel');
  });

  it('turns emoji and symbols into separators, collapsing and trimming dashes', () => {
    expect(slugify('🍔 Burger 🔥 House 🍟')).toBe('burger-house');
    expect(slugify('--Le   Petit___Bistro!!--')).toBe('le-petit-bistro');
    expect(slugify('🍔🍕')).toBe('');
  });

  it('neutralises HTML and path tricks', () => {
    expect(slugify('<script>alert(1)</script>')).toBe('script-alert-1-script');
    expect(slugify('../../etc/passwd')).toBe('etc-passwd');
  });

  it('caps length at 48 without a trailing dash', () => {
    const s = slugify(`${'a'.repeat(47)} b`);
    expect(s).toBe('a'.repeat(47));
    expect(slugify('x'.repeat(10_000))).toHaveLength(48);
    expect(SLUG_RE.test(slugify('Le Grand Restaurant International de la Place du Marché Central'))).toBe(true);
  });
});

describe('isValidSlug', () => {
  it('follows the DATABASE.md regex', () => {
    for (const ok of ['abc', 'chez-mama', 'a1b', 'x'.repeat(48)]) expect(isValidSlug(ok), ok).toBe(true);
    for (const bad of ['', 'ab', '-abc', 'abc-', 'ABC', 'café', 'a_b', 'a b', 'x'.repeat(49)]) {
      expect(isValidSlug(bad), bad).toBe(false);
    }
  });

  it('refuses reserved words', () => {
    for (const r of ['admin', 'app', 'api', 'www', 'auth', 'menu', 'static', 'assets', 'login', 'signup', 'settings', 'restio', 'support', 'help', 'legal', 'status', 'dashboard']) {
      expect(RESERVED_SLUGS.has(r), r).toBe(true);
      expect(isValidSlug(r), r).toBe(false);
    }
    expect(RESERVED_SLUGS.has('m')).toBe(true);
  });
});

describe('suggestSlug', () => {
  it('returns the slug itself when free', () => {
    expect(suggestSlug('Chez Mama', new Set())).toBe('chez-mama');
  });

  it('appends -2, -3… on collisions', () => {
    expect(suggestSlug('Chez Mama', new Set(['chez-mama']))).toBe('chez-mama-2');
    expect(suggestSlug('Chez Mama', new Set(['chez-mama', 'chez-mama-2']))).toBe('chez-mama-3');
  });

  it('suffixes reserved or too-short names', () => {
    expect(suggestSlug('Admin', new Set())).toBe('admin-2');
    expect(suggestSlug('Le', new Set())).toBe('le-2');
    expect(suggestSlug('🍔🍕', new Set())).toBe('restaurant');
  });

  it('never exceeds 48 characters', () => {
    const long = 'x'.repeat(48);
    const taken = new Set([long, ...Array.from({ length: 10 }, (_, i) => `${'x'.repeat(46)}-${i + 2}`)]);
    const s = suggestSlug(long, taken);
    expect(s).toBe(`${'x'.repeat(45)}-10`);
    expect(s.length).toBeLessThanOrEqual(48);
    expect(isValidSlug(s)).toBe(true);
  });

  it('does not leave a dash before the suffix', () => {
    const base = `${'a'.repeat(45)}-bc`;
    expect(suggestSlug(base, new Set([base]))).toBe(`${'a'.repeat(45)}-2`);
  });
});
