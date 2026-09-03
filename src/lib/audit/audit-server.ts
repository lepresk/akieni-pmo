import { asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';

/** Data reads for the audit log. Server-only. */

export interface AuditRow {
  readonly id: string;
  readonly at: string;
  readonly who: string;
  readonly role: string;
  readonly action: string;
  readonly target: string;
  readonly sensitive: boolean;
}

export async function getAudit(): Promise<readonly AuditRow[]> {
  return db
    .select({
      id: auditLog.id,
      at: auditLog.at,
      who: auditLog.who,
      role: auditLog.role,
      action: auditLog.action,
      target: auditLog.target,
      sensitive: auditLog.sensitive,
    })
    .from(auditLog)
    .orderBy(asc(auditLog.at));
}
