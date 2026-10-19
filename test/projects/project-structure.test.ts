import { describe, expect, it } from 'vitest';

import { resolvePlanWeekLabel } from '@/lib/capacity/plan-week-label';
import {
  updateActivityProgressInputSchema,
  updateAssignmentAllocationInputSchema,
} from '@/lib/projects/project-structure-schemas';

describe('project structure schemas', () => {
  it('accepts a valid activity progress update', () => {
    // Arrange
    const input = {
      activityId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      progress: 75,
    };

    // Act
    const parsed = updateActivityProgressInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.progress).toBe(75);
    }
  });

  it('rejects progress outside 0..100', () => {
    // Arrange
    const input = {
      activityId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      progress: 101,
    };

    // Act
    const parsed = updateActivityProgressInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });

  it('rejects extra fields on activity progress input', () => {
    // Arrange
    const input = {
      activityId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      progress: 50,
      extra: true,
    };

    // Act
    const parsed = updateActivityProgressInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });

  it('accepts a valid assignment allocation update', () => {
    // Arrange
    const input = {
      assignmentId: '11111111-2222-4333-8444-555555555555',
      allocationPct: 40,
    };

    // Act
    const parsed = updateAssignmentAllocationInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.allocationPct).toBe(40);
    }
  });

  it('rejects allocation outside 0..100', () => {
    // Arrange
    const input = {
      assignmentId: '11111111-2222-4333-8444-555555555555',
      allocationPct: -1,
    };

    // Act
    const parsed = updateAssignmentAllocationInputSchema.safeParse(input);

    // Assert
    expect(parsed.success).toBe(false);
  });
});

describe('resolvePlanWeekLabel', () => {
  it('maps week indices to ISO week codes from plan_load', () => {
    // Arrange
    const codes = ['S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42', 'S43'] as const;

    // Act
    const from = resolvePlanWeekLabel(codes, 0);
    const mid = resolvePlanWeekLabel(codes, 4);
    const end = resolvePlanWeekLabel(codes, 7);

    // Assert
    expect(from).toBe('S36');
    expect(mid).toBe('S40');
    expect(end).toBe('S43');
  });

  it('clamps out-of-range indices instead of inventing S{31+n}', () => {
    // Arrange
    const codes = ['S36', 'S37', 'S38'] as const;

    // Act
    const high = resolvePlanWeekLabel(codes, 8);
    const low = resolvePlanWeekLabel(codes, -1);
    const empty = resolvePlanWeekLabel([], 0);

    // Assert
    expect(high).toBe('S38');
    expect(low).toBe('S36');
    expect(empty).toBe('-');
  });
});
