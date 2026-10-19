import { z } from 'zod';

export const dayHoursSchema = z.tuple([
  z.number().min(0).max(24),
  z.number().min(0).max(24),
  z.number().min(0).max(24),
  z.number().min(0).max(24),
  z.number().min(0).max(24),
  z.number().min(0).max(24),
  z.number().min(0).max(24),
]);

export const timesheetLineSchema = z
  .object({
    project: z.string().min(1).max(200),
    poste: z.string().min(1).max(120),
    activity: z.string().min(1).max(200),
    hours: dayHoursSchema,
  })
  .strict();

export const submitTimesheetInputSchema = z
  .object({
    weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    weekLabel: z.string().min(1).max(60),
    lines: z.array(timesheetLineSchema).min(1),
  })
  .strict();

export type TimesheetLineInput = z.infer<typeof timesheetLineSchema>;
export type SubmitTimesheetInput = z.infer<typeof submitTimesheetInputSchema>;

export type TimesheetActionResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code:
        | 'timesheet.invalid'
        | 'timesheet.empty'
        | 'timesheet.unauthorized'
        | 'timesheet.period_locked';
      readonly message: string;
    };
