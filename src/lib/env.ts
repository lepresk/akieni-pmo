import { z } from 'zod';

/**
 * Environment contract, parsed once at module load. Import `env` from here; never
 * read `process.env` directly in business logic. Google SSO vars may all be empty
 * (demo mode). If any is set, all four must be non-empty.
 */

function isNonEmpty(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    DATABASE_URL_TEST: z.string().url().optional(),
    APP_URL: z.string().url().default('http://localhost:3000'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_ALLOWED_DOMAINS: z.string().optional(),
    AUTH_SECRET: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const authFields = [
      ['GOOGLE_CLIENT_ID', data.GOOGLE_CLIENT_ID],
      ['GOOGLE_CLIENT_SECRET', data.GOOGLE_CLIENT_SECRET],
      ['GOOGLE_ALLOWED_DOMAINS', data.GOOGLE_ALLOWED_DOMAINS],
      ['AUTH_SECRET', data.AUTH_SECRET],
    ] as const;

    const anySet = authFields.some(([, value]) => isNonEmpty(value));
    if (!anySet) return;

    for (const [name, value] of authFields) {
      if (!isNonEmpty(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [name],
          message: `${name} is required when any Google SSO variable is set`,
        });
      }
    }
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
