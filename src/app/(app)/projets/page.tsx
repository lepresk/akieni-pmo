import type { ReactElement } from 'react';

import { DataTable, DataTableCell, DataTableRow, MonoLabel, ProgressBar } from '@/components/ui';
import { marginColor, marginFromCostLoad, modelLabel, pct, segmentLabel } from '@/lib/display';
import { getPortfolio } from '@/lib/projects/projects-server';
import { canMargin } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const columns = '1.8fr 1.3fr 0.8fr 1.2fr 1.4fr 0.9fr';

export default async function ProjetsPage(): Promise<ReactElement> {
  const { role, employeeId } = await getSession();
  const rows = await getPortfolio(role, employeeId);
  const showMargin = canMargin(role);

  return (
    <DataTable
      columns={columns}
      minWidth={900}
      header={
        <>
          <MonoLabel>Projet</MonoLabel>
          <MonoLabel>Client</MonoLabel>
          <MonoLabel>Segment</MonoLabel>
          <MonoLabel>Chef de projet</MonoLabel>
          <MonoLabel>Budget consommé</MonoLabel>
          <MonoLabel className="text-right">{showMargin ? 'Marge' : 'TJM projet moy.'}</MonoLabel>
        </>
      }
    >
      {rows.map((row) => {
        const spentPct = row.budgetDays > 0 ? (row.spentDays / row.budgetDays) * 100 : 0;
        return (
          <DataTableRow key={row.id} columns={columns} href={`/projets/${row.id}`}>
            <DataTableCell stack>
              <span className="font-medium">{row.name}</span>
              <span className="text-muted font-mono text-[11px]">
                {row.code} · {modelLabel(row.model)}
              </span>
            </DataTableCell>
            <DataTableCell>{row.clientName}</DataTableCell>
            <DataTableCell tone="muted" className="text-xs">
              {segmentLabel(row.segment)}
            </DataTableCell>
            <DataTableCell>{row.pmName}</DataTableCell>
            <DataTableCell className="flex items-center gap-2.5">
              <ProgressBar value={spentPct} className="min-w-[80px] flex-1" />
              <span className="w-[40px] text-right font-mono text-xs">{pct(spentPct)}</span>
            </DataTableCell>
            <DataTableCell align="end" className="font-mono text-xs">
              {showMargin && row.costLoad !== null ? (
                <span style={{ color: marginColor(row.costLoad) }}>
                  {marginFromCostLoad(row.costLoad)} %
                </span>
              ) : (
                <span className="text-muted">-</span>
              )}
            </DataTableCell>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
