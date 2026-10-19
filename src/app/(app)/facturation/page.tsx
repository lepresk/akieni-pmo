import type { ReactElement } from 'react';

import {
  Badge,
  Button,
  DataTable,
  DataTableCell,
  DataTableRow,
  MonoLabel,
  RestrictedPanel,
  type Tone,
} from '@/components/ui';
import { issueInvoiceForm } from '@/lib/billing/billing-actions';
import { invoiceStatusLabel } from '@/lib/billing/billing-display';
import { getInvoices } from '@/lib/billing/billing-server';
import type { InvoiceStatus } from '@/lib/db/schema/billing';
import { canInvoice } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const COLUMNS = '0.8fr 1.8fr 1.2fr 0.8fr 0.9fr 1fr 1.2fr';

const EMPHASISED_STATUSES: readonly InvoiceStatus[] = ['validated', 'issued'];

function statusTone(status: InvoiceStatus): Tone {
  return EMPHASISED_STATUSES.includes(status) ? 'default' : 'muted';
}

export default async function FacturationPage(): Promise<ReactElement> {
  const { role } = await getSession();
  if (!canInvoice(role)) {
    return (
      <RestrictedPanel
        title="Facturation réservée à la Finance"
        body="Le module de facturation est accessible à la Finance, à la Direction et à l'Admin."
      />
    );
  }

  const rows = await getInvoices();

  return (
    <DataTable
      columns={COLUMNS}
      minWidth={960}
      header={
        <>
          <MonoLabel>Réf.</MonoLabel>
          <MonoLabel>Projet</MonoLabel>
          <MonoLabel>Client</MonoLabel>
          <MonoLabel>Modèle</MonoLabel>
          <MonoLabel>Quantité</MonoLabel>
          <MonoLabel>Montant HT</MonoLabel>
          <MonoLabel className="text-right">Statut</MonoLabel>
        </>
      }
    >
      {rows.map((row) => (
        <DataTableRow key={row.id} columns={COLUMNS}>
          <DataTableCell className="font-mono text-[12px]">{row.ref}</DataTableCell>
          <DataTableCell>{row.projectName}</DataTableCell>
          <DataTableCell tone="muted">{row.clientName}</DataTableCell>
          <DataTableCell className="text-[12px]">{row.model}</DataTableCell>
          <DataTableCell className="font-mono text-[12px]">{row.quantityLabel}</DataTableCell>
          <DataTableCell className="font-mono text-[12px]">{row.amountLabel}</DataTableCell>
          <DataTableCell align="end">
            <div className="flex items-center justify-end gap-2">
              <Badge tone={statusTone(row.status)}>{invoiceStatusLabel(row.status)}</Badge>
              {row.status === 'validated' ? (
                <form action={issueInvoiceForm} className="inline">
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" className="px-2.5 py-1.5">
                    Émettre
                  </Button>
                </form>
              ) : null}
            </div>
          </DataTableCell>
        </DataTableRow>
      ))}
    </DataTable>
  );
}
