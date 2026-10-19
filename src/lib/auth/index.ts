/**
 * Auth.js (next-auth v5) Google Workspace SSO.
 * Providers are registered only when {@link isGoogleAuthConfigured} is true.
 * Domain gate and email -> users mapping happen in the signIn callback.
 * Google OAuth only (no local login provider).
 */

import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import { isGoogleAuthConfigured } from '@/lib/auth/is-google-auth-configured';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { allowedGoogleDomains, env } from '@/lib/env';

const googleConfigured = isGoogleAuthConfigured();

function isAllowedDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return allowedGoogleDomains.some((allowed) => allowed.toLowerCase() === domain);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // SAFETY: placeholder only when SSO is off; handlers are unused in demo mode.
  secret: env.AUTH_SECRET?.trim() || 'unconfigured-demo-secret',
  providers: googleConfigured
    ? [
        Google({
          // SAFETY: isGoogleAuthConfigured guarantees non-empty client credentials.
          clientId: env.GOOGLE_CLIENT_ID!.trim(),
          clientSecret: env.GOOGLE_CLIENT_SECRET!.trim(),
          authorization: {
            params: {
              ...(allowedGoogleDomains[0] ? { hd: allowedGoogleDomains[0].toLowerCase() } : {}),
              prompt: 'select_account',
            },
          },
        }),
      ]
    : [],
  callbacks: {
    async signIn({ profile }) {
      if (!googleConfigured) return false;

      const email = profile?.email?.toLowerCase().trim();
      if (!email || !isAllowedDomain(email)) return false;

      const [row] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return Boolean(row);
    },
  },
});
