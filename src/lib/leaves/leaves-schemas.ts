import { z } from 'zod';

export const createLeaveInputSchema = z
  .object({
    type: z.enum(['Congé payé', 'Maladie', 'Sans solde', 'Récupération']),
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    days: z.number().positive().max(90),
    note: z.string().max(500).optional(),
  })
  .strict();

export type CreateLeaveInput = z.infer<typeof createLeaveInputSchema>;

export type LeaveActionResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: 'leave.invalid' | 'leave.unauthorized';
      readonly message: string;
    };
