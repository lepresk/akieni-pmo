import { describe, expect, it } from 'vitest';

import { invoiceStatusFromSeedLabel, invoiceStatusLabel } from '@/lib/billing/billing-display';

describe('invoiceStatusLabel', () => {
  it('maps enum codes to French labels', () => {
    // Arrange
    const codes = ['draft', 'validated', 'issued', 'cancelled'] as const;

    // Act
    const labels = codes.map((code) => invoiceStatusLabel(code));

    // Assert
    expect(labels).toEqual(['Brouillon', 'Validée', 'Émise', 'Annulée']);
  });

  it('maps legacy seed labels to enum codes', () => {
    // Arrange / Act / Assert
    expect(invoiceStatusFromSeedLabel('Envoyée')).toBe('issued');
    expect(invoiceStatusFromSeedLabel('À valider')).toBe('validated');
    expect(invoiceStatusFromSeedLabel('Brouillon')).toBe('draft');
  });
});
