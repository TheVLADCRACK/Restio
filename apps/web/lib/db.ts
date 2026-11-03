import 'server-only';
import { createAppDb } from '@restio/db';

export const db = () => createAppDb();
