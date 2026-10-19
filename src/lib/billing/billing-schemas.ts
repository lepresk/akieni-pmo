import { z } from 'zod';

export const issueInvoiceInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export type IssueInvoiceInput = z.infer<typeof issueInvoiceInputSchema>;

export type BillingActionResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: 'billing.invalid' | 'billing.unauthorized' | 'billing.not_found';
      readonly message: string;
    };
