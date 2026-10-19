import { describe, expect, it } from 'vitest';

import {
  advanceExpenseInputSchema,
  createExpenseInputSchema,
} from '@/lib/expenses/expenses-schemas';
import { issueInvoiceInputSchema } from '@/lib/billing/billing-schemas';
import { updateCatalogActiveInputSchema } from '@/lib/referentials/referentials-schemas';

describe('Agent F Zod contracts', () => {
  it('accepts a strict issueInvoice payload', () => {
    // Arrange
    const id = '11111111-1111-4111-8111-111111111111';

    // Act
    const parsed = issueInvoiceInputSchema.safeParse({ id });

    // Assert
    expect(parsed.success).toBe(true);
  });

  it('rejects expense create without a positive amount', () => {
    // Arrange
    const payload = {
      nature: 'achat',
      projectName: 'SFEC',
      label: 'Licence',
      amount: 0,
      billable: false,
    };

    // Act
    const parsed = createExpenseInputSchema.safeParse(payload);

    // Assert
    expect(parsed.success).toBe(false);
  });

  it('accepts advanceExpense and catalog deactivate payloads', () => {
    // Arrange
    const id = '22222222-2222-4222-8222-222222222222';

    // Act
    const advance = advanceExpenseInputSchema.safeParse({ id });
    const catalog = updateCatalogActiveInputSchema.safeParse({ id, active: false });

    // Assert
    expect(advance.success).toBe(true);
    expect(catalog.success).toBe(true);
  });
});
