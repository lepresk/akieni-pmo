import type { ReactElement } from 'react';

import {
  Button,
  Callout,
  EmptyState,
  FormRow,
  Input,
  KpiGrid,
  KpiTile,
  List,
  PageSection,
  Select,
  StatusBadge,
} from '@/components/ui';
import { approveLeave, createLeaveForm, refuseLeave } from '@/lib/leaves/leaves-actions';
import { formatLeaveDaysLabel, getLeaveBalance, getLeaves } from '@/lib/leaves/leaves-server';
import { canApproveLeave } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const STATUS_LABELS = {
  pending: 'En attente',
  validated: 'Validé',
  rejected: 'Refusé',
} as const satisfies Record<'pending' | 'validated' | 'rejected', string>;

export default async function CongesPage(): Promise<ReactElement> {
  const { role, employeeId } = await getSession();
  const { rows, pending } = await getLeaves();
  const balance = await getLeaveBalance(employeeId);
  const canAct = canApproveLeave(role);

  const kpis: readonly { readonly label: string; readonly value: string }[] = [
    {
      label: 'Solde acquis',
      value: balance ? formatLeaveDaysLabel(balance.acquiredDays) : '-',
    },
    {
      label: 'Pris cette année',
      value: balance ? formatLeaveDaysLabel(balance.takenDays) : '-',
    },
    { label: 'En attente N+1', value: String(pending) },
  ];

  return (
    <PageSection>
      <KpiGrid>
        {kpis.map((kpi) => (
          <KpiTile
            key={kpi.label}
            label={kpi.label}
            value={<span className="text-[30px]">{kpi.value}</span>}
            className="px-[22px] py-5"
          />
        ))}
      </KpiGrid>

      {!balance && <Callout className="mx-[22px]">Aucun solde enregistré.</Callout>}

      <form action={createLeaveForm}>
        <FormRow label="Demander un congé" className="items-center px-[22px]">
          <Select name="type" defaultValue="Congé payé">
            <option value="Congé payé">Congé payé</option>
            <option value="Maladie">Maladie</option>
            <option value="Sans solde">Sans solde</option>
            <option value="Récupération">Récupération</option>
          </Select>
          <Input name="fromDate" type="date" required width={150} aria-label="Date de début" />
          <Input name="toDate" type="date" required width={150} aria-label="Date de fin" />
          <Input
            name="days"
            type="number"
            min={0.5}
            step={0.5}
            placeholder="Jours"
            width={90}
            required
          />
          <Input name="note" placeholder="Note (optionnel)" className="min-w-0 flex-[1_1_160px]" />
          <Button type="submit" variant="primary" className="px-4 py-[9px] text-[13px]">
            Demander
          </Button>
        </FormRow>
      </form>

      {rows.length === 0 ? (
        <EmptyState>Aucune demande de congé.</EmptyState>
      ) : (
        <List>
          {rows.map((row) => (
            <div
              key={row.id}
              className="border-line-light flex flex-wrap items-center gap-4 border-b px-[22px] py-4 last:border-b-0"
            >
              <div className="min-w-0 flex-[1_1_260px]">
                <div className="text-ink text-[14px] font-medium">{row.personName}</div>
                <div className="text-muted text-[12px]">
                  {row.type} · {row.fromLabel} → {row.toLabel} · {row.days} j
                </div>
                {row.note && <div className="text-muted mt-1 text-[12px]">{row.note}</div>}
              </div>
              <StatusBadge status={row.status} label={STATUS_LABELS[row.status]} />
              {canAct && row.status === 'pending' && (
                <div className="flex gap-2">
                  <form action={approveLeave}>
                    <input type="hidden" name="id" value={row.id} />
                    <Button type="submit" variant="primary" className="px-3.5 py-2 text-[13px]">
                      Valider
                    </Button>
                  </form>
                  <form action={refuseLeave}>
                    <input type="hidden" name="id" value={row.id} />
                    <Button type="submit" variant="danger" className="px-3.5 py-2 text-[13px]">
                      Refuser
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </List>
      )}
    </PageSection>
  );
}
