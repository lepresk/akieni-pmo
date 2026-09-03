import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '@/lib/env';
import * as schema from '@/lib/db/schema';

/**
 * Single Drizzle client for the app. Only `*-server.ts` / `*-actions.ts` modules import
 * this; components and the transport layer never touch the query builder directly.
 */
const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export type Database = typeof db;
