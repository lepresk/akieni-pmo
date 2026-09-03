import type { ReactElement } from 'react';

import { pct } from '@/lib/display';
import { getReporting } from '@/lib/reporting/reporting-server';
import { getSession } from '@/lib/session';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

function Card({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactElement;
}): ReactElement {
  return (
    <div
      style={{
        border: '1px solid var(--line-light)',
        background: 'var(--white)',
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <span style={mono}>{title}</span>
      {children}
    </div>
  );
}

export default async function ReportingPage(): Promise<ReactElement> {
  const { role } = await getSession();
  const { charge, marginPortfolio, budget } = await getReporting(role);
  const budgetPct = budget.budgetDays > 0 ? (budget.spentDays / budget.budgetDays) * 100 : 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      <Card title="Chargeabilité moyenne">
        <>
          <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.045em' }}>
            {charge.average} %
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Cible 85 % sur 8 semaines glissantes
          </span>
        </>
      </Card>

      <Card title="Allocation des équipes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Overbookés</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#b3261e' }}>
              {charge.overbooked}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Optimal</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{charge.optimal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Sous-bookés</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{charge.under}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bench</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              {charge.bench}
            </span>
          </div>
        </div>
      </Card>

      <Card title="Budget vs réel (portefeuille)">
        <>
          <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.045em' }}>
            {pct(budgetPct)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {budget.spentDays} j consommés / {budget.budgetDays} j budgétés
          </span>
        </>
      </Card>

      {marginPortfolio !== null && (
        <Card title="Marge portefeuille">
          <>
            <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.045em' }}>
              {marginPortfolio} %
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Moyenne des projets facturables (1 - coût)
            </span>
          </>
        </Card>
      )}
    </div>
  );
}
