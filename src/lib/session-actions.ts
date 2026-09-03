'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { isRole } from '@/lib/rbac';
import { ROLE_COOKIE } from '@/lib/session';

/**
 * Demo role switch. Replaced by Google Workspace SSO in Vague 0, where the role comes from
 * the authenticated session instead of a cookie.
 */
export async function setRole(formData: FormData): Promise<void> {
  const value = String(formData.get('role') ?? '');
  if (!isRole(value)) return;
  const store = await cookies();
  store.set(ROLE_COOKIE, value, { path: '/', sameSite: 'lax' });
  revalidatePath('/', 'layout');
}
