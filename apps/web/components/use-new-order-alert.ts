'use client';

import { useEffect, useRef } from 'react';

export const PREF_SOUND = 'restio_pref_sound';
export const PREF_REMINDER = 'restio_pref_reminder';

export function readPref(key: string, fallback = true): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === '1';
  } catch {
    return fallback;
  }
}

export function writePref(key: string, on: boolean): void {
  try {
    localStorage.setItem(key, on ? '1' : '0');
  } catch (error) {
    console.warn('[prefs] préférence non enregistrée', error);
  }
}

// Clochette synthétisée : aucun fichier audio à télécharger sur réseau mobile.
export function playChime(): void {
  try {
    const context = new AudioContext();
    const gain = context.createGain();
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.9);
    for (const [frequency, delay] of [[880, 0], [1320, 0.12]] as const) {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(context.currentTime + delay);
      oscillator.stop(context.currentTime + 0.9);
    }
    setTimeout(() => void context.close(), 1200);
  } catch (error) {
    console.warn('[alert] son indisponible', error);
  }
}

/** Sonne et notifie quand le nombre de nouvelles commandes augmente, tant que la page est ouverte. */
export function useNewOrderAlert(count: number, title: string): void {
  const previous = useRef(count);
  useEffect(() => {
    if (count > previous.current) {
      if (readPref(PREF_SOUND)) playChime();
      if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') new Notification(title);
    }
    previous.current = count;
  }, [count, title]);
}
