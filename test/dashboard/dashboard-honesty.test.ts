import { describe, expect, it } from 'vitest';

/**
 * Pure contract checks for dashboard honesty (no invented KPI / queue literals).
 * Server integration against Postgres lives with coordinator smoke when DB is available.
 */

describe('dashboard honesty contract', () => {
  it('forbids the retired fake jours-a-saisir KPI literal', async () => {
    // Arrange
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('../../src/lib/dashboard/dashboard-server.ts', import.meta.url), 'utf8'),
    );

    // Act / Assert
    expect(source).not.toMatch(/value:\s*'3'/);
    expect(source).not.toMatch(/Jours à saisir/);
  });

  it('gates timesheet queue on missing week status', async () => {
    // Arrange
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('../../src/lib/dashboard/dashboard-server.ts', import.meta.url), 'utf8'),
    );

    // Act / Assert
    expect(source).toMatch(/weekStatus === 'missing'/);
    expect(source).toMatch(/pendingValidations > 0/);
    expect(source).toMatch(/draftInvoiceCount > 0/);
  });
});
