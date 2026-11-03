import { describe, expect, it } from 'vitest';
import { defaultCurrencyFor, defaultTimeZoneFor, isValidTimeZone } from './locale-defaults';

describe('defaultCurrencyFor', () => {
  it('donne la devise des marchés prioritaires', () => {
    expect(defaultCurrencyFor('CM')).toBe('XAF');
    expect(defaultCurrencyFor('sn')).toBe('XOF');
    expect(defaultCurrencyFor('FR')).toBe('EUR');
    expect(defaultCurrencyFor('US')).toBe('USD');
  });
  it('ne devine pas ailleurs', () => {
    expect(defaultCurrencyFor('JP')).toBeUndefined();
  });
});

describe('defaultTimeZoneFor', () => {
  it('donne le fuseau des pays à fuseau unique, valide', () => {
    expect(defaultTimeZoneFor('CM')).toBe('Africa/Douala');
    expect(defaultTimeZoneFor('fr')).toBe('Europe/Paris');
    expect(defaultTimeZoneFor('US')).toBeUndefined();
    expect(['CM', 'SN', 'CI', 'FR', 'GB', 'MA'].every((c) => isValidTimeZone(defaultTimeZoneFor(c) ?? ''))).toBe(true);
  });
});

describe('isValidTimeZone', () => {
  it('accepte les fuseaux IANA et refuse le reste', () => {
    expect(isValidTimeZone('Africa/Douala')).toBe(true);
    expect(isValidTimeZone('Europe/Paris')).toBe(true);
    expect(isValidTimeZone('Asia/Calcutta')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    expect(isValidTimeZone("'; DROP TABLE x;--")).toBe(false);
  });
});
