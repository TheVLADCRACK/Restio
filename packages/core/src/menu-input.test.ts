import { describe, expect, it } from 'vitest';
import { categoryNameSchema, dishInputSchema, parsePriceInput } from './menu-input';

describe('parsePriceInput', () => {
  it('accepte les espaces et la virgule', () => {
    expect(parsePriceInput('3 500', 'XAF')).toBe('3500');
    expect(parsePriceInput('3 500', 'XAF')).toBe('3500');
    expect(parsePriceInput('12,50', 'EUR')).toBe('12.50');
    expect(parsePriceInput('0', 'EUR')).toBe('0');
  });
  it('refuse les décimales que la devise n’admet pas', () => {
    expect(parsePriceInput('12.5', 'XAF')).toBeNull();
    expect(parsePriceInput('12.505', 'EUR')).toBeNull();
  });
  it('refuse ce qui n’est pas un montant', () => {
    for (const bad of ['', '-5', 'abc', '1e5', '12345678901', '1,2,3']) expect(parsePriceInput(bad, 'EUR')).toBeNull();
  });
});

describe('dishInputSchema', () => {
  const valid = { name: ' Poulet DG ', description: '', categoryId: '019a0000-0000-7000-8000-000000000000', isAvailable: true };
  it('nettoie et transforme la description vide', () => {
    expect(dishInputSchema.parse(valid)).toMatchObject({ name: 'Poulet DG', description: null });
  });
  it('refuse les caractères de contrôle et les champs inconnus', () => {
    expect(dishInputSchema.safeParse({ ...valid, name: 'a\u0000b' }).success).toBe(false);
    expect(dishInputSchema.safeParse({ ...valid, restaurantId: 'x' }).success).toBe(false);
    expect(dishInputSchema.safeParse({ ...valid, description: 'x'.repeat(161) }).success).toBe(false);
  });
  it('valide le nom de catégorie', () => {
    expect(categoryNameSchema.safeParse('  ').success).toBe(false);
    expect(categoryNameSchema.parse(' Boissons ')).toBe('Boissons');
  });
});
