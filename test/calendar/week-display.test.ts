import { describe, expect, it } from 'vitest';

import {
  getWeekSnapshot,
  isoWeekAndYear,
  shiftWeekSnapshot,
  startOfIsoWeek,
  toLocalIsoDate,
} from '@/lib/calendar/week-display';

describe('week-display', () => {
  it('starts the ISO week on Monday for a Thursday', () => {
    // Arrange
    const thursday = new Date(2026, 8, 3);

    // Act
    const monday = startOfIsoWeek(thursday);

    // Assert
    expect(toLocalIsoDate(monday)).toBe('2026-08-31');
    expect(monday.getDay()).toBe(1);
  });

  it('computes the ISO week number for early September 2026', () => {
    // Arrange
    const thursday = new Date(2026, 8, 3);

    // Act
    const { week, year } = isoWeekAndYear(thursday);

    // Assert
    expect(year).toBe(2026);
    expect(week).toBe(36);
  });

  it('builds a seven-day snapshot with today highlighted', () => {
    // Arrange
    const thursday = new Date(2026, 8, 3);

    // Act
    const snap = getWeekSnapshot(thursday);

    // Assert
    expect(snap.days).toHaveLength(7);
    expect(snap.days[0]?.key).toBe('LUN');
    expect(snap.days[0]?.iso).toBe('2026-08-31');
    expect(snap.days[6]?.iso).toBe('2026-09-06');
    expect(snap.todayIndex).toBe(3);
    expect(snap.shortLabel).toBe('S36');
    expect(snap.rangeLabel).toContain('S36');
  });

  it('shifts forward and backward by whole weeks', () => {
    // Arrange
    const snap = getWeekSnapshot(new Date(2026, 8, 3));

    // Act
    const next = shiftWeekSnapshot(snap.mondayIso, 1);
    const prev = shiftWeekSnapshot(snap.mondayIso, -1);

    // Assert
    expect(next.mondayIso).toBe('2026-09-07');
    expect(prev.mondayIso).toBe('2026-08-24');
  });
});
