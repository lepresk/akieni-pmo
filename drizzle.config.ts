import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// drizzle-kit runs outside Next, so load the local env explicitly.
config({ path: '.env.local' });

export default defineConfig({
  schema: './src/lib/db/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? 'postgres://postgres@127.0.0.1:5432/akieni_dev',
  },
  verbose: true,
  strict: true,
});
