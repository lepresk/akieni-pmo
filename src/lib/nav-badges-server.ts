import { db } from '@/lib/db';
import { leaves, submissions } from '@/lib/db/schema';

/** Live counts shown as cyan chips on the sidebar navigation. Server-only. */
export async function getNavBadges(): Promise<Record<string, string>> {
  const subs = await db.select({ s: submissions.status }).from(submissions);
  const lvs = await db.select({ s: leaves.status }).from(leaves);
  const validations = subs.filter((x) => x.s === 'pending').length;
  const conges = lvs.filter((x) => x.s === 'pending').length;

  return {
    saisie: '!',
    validations: validations > 0 ? String(validations) : '',
    conges: conges > 0 ? String(conges) : '',
    capacite: '2',
    notifications: '3',
  };
}
