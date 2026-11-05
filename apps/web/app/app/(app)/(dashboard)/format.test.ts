import { describe, expect, it } from 'vitest';
import { ageLabel, averageAmount, dayLabel, minutesSince, moneyParts, niceMax, todayLabel, type AgeMessages } from './format';

describe('tableau de bord : formats', () => {
  it('calcule le panier moyen au centime, sans flottant', () => {
    expect(averageAmount('96500', 18)).toBe('5361.11');
    expect(averageAmount('10.00', 3)).toBe('3.33');
    expect(averageAmount('0', 0)).toBeNull();
  });
  it('sépare la valeur et la devise', () => {
    const p = moneyParts('96500', 'XAF', 'fr-FR');
    expect(p.unit).toBe('FCFA');
    expect(p.value.replace(/\s/g, ' ')).toBe('96 500');
    expect(moneyParts('12.5', 'EUR', 'fr-FR').value.replace(/\s/g, ' ')).toBe('12,50');
  });
  it('arrondit le haut de l’axe', () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(263_000)).toBe(500_000);
    expect(niceMax(180_000)).toBe(200_000);
    expect(niceMax(100)).toBe(100);
  });
  it('libellés de temps et de lieu', () => {
    const age: AgeMessages = (key, v) => (key === 'minutes' ? `${v.m} min` : `${v.h} h ${v.m}`);
    expect(minutesSince(new Date(0), 30_000)).toBe(0);
    expect(ageLabel(6, age)).toBe('6 min');
    expect(ageLabel(65, age)).toBe('1 h 05');
    expect(dayLabel('2026-10-28', 'fr-FR')).toEqual({ weekday: 'Mer', date: 28 });
    expect(dayLabel('2026-10-28', 'en')).toEqual({ weekday: 'Wed', date: 28 });
    expect(todayLabel('Africa/Douala', 'fr-FR', new Date('2026-11-03T23:30:00Z'))).toBe('Mercredi 4 novembre');
    expect(todayLabel('Africa/Douala', 'en', new Date('2026-11-03T23:30:00Z'))).toBe('Wednesday, November 4');
  });
});
