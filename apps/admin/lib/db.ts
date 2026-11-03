import 'server-only';
import { createAdminDbs } from '@restio/db';

export const dbs = () => createAdminDbs();
