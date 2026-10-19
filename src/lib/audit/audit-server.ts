import { asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';

/** Data reads and append-only writes for the audit log. Server-only. */

export interface AuditRow {
  readonly id: string;
  readonly at: string;
  readonly who: string;
  readonly role: string;
  readonly action: string;
  readonly target: string;
  readonly sensitive: boolean;
}

export interface WriteAuditLogInput {
  /** Actor display name or user id written to the `who` column. */
  readonly who?: string;
  /** Alias for `who` when the caller has a user id rather than a display name. */
  readonly actorUserId?: string;
  readonly role: string;
  readonly action: string;
  readonly target: string;
  readonly sensitive: boolean;
}

/**
 * Append one audit entry. Sensitive reads (salary, margin) and RH/finance mutations
 * must call this before returning serialized data or after a successful state change.
 */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  const who = input.who ?? input.actorUserId ?? '-';
  await db.insert(auditLog).values({
    at: new Date().toISOString(),
    who,
    role: input.role,
    action: input.action,
    target: input.target,
    sensitive: input.sensitive,
  });
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
