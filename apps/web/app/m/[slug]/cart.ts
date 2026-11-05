'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Panier du client, propre à l'onglet et au restaurant : aucun compte, rien côté serveur avant l'envoi.
export type Cart = { items: Record<string, number>; notes: Record<string, string>; table: string; key: string };
const EMPTY: Cart = { items: {}, notes: {}, table: '', key: '' };
const MAX_QUANTITY = 99;

const listeners = new Set<() => void>();
const cache = new Map<string, Cart>();
const storageKey = (slug: string) => `restio_cart:${slug}`;

function read(slug: string): Cart {
  const cached = cache.get(slug);
  if (cached) return cached;
  let cart = EMPTY;
  try {
    const raw = sessionStorage.getItem(storageKey(slug));
    if (raw) cart = { ...EMPTY, ...(JSON.parse(raw) as Partial<Cart>) };
  } catch (error) {
    console.warn('[cart] panier illisible, nouveau panier', error);
  }
  cache.set(slug, cart);
  return cart;
}

function write(slug: string, cart: Cart) {
  cache.set(slug, cart);
  try {
    sessionStorage.setItem(storageKey(slug), JSON.stringify(cart));
  } catch (error) {
    // Navigation privée : le panier reste en mémoire pour cette page.
    console.warn('[cart] panier non enregistré', error);
  }
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useCart(slug: string) {
  const cart = useSyncExternalStore(subscribe, () => read(slug), () => EMPTY);
  const setQuantity = useCallback((dishId: string, quantity: number) => {
    const current = read(slug);
    const items = { ...current.items };
    const notes = { ...current.notes };
    if (quantity <= 0) {
      delete items[dishId];
      delete notes[dishId];
    } else items[dishId] = Math.min(quantity, MAX_QUANTITY);
    write(slug, { ...current, items, notes });
  }, [slug]);
  const setNote = useCallback((dishId: string, note: string) => {
    const current = read(slug);
    write(slug, { ...current, notes: { ...current.notes, [dishId]: note } });
  }, [slug]);
  const setTable = useCallback((table: string) => {
    const current = read(slug);
    if (current.table !== table) write(slug, { ...current, table });
  }, [slug]);
  // Clé d'idempotence gardée jusqu'au succès : un nouvel essai ne crée pas de seconde commande.
  const ensureKey = useCallback(() => {
    const current = read(slug);
    if (current.key) return current.key;
    const key = crypto.randomUUID();
    write(slug, { ...current, key });
    return key;
  }, [slug]);
  const clear = useCallback(() => {
    const current = read(slug);
    write(slug, { ...EMPTY, table: current.table });
  }, [slug]);
  return { cart, setQuantity, setNote, setTable, ensureKey, clear };
}
