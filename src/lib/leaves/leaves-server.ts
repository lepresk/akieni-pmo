import { asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { leaves } from '@/lib/db/schema';

/** Data reads for the leave screen. Server-only. */

export interface LeaveView {
  readonly id: string;
  readonly personName: string;
  readonly type: string;
  readonly fromLabel: string;
  readonly toLabel: string;
  readonly days: number;
  readonly status: 'pending' | 'validated' | 'rejected';
  readonly note: string | null;
}

export interface LeaveData {
  readonly rows: readonly LeaveView[];
  readonly pending: number;
}

export async function getLeaves(): Promise<LeaveData> {
  const rows = await db.select().from(leaves).orderBy(asc(leaves.personName));
  return {
    rows: rows.map((row) => ({
      id: row.id,
      personName: row.personName,
      type: row.type,
      fromLabel: row.fromLabel,
      toLabel: row.toLabel,
      days: row.days,
      status: row.status,
      note: row.note,
    })),
    pending: rows.filter((row) => row.status === 'pending').length,
  };
}
