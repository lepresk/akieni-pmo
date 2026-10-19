'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { activities, assignments } from '@/lib/db/schema';
import {
  type ProjectStructureActionResult,
  updateActivityProgressInputSchema,
  updateAssignmentAllocationInputSchema,
} from '@/lib/projects/project-structure-schemas';
import { canEdit } from '@/lib/rbac';
import { getSession } from '@/lib/session';

/** Update planned activity progress (0-100). Gated by canEdit. */
export async function updateActivityProgress(
  input: unknown,
): Promise<ProjectStructureActionResult> {
  const { role } = await getSession();
  if (!canEdit(role)) {
    return {
      ok: false,
      code: 'project.unauthorized',
      message: 'Not authorized to edit project structure.',
    };
  }

  const parsed = updateActivityProgressInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'project.invalid', message: 'Invalid activity progress.' };
  }

  const { activityId, progress } = parsed.data;
  const [existing] = await db
    .select({ id: activities.id, projectId: activities.projectId })
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1);

  if (!existing) {
    return { ok: false, code: 'project.not_found', message: 'Activity not found.' };
  }

  await db.update(activities).set({ progress }).where(eq(activities.id, activityId));
  revalidatePath(`/projets/${existing.projectId}`);
  return { ok: true };
}

/** Update assignment allocation percent (0-100). Gated by canEdit. */
export async function updateAssignmentAllocation(
  input: unknown,
): Promise<ProjectStructureActionResult> {
  const { role } = await getSession();
  if (!canEdit(role)) {
    return {
      ok: false,
      code: 'project.unauthorized',
      message: 'Not authorized to edit project structure.',
    };
  }

  const parsed = updateAssignmentAllocationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'project.invalid', message: 'Invalid assignment allocation.' };
  }

  const { assignmentId, allocationPct } = parsed.data;
  const [existing] = await db
    .select({ id: assignments.id, projectId: assignments.projectId })
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (!existing) {
    return { ok: false, code: 'project.not_found', message: 'Assignment not found.' };
  }

  await db.update(assignments).set({ allocationPct }).where(eq(assignments.id, assignmentId));
  revalidatePath(`/projets/${existing.projectId}`);
  return { ok: true };
}

/** Form-action adapter (Next.js form actions must return void). */
export async function updateActivityProgressForm(formData: FormData): Promise<void> {
  await updateActivityProgress({
    activityId: String(formData.get('activityId') ?? ''),
    progress: Number(formData.get('progress') ?? Number.NaN),
  });
}

/** Form-action adapter (Next.js form actions must return void). */
export async function updateAssignmentAllocationForm(formData: FormData): Promise<void> {
  await updateAssignmentAllocation({
    assignmentId: String(formData.get('assignmentId') ?? ''),
    allocationPct: Number(formData.get('allocationPct') ?? Number.NaN),
  });
}
