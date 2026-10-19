import { z } from 'zod';

export const createExpenseInputSchema = z
  .object({
    nature: z.enum(['achat', 'mission']),
    projectName: z.string().min(1).max(200),
    sub: z.string().max(160).optional(),
    poste: z.string().max(120).optional(),
    label: z.string().min(1).max(200),
    supplier: z.string().max(160).optional(),
    amount: z.number().int().positive(),
    billable: z.boolean().default(false),
    expenseDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict();

export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

export const advanceExpenseInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export type AdvanceExpenseInput = z.infer<typeof advanceExpenseInputSchema>;

export type ExpenseActionResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: 'expense.invalid' | 'expense.unauthorized';
      readonly message: string;
    };
