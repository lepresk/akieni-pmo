import type { ReactElement } from 'react';

import { SaisieGrid } from '@/components/timesheet/saisie-grid';
import { getProjectOptions } from '@/lib/timesheet/timesheet-server';

export default async function SaisiePage(): Promise<ReactElement> {
  const options = await getProjectOptions();
  return <SaisieGrid options={options} />;
}
