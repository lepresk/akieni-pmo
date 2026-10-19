/**
 * Normalize legacy or partial submission line payloads into the day-hours shape.
 */

import type { SubmissionLine } from '@/lib/db/schema/transactions';

const EMPTY_WEEK = [0, 0, 0, 0, 0, 0, 0] as const;

function isDayTuple(value: unknown): value is SubmissionLine['hours'] {
  return (
    Array.isArray(value) &&
    value.length === 7 &&
    value.every((cell) => typeof cell === 'number' && Number.isFinite(cell))
  );
}

/** Coerce a raw JSON line (legacy scalar hours + task, or new shape) to SubmissionLine. */
export function normalizeSubmissionLine(raw: unknown): SubmissionLine | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const project = String(record['project'] ?? '').trim();
  const poste = String(record['poste'] ?? '').trim();
  const activity = String(record['activity'] ?? record['task'] ?? '').trim();
  if (!project || !poste) return null;

  const hoursRaw = record['hours'];
  if (isDayTuple(hoursRaw)) {
    return {
      project,
      poste,
      activity: activity || 'Saisie',
      hours: [
        hoursRaw[0],
        hoursRaw[1],
        hoursRaw[2],
        hoursRaw[3],
        hoursRaw[4],
        hoursRaw[5],
        hoursRaw[6],
      ],
    };
  }

  const total = Number(hoursRaw ?? 0);
  if (!Number.isFinite(total) || total < 0) {
    return { project, poste, activity: activity || 'Saisie', hours: [...EMPTY_WEEK] };
  }

  // Legacy seed: put the weekly total on Monday so sum(hours) stays correct.
  return {
    project,
    poste,
    activity: activity || 'Saisie',
    hours: [total, 0, 0, 0, 0, 0, 0],
  };
}

export function sumLineHours(line: SubmissionLine): number {
  return line.hours.reduce((sum, cell) => sum + cell, 0);
}
