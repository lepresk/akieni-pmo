import type { ReactElement } from 'react';

import { Card, MonoLabel, Stack, Text } from '@/components/ui';
import { pct } from '@/lib/display';
import { getReporting } from '@/lib/reporting/reporting-server';
import { getSession } from '@/lib/session';

export default async function ReportingPage(): Promise<ReactElement> {
  const { role } = await getSession();
  const { charge, marginPortfolio, budget } = await getReporting(role);
  const budgetPct = budget.budgetDays > 0 ? (budget.spentDays / budget.budgetDays) * 100 : 0;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      <Card padding="none" className="p-[22px]">
        <Stack gap={12}>
          <MonoLabel>Chargeabilité moyenne</MonoLabel>
          <Text size="display" weight={600}>
            {charge.average} %
          </Text>
          <Text size="xs" tone="muted">
            Cible 85 % sur 8 semaines glissantes
          </Text>
        </Stack>
      </Card>

      <Card padding="none" className="p-[22px]">
        <Stack gap={12}>
          <MonoLabel>Allocation des équipes</MonoLabel>
          <Stack gap={8} className="gap-1.5 text-[13px]">
            <div className="flex justify-between">
              <span>Overbookés</span>
              <span className="text-danger font-mono">{charge.overbooked}</span>
            </div>
            <div className="flex justify-between">
              <span>Optimal</span>
              <span className="font-mono">{charge.optimal}</span>
            </div>
            <div className="flex justify-between">
              <span>Sous-bookés</span>
              <span className="font-mono">{charge.under}</span>
            </div>
            <div className="flex justify-between">
              <span>Bench</span>
              <span className="text-muted font-mono">{charge.bench}</span>
            </div>
          </Stack>
        </Stack>
      </Card>

      <Card padding="none" className="p-[22px]">
        <Stack gap={12}>
          <MonoLabel>Budget vs réel (portefeuille)</MonoLabel>
          <Text size="display" weight={600}>
            {pct(budgetPct)}
          </Text>
          <Text size="xs" tone="muted">
            {budget.spentDays} j consommés / {budget.budgetDays} j budgétés
          </Text>
        </Stack>
      </Card>

      {marginPortfolio !== null && (
        <Card padding="none" className="p-[22px]">
          <Stack gap={12}>
            <MonoLabel>Marge portefeuille</MonoLabel>
            <Text size="display" weight={600}>
              {marginPortfolio} %
            </Text>
            <Text size="xs" tone="muted">
              Moyenne des projets facturables (1 - coût)
            </Text>
          </Stack>
        </Card>
      )}
    </div>
  );
}
