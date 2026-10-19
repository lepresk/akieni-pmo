/**
 * Map activity week indices onto ISO week codes from plan_load.
 * Pure display helper - no I/O.
 */

/**
 * Resolve a plan week index to its ISO week code.
 * Out-of-range indices clamp to the nearest available code.
 */
export function resolvePlanWeekLabel(weekCodes: readonly string[], weekIndex: number): string {
  if (weekCodes.length === 0) return '-';
  const clamped = Math.max(0, Math.min(weekIndex, weekCodes.length - 1));
  return weekCodes[clamped] ?? '-';
}
