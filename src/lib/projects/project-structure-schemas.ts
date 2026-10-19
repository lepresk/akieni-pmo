import { z } from 'zod';

export const updateActivityProgressInputSchema = z
  .object({
    activityId: z.string().uuid(),
    progress: z.number().int().min(0).max(100),
  })
  .strict();

export const updateAssignmentAllocationInputSchema = z
  .object({
    assignmentId: z.string().uuid(),
    allocationPct: z.number().int().min(0).max(100),
  })
  .strict();

export type UpdateActivityProgressInput = z.infer<typeof updateActivityProgressInputSchema>;
export type UpdateAssignmentAllocationInput = z.infer<typeof updateAssignmentAllocationInputSchema>;

export type ProjectStructureActionResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: 'project.invalid' | 'project.unauthorized' | 'project.not_found';
      readonly message: string;
    };
