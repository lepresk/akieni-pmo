import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

config({ path: '.env.local' });
process.env['DATABASE_URL'] = process.env['DATABASE_URL_TEST'] ?? process.env['DATABASE_URL'];

// Incomplete SSO from .env.local must not fail env.superRefine in tests.
for (const key of [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_ALLOWED_DOMAINS',
  'AUTH_SECRET',
] as const) {
  delete process.env[key];
}

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}));

describe('leave balance and createLeave persistence', () => {
  let db: typeof import('@/lib/db').db;
  let employees: typeof import('@/lib/db/schema').employees;
  let leaveBalances: typeof import('@/lib/db/schema').leaveBalances;
  let leaves: typeof import('@/lib/db/schema').leaves;
  let getLeaveBalance: typeof import('@/lib/leaves/leaves-server').getLeaveBalance;
  let formatLeaveDaysLabel: typeof import('@/lib/leaves/leaves-server').formatLeaveDaysLabel;
  let createLeave: typeof import('@/lib/leaves/leaves-actions').createLeave;
  let getSession: ReturnType<typeof vi.fn>;

  const fixture = {
    employeeId: '' as string,
    leaveId: '' as string,
  };

  beforeAll(async () => {
    ({ db } = await import('@/lib/db'));
    ({ employees, leaveBalances, leaves } = await import('@/lib/db/schema'));
    ({ getLeaveBalance, formatLeaveDaysLabel } = await import('@/lib/leaves/leaves-server'));
    ({ createLeave } = await import('@/lib/leaves/leaves-actions'));
    ({ getSession } = (await import('@/lib/session')) as unknown as {
      getSession: ReturnType<typeof vi.fn>;
    });

    const [employee] = await db
      .insert(employees)
      .values({
        fullName: 'Agent L Leave Test',
        firstName: 'Agent',
        initials: 'AL',
      })
      .returning({ id: employees.id });
    if (!employee) throw new Error('Failed to insert test employee');
    fixture.employeeId = employee.id;

    await db.insert(leaveBalances).values({
      employeeId: fixture.employeeId,
      year: 2099,
      acquiredDays: 12.5,
      takenDays: 3,
    });
  });

  afterAll(async () => {
    if (fixture.leaveId) {
      await db.delete(leaves).where(eq(leaves.id, fixture.leaveId));
    }
    if (fixture.employeeId) {
      await db.delete(leaveBalances).where(eq(leaveBalances.employeeId, fixture.employeeId));
      await db.delete(employees).where(eq(employees.id, fixture.employeeId));
    }
  });

  it('formats fractional days with a French decimal comma', () => {
    // Arrange
    const days = 18.5;

    // Act
    const label = formatLeaveDaysLabel(days);

    // Assert
    expect(label).toBe('18,5 j');
  });

  it('formats whole days without a decimal', () => {
    // Arrange
    const days = 9;

    // Act
    const label = formatLeaveDaysLabel(days);

    // Assert
    expect(label).toBe('9 j');
  });

  it('returns null when no leave_balances row exists for the year', async () => {
    // Arrange
    // Act
    const balance = await getLeaveBalance(fixture.employeeId, 1900);

    // Assert
    expect(balance).toBeNull();
  });

  it('reads acquired and taken days from leave_balances', async () => {
    // Arrange
    // Act
    const balance = await getLeaveBalance(fixture.employeeId, 2099);

    // Assert
    expect(balance).toEqual({
      year: 2099,
      acquiredDays: 12.5,
      takenDays: 3,
    });
  });

  it('persists a leave request with ISO dates and session employeeId', async () => {
    // Arrange
    getSession.mockResolvedValue({
      role: 'staff',
      employeeId: fixture.employeeId,
      user: {
        name: 'Agent L Leave Test',
        firstName: 'Agent',
        initials: 'AL',
        department: 'Dev',
      },
    });
    const formData = new FormData();
    formData.set('type', 'Congé payé');
    formData.set('fromDate', '2026-09-08');
    formData.set('toDate', '2026-09-12');
    formData.set('days', '5');
    formData.set('note', 'integration');

    // Act
    const result = await createLeave(formData);

    // Assert
    expect(result).toEqual({ ok: true });
    const [row] = await db
      .select()
      .from(leaves)
      .where(eq(leaves.employeeId, fixture.employeeId))
      .limit(1);
    expect(row).toMatchObject({
      employeeId: fixture.employeeId,
      type: 'Congé payé',
      fromDate: '2026-09-08',
      toDate: '2026-09-12',
      days: 5,
      status: 'pending',
      note: 'integration',
    });
    if (row) fixture.leaveId = row.id;
  });

  it('rejects createLeave when the session has no employeeId', async () => {
    // Arrange
    getSession.mockResolvedValue({
      role: 'staff',
      employeeId: null,
      user: { name: '-', firstName: '', initials: '--', department: '-' },
    });
    const formData = new FormData();
    formData.set('type', 'Maladie');
    formData.set('fromDate', '2026-09-08');
    formData.set('toDate', '2026-09-09');
    formData.set('days', '1');

    // Act
    const result = await createLeave(formData);

    // Assert
    expect(result).toEqual({
      ok: false,
      code: 'leave.unauthorized',
      message: 'No employee linked to the current session.',
    });
  });
});
