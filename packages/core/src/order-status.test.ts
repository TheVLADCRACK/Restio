import { describe, it, expect } from 'vitest';
import { ORDER_STATUSES, canTransition, isActive, isOrderStatus, nextStep, type OrderStatus } from './order-status';

const allowed: ReadonlyArray<[OrderStatus, OrderStatus]> = [
  ['new', 'accepted'],
  ['new', 'rejected'],
  ['new', 'preparing'],
  ['accepted', 'preparing'],
  ['accepted', 'cancelled'],
  ['preparing', 'ready'],
  ['preparing', 'cancelled'],
  ['ready', 'completed'],
  ['ready', 'cancelled'],
];

describe('canTransition', () => {
  it('matches UML §7 exactly for all 49 pairs', () => {
    for (const from of ORDER_STATUSES) {
      for (const to of ORDER_STATUSES) {
        const expected = allowed.some(([f, t]) => f === from && t === to);
        expect(canTransition(from, to), `${from} -> ${to}`).toBe(expected);
      }
    }
  });

  it('refuses unknown statuses coming from untyped input', () => {
    expect(canTransition('hacked' as OrderStatus, 'new')).toBe(false);
    expect(canTransition('new', '__proto__' as OrderStatus)).toBe(false);
  });
});

describe('nextStep', () => {
  it('follows the lemon button path', () => {
    expect(nextStep('new')).toBe('accepted');
    expect(nextStep('accepted')).toBe('preparing');
    expect(nextStep('preparing')).toBe('ready');
    expect(nextStep('ready')).toBe('completed');
  });

  it('returns null for final states', () => {
    expect(nextStep('completed')).toBeNull();
    expect(nextStep('rejected')).toBeNull();
    expect(nextStep('cancelled')).toBeNull();
  });

  it('always proposes an allowed transition', () => {
    for (const s of ORDER_STATUSES) {
      const n = nextStep(s);
      if (n) expect(canTransition(s, n)).toBe(true);
    }
  });
});

describe('isActive / isOrderStatus', () => {
  it('flags active statuses', () => {
    expect(ORDER_STATUSES.filter(isActive)).toEqual(['new', 'accepted', 'preparing', 'ready']);
  });

  it('guards untyped values', () => {
    expect(isOrderStatus('ready')).toBe(true);
    expect(isOrderStatus('READY')).toBe(false);
    expect(isOrderStatus(1)).toBe(false);
  });
});

describe('prototype keys', () => {
  it('never treat Object.prototype members as statuses', () => {
    expect(nextStep('__proto__' as OrderStatus)).toBeNull();
    expect(nextStep('constructor' as OrderStatus)).toBeNull();
    expect(isActive('toString' as OrderStatus)).toBe(false);
  });
});
