import type { ReactElement } from 'react';

import {
  Badge,
  Callout,
  DataTable,
  DataTableCell,
  DataTableRow,
  MonoLabel,
  PageSection,
  RestrictedPanel,
} from '@/components/ui';
import { getAudit } from '@/lib/audit/audit-server';
import { canAudit } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const COLUMNS = '1.2fr 1.2fr 1fr 1.6fr 1.8fr 1fr';

export default async function AuditPage(): Promise<ReactElement> {
  const { role } = await getSession();
  if (!canAudit(role)) {
    return (
      <RestrictedPanel
        title="Journal réservé à la Direction"
        body="Le journal d'audit trace les accès aux données sensibles. Il n'est consultable que par la Direction et l'Admin."
      />
    );
  }

  const rows = await getAudit();

  return (
    <PageSection>
      <Callout className="leading-relaxed">
        Toute lecture d&apos;un salaire, d&apos;un TJM de référence ou d&apos;une marge est
        journalisée avec l&apos;auteur, le rôle et l&apos;horodatage. Conservation 5 ans.
      </Callout>
      <DataTable
        columns={COLUMNS}
        minWidth={900}
        header={
          <>
            <MonoLabel>Horodatage</MonoLabel>
            <MonoLabel>Auteur</MonoLabel>
            <MonoLabel>Rôle</MonoLabel>
            <MonoLabel>Action</MonoLabel>
            <MonoLabel>Objet</MonoLabel>
            <MonoLabel className="text-right">Nature</MonoLabel>
          </>
        }
      >
        {rows.map((row) => (
          <DataTableRow key={row.id} columns={COLUMNS}>
            <DataTableCell tone="muted" className="font-mono text-[12px]">
              {row.at}
            </DataTableCell>
            <DataTableCell className="font-medium">{row.who}</DataTableCell>
            <DataTableCell tone="muted" className="text-[12px]">
              {row.role}
            </DataTableCell>
            <DataTableCell>{row.action}</DataTableCell>
            <DataTableCell tone="muted" className="text-[12px]">
              {row.target}
            </DataTableCell>
            <DataTableCell align="end">
              <Badge tone={row.sensitive ? 'danger' : 'muted'}>
                {row.sensitive ? 'Donnée sensible' : 'Standard'}
              </Badge>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </PageSection>
  );
}
