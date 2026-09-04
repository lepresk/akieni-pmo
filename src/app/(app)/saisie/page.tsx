import type { ReactElement } from 'react';

import { SaisieGrid } from '@/components/timesheet/saisie-grid';
import { getWeekSnapshot } from '@/lib/calendar/week-display';
import { getProjectOptions } from '@/lib/timesheet/timesheet-server';

export default async function SaisiePage(): Promise<ReactElement> {
  const options = await getProjectOptions();
  const initialWeek = getWeekSnapshot();
  return <SaisieGrid options={options} initialWeek={initialWeek} />;
}
