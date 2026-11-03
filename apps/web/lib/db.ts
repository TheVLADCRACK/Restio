import 'server-only';
import { createAppDb, createAppReadDb } from '@restio/db';

export const db = () => createAppDb();

// Lectures de rendu : HTTP, regroupables en un seul aller-retour.
export const readDb = () => createAppReadDb();
