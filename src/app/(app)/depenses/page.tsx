import type { ReactElement } from 'react';

import {
  Button,
  CheckboxField,
  Chip,
  ChipGroup,
  DataTable,
  DataTableCell,
  DataTableRow,
  FormRow,
  Input,
  KpiGrid,
  KpiTile,
  PageSection,
  RestrictedPanel,
  Select,
  StatusBadge,
} from '@/components/ui';
import { xaf } from '@/lib/display';
import { advanceExpense, createExpense } from '@/lib/expenses/expenses-actions';
import { getExpenses, type ExpenseView } from '@/lib/expenses/expenses-server';
import { canExpense } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import { getProjectOptions } from '@/lib/timesheet/timesheet-server';

const columns = '2fr 1.3fr 1fr 1fr 0.9fr 0.9fr';

const FILTERS: readonly { readonly key: string; readonly label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'engage', label: 'Engagé' },
  { key: 'facture', label: 'Facturé' },
  { key: 'paye', label: 'Payé' },
  { key: 'refacturable', label: 'Refacturable' },
];

function matches(row: ExpenseView, filter: string): boolean {
  if (filter === 'refacturable') return row.billable;
  if (filter === 'engage' || filter === 'facture' || filter === 'paye') return row.state === filter;
  return true;
}

export default async function DepensesPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly state?: string }>;
}): Promise<ReactElement> {
  const { role } = await getSession();
  if (!canExpense(role)) {
    return (
      <RestrictedPanel
        title="Saisie réservée à la comptabilité"
        body="Le registre des dépenses projet est accessible à la Finance, au PMO, à la Direction et à l'Admin."
      />
    );
  }

  const { rows, kpis } = await getExpenses();
  const options = await getProjectOptions();
  const filter = (await searchParams).state ?? 'all';
  const filtered = rows.filter((row) => matches(row, filter));

  const tiles = [
    { label: 'Engagé · non facturé', value: kpis.engage, note: 'bons de commande émis' },
    { label: 'Facturé fournisseur', value: kpis.facture, note: 'en attente de paiement' },
    { label: 'Payé', value: kpis.paye, note: 'sorties de trésorerie' },
    { label: 'Refacturable client', value: kpis.refacturable, note: 'à reporter en pré-facture' },
  ];

  return (
    <PageSection>
      <KpiGrid minWidth={220}>
        {tiles.map((tile) => (
          <KpiTile
            key={tile.label}
            label={tile.label}
            value={<span className="font-mono text-[18px] tracking-normal">{xaf(tile.value)}</span>}
            note={<span className="text-[11px]">{tile.note}</span>}
            className="px-[22px] py-5"
          />
        ))}
      </KpiGrid>

      <form action={createExpense}>
        <FormRow label="Saisir une dépense" className="items-center px-[22px]">
          <Select name="projectName">
            {options.map((option) => (
              <option key={option.project} value={option.project}>
                {option.project}
              </option>
            ))}
          </Select>
          <Select name="nature">
            <option value="achat">Achat & sous-traitance</option>
            <option value="mission">Frais de mission</option>
          </Select>
          <Input name="label" placeholder="Libellé" className="min-w-0 flex-[1_1_180px]" />
          <Input name="supplier" placeholder="Fournisseur" />
          <Input name="amount" type="number" min={0} placeholder="Montant XAF" width={140} />
          <Input name="date" placeholder="Date (ex. 29 juil.)" width={130} />
          <Select name="state">
            <option value="engage">Engagé</option>
            <option value="facture">Facturé</option>
            <option value="paye">Payé</option>
          </Select>
          <CheckboxField name="billable" label="Refacturable" className="text-muted text-[12px]" />
          <Button type="submit" variant="primary" className="px-4 py-[9px] text-[13px]">
            Enregistrer
          </Button>
        </FormRow>
      </form>

      <ChipGroup>
        {FILTERS.map((f) => (
          <Chip key={f.key} href={`/depenses?state=${f.key}`} active={filter === f.key}>
            {f.label}
          </Chip>
        ))}
      </ChipGroup>

      <DataTable
        columns={columns}
        minWidth={940}
        header={
          <>
            <DataTableCell mono>Charge</DataTableCell>
            <DataTableCell mono>Projet · périmètre</DataTableCell>
            <DataTableCell mono>Montant</DataTableCell>
            <DataTableCell mono>Refacturation</DataTableCell>
            <DataTableCell mono>État</DataTableCell>
            <DataTableCell mono align="end">
              Action
            </DataTableCell>
          </>
        }
      >
        {filtered.map((row) => (
          <DataTableRow key={row.id} columns={columns}>
            <DataTableCell stack>
              <span>{row.label}</span>
              <span className="text-muted text-[11px]">
                {row.supplier ?? '-'} · {row.dateLabel ?? '-'} · {row.poste ?? '-'}
              </span>
            </DataTableCell>
            <DataTableCell className="text-[12px]">
              {row.projectName}
              {row.sub && row.sub !== '—' ? ` · ${row.sub}` : ''}
            </DataTableCell>
            <DataTableCell className="font-mono text-[12px]">{xaf(row.amount)}</DataTableCell>
            <DataTableCell className={`text-[12px] ${row.billable ? 'text-ink' : 'text-muted'}`}>
              {row.billable ? 'Refacturable' : 'À notre charge'}
            </DataTableCell>
            <DataTableCell>
              <StatusBadge status={row.state} />
            </DataTableCell>
            <DataTableCell align="end">
              {row.state !== 'paye' && (
                <form action={advanceExpense} className="inline">
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" className="px-2.5 py-1.5">
                    {row.state === 'engage' ? '→ Facturer' : '→ Payer'}
                  </Button>
                </form>
              )}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </PageSection>
  );
}
