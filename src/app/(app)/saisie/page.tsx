import type { ReactElement } from 'react';

import { SaisieGrid } from '@/components/timesheet/saisie-grid';
import { getWeekSnapshot } from '@/lib/calendar/week-display';
import { getSession } from '@/lib/session';
import { getProjectOptions, getTimesheetWeekDraft } from '@/lib/timesheet/timesheet-server';

export default async function SaisiePage(): Promise<ReactElement> {
  const options = await getProjectOptions();
  const initialWeek = getWeekSnapshot();
  const { employeeId } = await getSession();
  const initialRows = employeeId
    ? await getTimesheetWeekDraft(employeeId, initialWeek.mondayIso)
    : [];

  return <SaisieGrid options={options} initialWeek={initialWeek} initialRows={initialRows} />;
}
