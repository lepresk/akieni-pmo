import type { ReactElement } from 'react';

import {
  Badge,
  Button,
  Card,
  DataTable,
  DataTableCell,
  DataTableRow,
  MonoLabel,
  RestrictedPanel,
  Stack,
  Surface,
  Tabs,
  Text,
} from '@/components/ui';
import { RESTRICTED, dateSlash, dayMonthFr, seniorityLabel, xaf } from '@/lib/display';
import { canRef, canSalary } from '@/lib/rbac';
import { deactivateCatalogForm } from '@/lib/referentials/referentials-actions';
import {
  getCostCenterCatalog,
  getHolidays,
  getRateGrid,
} from '@/lib/referentials/referentials-server';
import { getSession } from '@/lib/session';

type Tab = 'postes' | 'rates' | 'calendrier';

const TABS: readonly { readonly key: Tab; readonly label: string; readonly href: string }[] = [
  { key: 'postes', label: 'Postes de coût', href: '/referentiels?tab=postes' },
  { key: 'rates', label: 'Grille de TJM', href: '/referentiels?tab=rates' },
  { key: 'calendrier', label: 'Calendrier', href: '/referentiels?tab=calendrier' },
];

const POSTES_COLUMNS = '2fr 1fr 1fr 1fr';
const RATES_COLUMNS = '1.2fr 1fr 1fr 1fr 1fr';
const HOLIDAYS_COLUMNS = '120px 1fr';

export default async function ReferentielsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly tab?: string }>;
}): Promise<ReactElement> {
  const { role } = await getSession();

  if (!canRef(role)) {
    return (
      <RestrictedPanel
        title="Administration réservée"
        body="Les référentiels - postes de coût, grille de TJM, calendrier - sont administrés par l'Admin, le PMO, la Finance et la Direction."
      />
    );
  }

  const requested = (await searchParams).tab;
  const tab: Tab = requested === 'rates' || requested === 'calendrier' ? requested : 'postes';
  const showCost = canSalary(role);

  const [postes, rates, holidays] = await Promise.all([
    tab === 'postes' ? getCostCenterCatalog() : Promise.resolve([]),
    tab === 'rates' ? getRateGrid() : Promise.resolve([]),
    tab === 'calendrier' ? getHolidays() : Promise.resolve([]),
  ]);

  return (
    <Card padding="none">
      <Tabs items={TABS} activeKey={tab} />

      {tab === 'postes' && (
        <DataTable
          className="border-0"
          columns={POSTES_COLUMNS}
          minWidth={0}
          header={
            <>
              <MonoLabel>Poste de coût</MonoLabel>
              <MonoLabel>Nature</MonoLabel>
              <MonoLabel>Utilisation</MonoLabel>
              <MonoLabel className="text-right">Action</MonoLabel>
            </>
          }
        >
          {postes.map((c) => (
            <DataTableRow key={c.id} columns={POSTES_COLUMNS}>
              <DataTableCell>{c.label}</DataTableCell>
              <DataTableCell tone={c.billable ? 'default' : 'muted'} className="text-[12px]">
                {c.billable ? 'Facturable' : 'Non facturable'}
              </DataTableCell>
              <DataTableCell tone="muted" className="font-mono text-[12px]">
                {c.usage} projet{c.usage > 1 ? 's' : ''}
              </DataTableCell>
              <DataTableCell align="end">
                <form action={deactivateCatalogForm} className="inline">
                  <input type="hidden" name="id" value={c.id} />
                  <Button type="submit" className="px-[11px] py-1.5">
                    Désactiver
                  </Button>
                </form>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      )}

      {tab === 'rates' && (
        <DataTable
          className="border-0"
          columns={RATES_COLUMNS}
          minWidth={0}
          header={
            <>
              <MonoLabel>Séniorité</MonoLabel>
              <MonoLabel>Coût chargé / j</MonoLabel>
              <MonoLabel>Prix de vente / j</MonoLabel>
              <MonoLabel>En vigueur depuis</MonoLabel>
              <MonoLabel className="text-right">État</MonoLabel>
            </>
          }
        >
          {rates.map((r, index) => (
            <DataTableRow
              key={`${r.seniority}-${r.effectiveFrom}-${index}`}
              columns={RATES_COLUMNS}
            >
              <DataTableCell className="font-medium">{seniorityLabel(r.seniority)}</DataTableCell>
              <DataTableCell
                tone={showCost ? 'default' : 'muted'}
                className="font-mono text-[12px]"
              >
                {showCost ? xaf(r.costPerDay) : RESTRICTED}
              </DataTableCell>
              <DataTableCell className="font-mono text-[12px]">{xaf(r.sellPerDay)}</DataTableCell>
              <DataTableCell tone="muted" className="font-mono text-[12px]">
                {dateSlash(r.effectiveFrom)}
              </DataTableCell>
              <DataTableCell align="end">
                <Badge tone={r.isCurrent ? 'success' : 'muted'} filled={r.isCurrent}>
                  {r.isCurrent ? 'En vigueur' : 'Historique'}
                </Badge>
              </DataTableCell>
            </DataTableRow>
          ))}
          <Surface
            variant="paper"
            className="text-muted px-[22px] py-3.5 text-[12px] leading-relaxed"
          >
            Un taux est daté : les changements ne réécrivent jamais les périodes déjà facturées.
          </Surface>
        </DataTable>
      )}

      {tab === 'calendrier' && (
        <Stack gap={16} className="px-[22px] py-5">
          <Text as="p" tone="muted" className="m-0 max-w-[620px] text-[13px] leading-relaxed">
            Capacité de référence 8 h/j. Les jours fériés et les congés validés sortent du calcul de
            chargeabilité.
          </Text>
          <DataTable
            columns={HOLIDAYS_COLUMNS}
            minWidth={0}
            header={
              <>
                <MonoLabel>Date</MonoLabel>
                <MonoLabel>Jour férié · République du Congo</MonoLabel>
              </>
            }
          >
            {holidays.map((h) => (
              <DataTableRow key={h.observedOn} columns={HOLIDAYS_COLUMNS}>
                <DataTableCell className="font-mono text-[12px]">
                  {dayMonthFr(h.observedOn)}
                </DataTableCell>
                <DataTableCell>{h.label}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </Stack>
      )}
    </Card>
  );
}
