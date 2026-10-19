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

describe('notification feed and rules persistence', () => {
  let db: typeof import('@/lib/db').db;
  let employees: typeof import('@/lib/db/schema').employees;
  let users: typeof import('@/lib/db/schema').users;
  let notifications: typeof import('@/lib/db/schema').notifications;
  let notificationRules: typeof import('@/lib/db/schema').notificationRules;
  let listNotifications: typeof import('@/lib/notifications/notifications-server').listNotifications;
  let listNotificationRules: typeof import('@/lib/notifications/notifications-server').listNotificationRules;
  let markNotificationRead: typeof import('@/lib/notifications/notifications-actions').markNotificationRead;
  let setNotificationRule: typeof import('@/lib/notifications/notifications-actions').setNotificationRule;
  let getSession: ReturnType<typeof vi.fn>;

  const fixture = {
    employeeId: '' as string,
    userId: '' as string,
    notificationId: '' as string,
    ruleId: '' as string,
  };

  beforeAll(async () => {
    ({ db } = await import('@/lib/db'));
    ({ employees, users, notifications, notificationRules } = await import('@/lib/db/schema'));
    ({ listNotifications, listNotificationRules } =
      await import('@/lib/notifications/notifications-server'));
    ({ markNotificationRead, setNotificationRule } =
      await import('@/lib/notifications/notifications-actions'));
    ({ getSession } = (await import('@/lib/session')) as unknown as {
      getSession: ReturnType<typeof vi.fn>;
    });

    const [employee] = await db
      .insert(employees)
      .values({
        fullName: 'Agent L Notif Test',
        firstName: 'Notif',
        initials: 'NT',
      })
      .returning({ id: employees.id });
    if (!employee) throw new Error('Failed to insert test employee');
    fixture.employeeId = employee.id;

    const [user] = await db
      .insert(users)
      .values({
        email: `agent-l-notif-${Date.now()}@akieni.test`,
        role: 'staff',
        employeeId: fixture.employeeId,
      })
      .returning({ id: users.id });
    if (!user) throw new Error('Failed to insert test user');
    fixture.userId = user.id;

    const [notif] = await db
      .insert(notifications)
      .values({
        userId: fixture.userId,
        title: 'Test reminder',
        body: 'Body from DB',
        channel: 'E-mail',
        href: null,
        readAt: null,
      })
      .returning({ id: notifications.id });
    if (!notif) throw new Error('Failed to insert test notification');
    fixture.notificationId = notif.id;

    const [rule] = await db
      .insert(notificationRules)
      .values({
        userId: fixture.userId,
        key: 'timesheet_due',
        label: 'Rappel saisie non soumise',
        enabled: true,
      })
      .returning({ id: notificationRules.id });
    if (!rule) throw new Error('Failed to insert test rule');
    fixture.ruleId = rule.id;

    getSession.mockResolvedValue({
      role: 'staff',
      employeeId: fixture.employeeId,
      user: {
        name: 'Agent L Notif Test',
        firstName: 'Notif',
        initials: 'NT',
        department: 'Dev',
      },
    });
  });

  afterAll(async () => {
    if (fixture.userId) {
      await db.delete(notifications).where(eq(notifications.userId, fixture.userId));
      await db.delete(notificationRules).where(eq(notificationRules.userId, fixture.userId));
      await db.delete(users).where(eq(users.id, fixture.userId));
    }
    if (fixture.employeeId) {
      await db.delete(employees).where(eq(employees.id, fixture.employeeId));
    }
  });

  it('lists notifications from the database for the session user', async () => {
    // Arrange
    // Act
    const feed = await listNotifications();

    // Assert
    expect(feed.some((row) => row.id === fixture.notificationId)).toBe(true);
    const mine = feed.find((row) => row.id === fixture.notificationId);
    expect(mine).toMatchObject({
      title: 'Test reminder',
      body: 'Body from DB',
      channel: 'E-mail',
      readAt: null,
    });
  });

  it('marks a notification as read and persists readAt', async () => {
    // Arrange
    // Act
    const result = await markNotificationRead({ id: fixture.notificationId });

    // Assert
    expect(result).toEqual({ ok: true });
    const [row] = await db
      .select({ readAt: notifications.readAt })
      .from(notifications)
      .where(eq(notifications.id, fixture.notificationId))
      .limit(1);
    expect(row?.readAt).toBeInstanceOf(Date);
  });

  it('lists notification rules from the database', async () => {
    // Arrange
    // Act
    const rules = await listNotificationRules();

    // Assert
    const mine = rules.find((row) => row.id === fixture.ruleId);
    expect(mine).toEqual({
      id: fixture.ruleId,
      key: 'timesheet_due',
      label: 'Rappel saisie non soumise',
      enabled: true,
    });
  });

  it('persists a notification rule toggle', async () => {
    // Arrange
    // Act
    const result = await setNotificationRule({ id: fixture.ruleId, enabled: false });

    // Assert
    expect(result).toEqual({ ok: true });
    const [row] = await db
      .select({ enabled: notificationRules.enabled })
      .from(notificationRules)
      .where(eq(notificationRules.id, fixture.ruleId))
      .limit(1);
    expect(row?.enabled).toBe(false);
  });
});
