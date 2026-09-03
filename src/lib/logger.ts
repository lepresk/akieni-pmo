import pino from 'pino';

import { env } from '@/lib/env';

/**
 * Structured application logger. Use this instead of `console.*` in committed code
 * (a bare `console.error` is tolerated only for genuine boot-time diagnostics).
 */
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});
