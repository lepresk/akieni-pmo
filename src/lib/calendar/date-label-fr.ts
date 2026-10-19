/**
 * French short date labels for leave/expense display (from ISO YYYY-MM-DD).
 */

import { dayMonthFr } from '@/lib/display';

export function formatDateLabelFr(isoDate: string): string {
  return dayMonthFr(isoDate);
}
