import { env } from '@/lib/env';

/**
 * Returns true only when every Google Workspace SSO env var is non-empty.
 * When false, the app stays in demo mode (cookie role switcher).
 */
export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    env.GOOGLE_CLIENT_ID?.trim() &&
    env.GOOGLE_CLIENT_SECRET?.trim() &&
    env.GOOGLE_ALLOWED_DOMAINS?.trim() &&
    env.AUTH_SECRET?.trim(),
  );
}
