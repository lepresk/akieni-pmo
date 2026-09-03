import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { marginColor, marginFromCostLoad, modelLabel, pct, segmentLabel } from '@/lib/display';
import { getPortfolio } from '@/lib/projects/projects-server';
import { canMargin } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const monoHeader = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

const columns = '1.8fr 1.3fr 0.8fr 1.2fr 1.4fr 0.9fr';

export default async function ProjetsPage(): Promise<ReactElement> {
  const { role, employeeId } = await getSession();
  const rows = await getPortfolio(role, employeeId);
  const showMargin = canMargin(role);

  return (
    <div
      style={{
        border: '1px solid var(--line-light)',
        background: 'var(--white)',
        overflowX: 'auto',
      }}
    >
      <div style={{ minWidth: 900 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: columns,
            columnGap: 16,
            padding: '12px 22px',
            borderBottom: '1px solid var(--line-light)',
            background: 'var(--paper)',
            ...monoHeader,
          }}
        >
          <span>Projet</span>
          <span>Client</span>
          <span>Segment</span>
          <span>Chef de projet</span>
          <span>Budget consommé</span>
          <span style={{ textAlign: 'right' }}>{showMargin ? 'Marge' : 'TJM projet moy.'}</span>
        </div>

        {rows.map((row) => {
          const spentPct = row.budgetDays > 0 ? (row.spentDays / row.budgetDays) * 100 : 0;
          return (
            <Link
              key={row.id}
              href={`/projets/${row.id}` as Route}
              style={{
                display: 'grid',
                gridTemplateColumns: columns,
                columnGap: 16,
                padding: '14px 22px',
                borderBottom: '1px solid var(--line-light)',
                alignItems: 'center',
                color: 'inherit',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{row.name}</span>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}
                >
                  {row.code} · {modelLabel(row.model)}
                </span>
              </span>
              <span style={{ fontSize: 13 }}>{row.clientName}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {segmentLabel(row.segment)}
              </span>
              <span style={{ fontSize: 13 }}>{row.pmName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    position: 'relative',
                    flex: 1,
                    height: 6,
                    background: '#efefec',
                    minWidth: 80,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      inset: '0 auto 0 0',
                      width: `${Math.min(100, spentPct)}%`,
                      background: spentPct > 100 ? '#b3261e' : 'var(--black)',
                    }}
                  />
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    width: 40,
                    textAlign: 'right',
                  }}
                >
                  {pct(spentPct)}
                </span>
              </span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {showMargin && row.costLoad !== null ? (
                  <span style={{ color: marginColor(row.costLoad) }}>
                    {marginFromCostLoad(row.costLoad)} %
                  </span>
                ) : (
                  <span style={{ color: 'var(--muted)' }}>-</span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
