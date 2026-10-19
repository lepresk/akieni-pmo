'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { costCenterCatalog } from '@/lib/db/schema';
import { canRef } from '@/lib/rbac';
import {
  updateCatalogActiveInputSchema,
  type ReferentialsActionResult,
} from '@/lib/referentials/referentials-schemas';
import { getSession } from '@/lib/session';

/** Set cost_center_catalog.active (typically false to deactivate a poste). */
export async function updateCatalogActive(raw: unknown): Promise<ReferentialsActionResult> {
  const { role } = await getSession();
  if (!canRef(role)) {
    return {
      ok: false,
      code: 'referential.unauthorized',
      message: 'Referentials administration is restricted.',
    };
  }

  const parsed = updateCatalogActiveInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: 'referential.invalid', message: 'Invalid catalog update.' };
  }

  const [row] = await db
    .select({ id: costCenterCatalog.id })
    .from(costCenterCatalog)
    .where(eq(costCenterCatalog.id, parsed.data.id))
    .limit(1);

  if (!row) {
    return { ok: false, code: 'referential.not_found', message: 'Catalog entry not found.' };
  }

  await db
    .update(costCenterCatalog)
    .set({ active: parsed.data.active })
    .where(eq(costCenterCatalog.id, row.id));
  revalidatePath('/referentiels');
  return { ok: true };
}

/** Form-action adapter to deactivate a catalog poste. */
export async function deactivateCatalogForm(formData: FormData): Promise<void> {
  await updateCatalogActive({
    id: String(formData.get('id') ?? ''),
    active: false,
  });
}
