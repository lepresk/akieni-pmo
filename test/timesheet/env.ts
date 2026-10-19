import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const testDatabaseUrl = process.env['DATABASE_URL_TEST'];
if (!testDatabaseUrl) {
  throw new Error('DATABASE_URL_TEST is required for timesheet integration tests');
}
process.env['DATABASE_URL'] = testDatabaseUrl;

// Avoid Agent A SSO gate when only GOOGLE_ALLOWED_DOMAINS is set in .env.local.
delete process.env['GOOGLE_CLIENT_ID'];
delete process.env['GOOGLE_CLIENT_SECRET'];
delete process.env['GOOGLE_ALLOWED_DOMAINS'];
delete process.env['AUTH_SECRET'];
