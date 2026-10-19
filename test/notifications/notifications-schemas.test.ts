import { config } from 'dotenv';
import { describe, expect, it } from 'vitest';

config({ path: '.env.local' });

import {
  markNotificationReadSchema,
  setNotificationRuleSchema,
} from '@/lib/notifications/notifications-schemas';

describe('notification schemas', () => {
  it('accepts a uuid for markNotificationRead', () => {
    // Arrange
    const input = { id: '11111111-1111-4111-8111-111111111111' };

    // Act
    const parsed = markNotificationReadSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(true);
  });

  it('rejects a non-uuid markNotificationRead id', () => {
    // Arrange
    const input = { id: 'not-a-uuid' };

    // Act
    const parsed = markNotificationReadSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });

  it('accepts setNotificationRule with enabled flag', () => {
    // Arrange
    const input = { id: '22222222-2222-4222-8222-222222222222', enabled: false };

    // Act
    const parsed = setNotificationRuleSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(true);
  });

  it('rejects setNotificationRule with extra fields', () => {
    // Arrange
    const input = {
      id: '22222222-2222-4222-8222-222222222222',
      enabled: true,
      extra: true,
    };

    // Act
    const parsed = setNotificationRuleSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });
});
