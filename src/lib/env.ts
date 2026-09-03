import { z } from 'zod';

/**
 * Environment contract, parsed once at module load. Import `env` from here; never
 * read `process.env` directly in business logic. Auth variables are optional until
 * Google Workspace SSO lands, then become required.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  DATABASE_URL_TEST: z.string().url().optional(),
  APP_URL: z.string().url().default('http://localhost:3000'),
  // Google Workspace SSO - optional until auth is implemented (empty strings allowed).
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_ALLOWED_DOMAINS: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail loudly at startup rather than surfacing cryptic runtime errors later.
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;

/** Allowed Google Workspace domains, derived from the comma-separated env value. */
export const allowedGoogleDomains: readonly string[] =
  env.GOOGLE_ALLOWED_DOMAINS?.split(',')
    .map((domain) => domain.trim())
    .filter(Boolean) ?? [];
