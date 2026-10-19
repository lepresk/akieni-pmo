import type { SubmissionLine } from '@/lib/db/schema';

/** Nominal weekly capacity used for validation écart and flag recomputation. */
export const STANDARD_WEEK_HOURS = 40;

const DAY_CAP_HOURS = 8;

const WEEKDAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as const;

/**
 * Recompute validation flags from total hours and day lines.
 * Called on validate so stored flags stay consistent with the submitted week.
 */
export function recomputeSubmissionFlags(
  hours: number,
  lines: readonly SubmissionLine[],
): readonly string[] {
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  for (const line of lines) {
    for (let index = 0; index < 7; index += 1) {
      const cell = line.hours[index];
      if (typeof cell === 'number') {
        dayTotals[index] = (dayTotals[index] ?? 0) + cell;
      }
    }
  }

  const flags: string[] = [];

  if (hours !== STANDARD_WEEK_HOURS) {
    flags.push(`${hours} h saisies pour ${STANDARD_WEEK_HOURS} h de capacité`);
  }

  let emptyWeekdays = 0;
  for (let index = 0; index < WEEKDAY_LABELS.length; index += 1) {
    const dayHours = dayTotals[index] ?? 0;
    if (dayHours === 0) {
      emptyWeekdays += 1;
      continue;
    }
    if (dayHours < DAY_CAP_HOURS) {
      flags.push(`${WEEKDAY_LABELS[index]} à ${dayHours} h · sous la capacité`);
    }
  }

  if (emptyWeekdays > 0) {
    flags.push(
      emptyWeekdays === 1
        ? 'Semaine incomplète · 1 jour non saisi'
        : `Semaine incomplète · ${emptyWeekdays} jours non saisis`,
    );
  }

  return flags;
}
