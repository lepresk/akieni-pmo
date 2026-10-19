import './env';

import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}));

import { db } from '@/lib/db';
import { employees, submissions, type SubmissionLine } from '@/lib/db/schema';
import { getSession } from '@/lib/session';
import { submitTimesheet } from '@/lib/timesheet/timesheet-actions';
import { getTimesheetWeekDraft } from '@/lib/timesheet/timesheet-server';
import { normalizeSubmissionLine } from '@/lib/timesheet/normalize-submission-line';

const WEEK_START = '2026-08-31';
const WEEK_LABEL = 'S36 · 31 août → 6 sept.';

function buildFormData(lines: unknown): FormData {
  const formData = new FormData();
  formData.set('mondayIso', WEEK_START);
  formData.set('weekLabel', WEEK_LABEL);
  formData.set('rows', JSON.stringify(lines));
  return formData;
}

describe('submitTimesheet', () => {
  let employeeId: string;
  let managerId: string;

  beforeAll(async () => {
    const [manager] = await db
      .insert(employees)
      .values({ fullName: 'Test Manager', firstName: 'Manager', initials: 'TM' })
      .returning({ id: employees.id });
    if (!manager) throw new Error('Failed to insert manager');
    managerId = manager.id;

    const [employee] = await db
      .insert(employees)
      .values({
        fullName: 'Test Staff',
        firstName: 'Staff',
        initials: 'TS',
        managerId,
      })
      .returning({ id: employees.id });
    if (!employee) throw new Error('Failed to insert employee');
    employeeId = employee.id;
  });

  beforeEach(async () => {
    await db.delete(submissions).where(eq(submissions.employeeId, employeeId));
    vi.mocked(getSession).mockResolvedValue({
      role: 'staff',
      employeeId,
      user: {
        name: 'Test Staff',
        firstName: 'Staff',
        initials: 'TS',
        department: 'Dev',
      },
    });
  });

  afterAll(async () => {
    await db.delete(submissions).where(eq(submissions.employeeId, employeeId));
    await db.delete(employees).where(eq(employees.id, employeeId));
    await db.delete(employees).where(eq(employees.id, managerId));
  });

  it('persists day-hour lines for a pending weekly submission', async () => {
    // Arrange
    const lines = [
      {
        project: 'Demo · Alpha',
        poste: 'Développement',
        activity: 'API métier',
        hours: [8, 8, 8, 8, 8, 0, 0],
      },
    ];

    // Act
    const result = await submitTimesheet(buildFormData(lines));

    // Assert
    expect(result).toEqual({ ok: true });
    const [row] = await db.select().from(submissions).where(eq(submissions.employeeId, employeeId));
    expect(row).toBeDefined();
    expect(row?.weekStart).toBe(WEEK_START);
    expect(row?.status).toBe('pending');
    expect(row?.hours).toBe(40);
    expect(row?.billable).toBe(40);
    expect(row?.lines).toEqual(lines);
  });

  it('rejects submission when the week is already validated', async () => {
    // Arrange
    await db.insert(submissions).values({
      employeeId,
      personName: 'Test Staff',
      department: 'Dev',
      managerName: 'Test Manager',
      weekStart: WEEK_START,
      weekLabel: WEEK_LABEL,
      hours: 8,
      billable: 8,
      status: 'validated',
      motif: null,
      flags: [],
      lines: [
        {
          project: 'Demo · Alpha',
          poste: 'Développement',
          activity: 'API métier',
          hours: [8, 0, 0, 0, 0, 0, 0],
        },
      ],
    });
    const lines = [
      {
        project: 'Demo · Alpha',
        poste: 'Développement',
        activity: 'API métier',
        hours: [4, 4, 4, 4, 4, 0, 0],
      },
    ];

    // Act
    const result = await submitTimesheet(buildFormData(lines));

    // Assert
    expect(result).toEqual({
      ok: false,
      code: 'timesheet.period_locked',
      message: 'This week is already validated.',
    });
    const [row] = await db.select().from(submissions).where(eq(submissions.employeeId, employeeId));
    expect(row?.status).toBe('validated');
    expect(row?.hours).toBe(8);
  });

  it('rejects an empty timesheet payload', async () => {
    // Arrange
    const lines = [
      {
        project: 'Demo · Alpha',
        poste: 'Développement',
        activity: 'API métier',
        hours: [0, 0, 0, 0, 0, 0, 0],
      },
    ];

    // Act
    const result = await submitTimesheet(buildFormData(lines));

    // Assert
    expect(result).toEqual({
      ok: false,
      code: 'timesheet.empty',
      message: 'No hours to submit.',
    });
    const rows = await db.select().from(submissions).where(eq(submissions.employeeId, employeeId));
    expect(rows).toHaveLength(0);
  });

  it('rejects submit when the session has no employee', async () => {
    // Arrange
    vi.mocked(getSession).mockResolvedValue({
      role: 'staff',
      employeeId: null,
      user: {
        name: '-',
        firstName: '',
        initials: '--',
        department: '-',
      },
    });
    const lines = [
      {
        project: 'Demo · Alpha',
        poste: 'Développement',
        activity: 'API métier',
        hours: [8, 0, 0, 0, 0, 0, 0],
      },
    ];

    // Act
    const result = await submitTimesheet(buildFormData(lines));

    // Assert
    expect(result).toEqual({
      ok: false,
      code: 'timesheet.unauthorized',
      message: 'Not authorized to submit a timesheet.',
    });
    const rows = await db.select().from(submissions).where(eq(submissions.employeeId, employeeId));
    expect(rows).toHaveLength(0);
  });

  it('upserts an existing pending submission for the same week', async () => {
    // Arrange
    await db.insert(submissions).values({
      employeeId,
      personName: 'Test Staff',
      department: 'Dev',
      managerName: 'Test Manager',
      weekStart: WEEK_START,
      weekLabel: WEEK_LABEL,
      hours: 8,
      billable: 8,
      status: 'pending',
      motif: null,
      flags: [],
      lines: [
        {
          project: 'Demo · Alpha',
          poste: 'Développement',
          activity: 'API métier',
          hours: [8, 0, 0, 0, 0, 0, 0],
        },
      ],
    });
    const lines = [
      {
        project: 'Demo · Beta',
        poste: 'Recette / QA',
        activity: 'Tests',
        hours: [7, 7, 7, 7, 7, 0, 0],
      },
    ];

    // Act
    const result = await submitTimesheet(buildFormData(lines));

    // Assert
    expect(result).toEqual({ ok: true });
    const rows = await db.select().from(submissions).where(eq(submissions.employeeId, employeeId));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.hours).toBe(35);
    expect(rows[0]?.lines).toEqual(lines);
  });
});

describe('getTimesheetWeekDraft', () => {
  let employeeId: string;

  beforeAll(async () => {
    const [employee] = await db
      .insert(employees)
      .values({ fullName: 'Draft Staff', firstName: 'Draft', initials: 'DS' })
      .returning({ id: employees.id });
    if (!employee) throw new Error('Failed to insert draft employee');
    employeeId = employee.id;
  });

  beforeEach(async () => {
    await db.delete(submissions).where(eq(submissions.employeeId, employeeId));
  });

  afterAll(async () => {
    await db.delete(submissions).where(eq(submissions.employeeId, employeeId));
    await db.delete(employees).where(eq(employees.id, employeeId));
  });

  it('returns normalized pending lines for the requested week', async () => {
    // Arrange
    await db.insert(submissions).values({
      employeeId,
      personName: 'Draft Staff',
      department: 'Dev',
      managerName: '-',
      weekStart: WEEK_START,
      weekLabel: WEEK_LABEL,
      hours: 16,
      billable: 16,
      status: 'pending',
      motif: null,
      flags: [],
      lines: [
        {
          project: 'Demo · Alpha',
          poste: 'Développement',
          activity: 'API métier',
          hours: [8, 8, 0, 0, 0, 0, 0],
        },
      ],
    });

    // Act
    const draft = await getTimesheetWeekDraft(employeeId, WEEK_START);

    // Assert
    expect(draft).toEqual([
      {
        project: 'Demo · Alpha',
        poste: 'Développement',
        activity: 'API métier',
        hours: [8, 8, 0, 0, 0, 0, 0],
      },
    ]);
  });

  it('returns an empty array when only a validated submission exists', async () => {
    // Arrange
    await db.insert(submissions).values({
      employeeId,
      personName: 'Draft Staff',
      department: 'Dev',
      managerName: '-',
      weekStart: WEEK_START,
      weekLabel: WEEK_LABEL,
      hours: 8,
      billable: 8,
      status: 'validated',
      motif: null,
      flags: [],
      lines: [
        {
          project: 'Demo · Alpha',
          poste: 'Développement',
          activity: 'API métier',
          hours: [8, 0, 0, 0, 0, 0, 0],
        },
      ],
    });

    // Act
    const draft = await getTimesheetWeekDraft(employeeId, WEEK_START);

    // Assert
    expect(draft).toEqual([]);
  });

  it('normalizes legacy scalar hours through the draft loader', async () => {
    // Arrange
    await db.insert(submissions).values({
      employeeId,
      personName: 'Draft Staff',
      department: 'Dev',
      managerName: '-',
      weekStart: WEEK_START,
      weekLabel: WEEK_LABEL,
      hours: 8,
      billable: 8,
      status: 'pending',
      motif: null,
      flags: [],
      lines: [
        {
          project: 'Demo · Alpha',
          poste: 'Développement',
          task: 'Legacy task',
          hours: 8,
        },
      ] as unknown as SubmissionLine[],
    });

    // Act
    const draft = await getTimesheetWeekDraft(employeeId, WEEK_START);

    // Assert
    expect(draft).toEqual([
      normalizeSubmissionLine({
        project: 'Demo · Alpha',
        poste: 'Développement',
        task: 'Legacy task',
        hours: 8,
      }),
    ]);
  });
});
