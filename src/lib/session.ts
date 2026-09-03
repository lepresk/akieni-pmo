import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { db } from '@/lib/db';
import { departments, employees, users } from '@/lib/db/schema';
import { isRole, type Role } from '@/lib/rbac';

/**
 * Active session. Until Google Workspace SSO lands (Vague 0), the active role is held in
 * a cookie and resolved to the matching demo user from the database. Every server check
 * reads the role from here, so authorization is genuinely server-side.
 */

export const ROLE_COOKIE = 'akieni_role';

export interface SessionUser {
  readonly name: string;
  readonly firstName: string;
  readonly initials: string;
  readonly department: string;
}

export interface Session {
  readonly role: Role;
  readonly employeeId: string | null;
  readonly user: SessionUser;
}

const FALLBACK_USER: SessionUser = { name: '-', firstName: '', initials: '--', department: '-' };

export async function getSession(): Promise<Session> {
  const store = await cookies();
  const raw = store.get(ROLE_COOKIE)?.value ?? 'staff';
  const role: Role = isRole(raw) ? raw : 'staff';

  const [row] = await db
    .select({
      employeeId: users.employeeId,
      name: employees.fullName,
      firstName: employees.firstName,
      initials: employees.initials,
      department: departments.name,
    })
    .from(users)
    .innerJoin(employees, eq(users.employeeId, employees.id))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(eq(users.role, role))
    .limit(1);

  if (!row) return { role, employeeId: null, user: FALLBACK_USER };

  return {
    role,
    employeeId: row.employeeId,
    user: {
      name: row.name,
      firstName: row.firstName ?? row.name,
      initials: row.initials ?? '--',
      department: row.department ?? '-',
    },
  };
}
