import { and, asc, eq } from 'drizzle-orm';

import { getWeekSnapshot } from '@/lib/calendar/week-display';
import { db } from '@/lib/db';
import { leaveBalances, leaves } from '@/lib/db/schema';

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

export interface LeaveBalanceView {
  readonly year: number;
  readonly acquiredDays: number;
  readonly takenDays: number;
}

export interface LeaveData {
  readonly rows: readonly LeaveView[];
  readonly pending: number;
}

/** Format a stored day count for French UI (comma decimal, suffix ` j`). */
export function formatLeaveDaysLabel(days: number): string {
  const raw = Number.isInteger(days) ? String(days) : String(days).replace('.', ',');
  return `${raw} j`;
}

/**
 * Annual leave balance for an employee and calendar (ISO) year.
 * Returns null when no `leave_balances` row exists (UI must show `-`).
 */
export async function getLeaveBalance(
  employeeId: string | null,
  year: number = getWeekSnapshot().isoYear,
): Promise<LeaveBalanceView | null> {
  if (!employeeId) return null;

  const [row] = await db
    .select({
      year: leaveBalances.year,
      acquiredDays: leaveBalances.acquiredDays,
      takenDays: leaveBalances.takenDays,
    })
    .from(leaveBalances)
    .where(and(eq(leaveBalances.employeeId, employeeId), eq(leaveBalances.year, year)))
    .limit(1);

  if (!row) return null;
  return {
    year: row.year,
    acquiredDays: row.acquiredDays,
    takenDays: row.takenDays,
  };
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
