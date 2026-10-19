import { describe, expect, it } from 'vitest';

import type { SubmissionLine } from '@/lib/db/schema';
import { STANDARD_WEEK_HOURS, recomputeSubmissionFlags } from '@/lib/validations/submission-flags';

describe('recomputeSubmissionFlags', () => {
  it('exports STANDARD_WEEK_HOURS as 40', () => {
    // Arrange / Act / Assert
    expect(STANDARD_WEEK_HOURS).toBe(40);
  });

  it('flags a week above capacity', () => {
    // Arrange
    const lines: readonly SubmissionLine[] = [
      {
        project: 'SFEC',
        poste: 'Dev',
        activity: 'API',
        hours: [8, 8, 8, 8, 8, 5, 0],
      },
    ];

    // Act
    const flags = recomputeSubmissionFlags(45, lines);

    // Assert
    expect(flags).toContain('45 h saisies pour 40 h de capacité');
  });

  it('flags under-capacity weekdays and incomplete weeks', () => {
    // Arrange
    const lines: readonly SubmissionLine[] = [
      {
        project: 'SFEC',
        poste: 'Dev',
        activity: 'API',
        hours: [8, 8, 8, 4, 0, 0, 0],
      },
    ];

    // Act
    const flags = recomputeSubmissionFlags(28, lines);

    // Assert
    expect(flags).toContain('Jeudi à 4 h · sous la capacité');
    expect(flags).toContain('Semaine incomplète · 1 jour non saisi');
  });
});
