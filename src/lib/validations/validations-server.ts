import { asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import type { SubmissionLine } from '@/lib/db/schema';
import type { Role } from '@/lib/rbac';

/** Data reads for the timesheet validation screen (N+1 scope). Server-only. */

export interface SubmissionView {
  readonly id: string;
  readonly personName: string;
  readonly department: string;
  readonly managerName: string;
  readonly weekLabel: string;
  readonly hours: number;
  readonly billable: number;
  readonly status: 'pending' | 'validated' | 'rejected';
  readonly motif: string | null;
  readonly flags: readonly string[];
  readonly lines: readonly SubmissionLine[];
}

export interface ValidationData {
  readonly rows: readonly SubmissionView[];
  readonly counts: {
    readonly pending: number;
    readonly validated: number;
    readonly rejected: number;
  };
  readonly scopeNote: string;
}

export async function getSubmissions(role: Role, userName: string): Promise<ValidationData> {
  const rows = await db.select().from(submissions).orderBy(asc(submissions.personName));

  // Row-level scope: a manager only validates their direct team.
  const scoped = role === 'manager' ? rows.filter((row) => row.managerName === userName) : rows;

  const counts = {
    pending: scoped.filter((r) => r.status === 'pending').length,
    validated: scoped.filter((r) => r.status === 'validated').length,
    rejected: scoped.filter((r) => r.status === 'rejected').length,
  };

  const scopeNote =
    role === 'manager'
      ? `Équipe directe de ${userName} - vous validez les heures, pas les imputations projet`
      : 'Vue transverse - toutes les équipes';

  return {
    rows: scoped.map((row) => ({
      id: row.id,
      personName: row.personName,
      department: row.department ?? '-',
      managerName: row.managerName ?? '-',
      weekLabel: row.weekLabel,
      hours: row.hours,
      billable: row.billable,
      status: row.status,
      motif: row.motif,
      flags: row.flags,
      lines: row.lines,
    })),
    counts,
    scopeNote,
  };
}
