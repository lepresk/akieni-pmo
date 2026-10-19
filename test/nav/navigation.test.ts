import { describe, expect, it } from 'vitest';

import {
  getScreenMeta,
  SUBMISSION_WEEK_STATUS_LABELS,
  WEEK_STATUS_BADGE_KEY,
} from '@/lib/navigation';

describe('navigation screen meta', () => {
  it('uses non-numeric static labels for conges projets and notifications', () => {
    // Arrange
    const now = new Date(2026, 8, 4);

    // Act
    const conges = getScreenMeta('/conges', now);
    const projets = getScreenMeta('/projets', now);
    const notifications = getScreenMeta('/notifications', now);

    // Assert
    expect(conges).toBe('Demandes & soldes');
    expect(projets).toBe('Portefeuille');
    expect(notifications).toBe('Centre de notifications');
    expect(conges).not.toMatch(/\d/);
    expect(projets).not.toMatch(/\d/);
    expect(notifications).not.toMatch(/\d/);
  });

  it('keeps calendar-aware meta for saisie without invented backlog counts', () => {
    // Arrange
    const now = new Date(2026, 8, 4);

    // Act
    const meta = getScreenMeta('/saisie', now);

    // Assert
    expect(meta).toContain('semaine en cours');
    expect(meta).not.toMatch(/demandes|non lues/i);
  });
});

describe('submission week status labels', () => {
  it('maps every status to the French sidebar copy', () => {
    // Arrange / Act / Assert
    expect(SUBMISSION_WEEK_STATUS_LABELS.missing).toBe('Saisie à faire');
    expect(SUBMISSION_WEEK_STATUS_LABELS.pending).toBe('Saisie en cours');
    expect(SUBMISSION_WEEK_STATUS_LABELS.validated).toBe('Semaine validée');
    expect(SUBMISSION_WEEK_STATUS_LABELS.rejected).toBe('Saisie rejetée');
    expect(WEEK_STATUS_BADGE_KEY).toBe('weekStatus');
  });
});
