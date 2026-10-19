'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { isGoogleAuthConfigured } from '@/lib/auth/is-google-auth-configured';
import { isRole } from '@/lib/rbac';
import { ROLE_COOKIE } from '@/lib/session';

/**
 * Demo role switch. No-op when Google Workspace SSO is configured; otherwise
 * the active role is stored in a cookie for local demonstration.
 */
export async function setRole(formData: FormData): Promise<void> {
  if (isGoogleAuthConfigured()) return;

  const value = String(formData.get('role') ?? '');
  if (!isRole(value)) return;
  const store = await cookies();
  store.set(ROLE_COOKIE, value, { path: '/', sameSite: 'lax' });
  revalidatePath('/', 'layout');
}
