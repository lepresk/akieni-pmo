import type { ReactElement } from 'react';

import { DataTable, DataTableCell, DataTableRow, MonoLabel, PageSection } from '@/components/ui';
import { RESTRICTED, loadColor, pct, seniorityLabel, xaf } from '@/lib/display';
import { canSalary } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import { getTeam } from '@/lib/team/team-server';

const columns = '1.6fr 1fr 1.3fr 1fr 1fr 1.2fr';

export default async function EquipePage(): Promise<ReactElement> {
  const { role, employeeId } = await getSession();
  const rows = await getTeam(role, employeeId);
  const showSalary = canSalary(role);

  return (
    <PageSection>
      <MonoLabel>{rows.length} collaborateur(s) · Brazzaville · Pointe-Noire</MonoLabel>
      <DataTable
        columns={columns}
        minWidth={860}
        header={
          <>
            <MonoLabel>Collaborateur</MonoLabel>
            <MonoLabel>Département</MonoLabel>
            <MonoLabel>Manager N+1</MonoLabel>
            <MonoLabel>Séniorité</MonoLabel>
            <MonoLabel>Chargeabilité</MonoLabel>
            <MonoLabel className="text-right">
              {showSalary ? 'Salaire brut' : 'Salaire · restreint'}
            </MonoLabel>
          </>
        }
      >
        {rows.map((row) => (
          <DataTableRow key={row.id} columns={columns}>
            <DataTableCell className="font-medium">{row.name}</DataTableCell>
            <DataTableCell tone="muted">{row.departmentName}</DataTableCell>
            <DataTableCell>{row.managerName}</DataTableCell>
            <DataTableCell>{seniorityLabel(row.seniority)}</DataTableCell>
            <DataTableCell className="font-mono text-xs">
              {row.avgLoad !== null ? (
                <span style={{ color: loadColor(row.avgLoad) }}>{pct(row.avgLoad)}</span>
              ) : (
                <span className="text-muted">-</span>
              )}
            </DataTableCell>
            <DataTableCell
              align="end"
              tone={row.salaryGross !== null ? 'default' : 'muted'}
              className="font-mono text-xs"
            >
              {row.salaryGross !== null ? xaf(row.salaryGross) : RESTRICTED}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </PageSection>
  );
}
