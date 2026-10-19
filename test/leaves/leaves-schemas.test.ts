import { describe, expect, it } from 'vitest';

import { createLeaveInputSchema } from '@/lib/leaves/leaves-schemas';

describe('createLeaveInputSchema', () => {
  it('accepts a valid ISO leave request', () => {
    // Arrange
    const input = {
      type: 'Congé payé' as const,
      fromDate: '2026-08-12',
      toDate: '2026-08-23',
      days: 8,
      note: 'été',
    };

    // Act
    const parsed = createLeaveInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(true);
  });

  it('rejects a non-ISO fromDate', () => {
    // Arrange
    const input = {
      type: 'Maladie',
      fromDate: '12 août',
      toDate: '2026-08-23',
      days: 2,
    };

    // Act
    const parsed = createLeaveInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });

  it('rejects Congé sans solde label that is not the enum value', () => {
    // Arrange
    const input = {
      type: 'Congé sans solde',
      fromDate: '2026-08-12',
      toDate: '2026-08-13',
      days: 1,
    };

    // Act
    const parsed = createLeaveInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });
});
