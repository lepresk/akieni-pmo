import type { ReactElement } from 'react';

import { getPlan } from '@/lib/capacity/capacity-server';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

function cellStyle(pct: number): { background: string; color: string } {
  if (pct > 100) return { background: 'rgba(179,38,30,.12)', color: '#b3261e' };
  if (pct >= 85) return { background: 'rgba(56,240,115,.14)', color: 'var(--ink)' };
  if (pct >= 60) return { background: 'rgba(18,235,214,.12)', color: 'var(--ink)' };
  return { background: 'transparent', color: 'var(--muted)' };
}

export default async function CapacitePage(): Promise<ReactElement> {
  const { weekCodes, rows } = await getPlan();
  const template = `1.6fr repeat(${weekCodes.length}, 1fr) 0.8fr`;

  const legend: readonly { readonly label: string; readonly bg: string }[] = [
    { label: 'Optimal 85-100', bg: 'rgba(56,240,115,.14)' },
    { label: 'Sous-booké 60-85', bg: 'rgba(18,235,214,.12)' },
    { label: 'Bench < 60', bg: 'transparent' },
    { label: 'Overbooké > 100', bg: 'rgba(179,38,30,.12)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
          overflowX: 'auto',
        }}
      >
        <div style={{ minWidth: 820 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: template,
              padding: '12px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
              ...mono,
            }}
          >
            <span>Collaborateur</span>
            {weekCodes.map((code) => (
              <span key={code} style={{ textAlign: 'center' }}>
                {code}
              </span>
            ))}
            <span style={{ textAlign: 'right' }}>Moy.</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.employeeId}
              style={{
                display: 'grid',
                gridTemplateColumns: template,
                padding: '10px 22px',
                borderBottom: '1px solid var(--line-light)',
                alignItems: 'center',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{row.name}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{row.department}</span>
              </span>
              {row.weeks.map((week) => {
                const style = cellStyle(week.pct);
                return (
                  <span
                    key={week.code}
                    style={{
                      textAlign: 'center',
                      margin: '0 3px',
                      padding: '6px 0',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      background: style.background,
                      color: style.color,
                    }}
                  >
                    {week.pct}
                  </span>
                );
              })}
              <span
                style={{
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: cellStyle(row.avg).color,
                }}
              >
                {row.avg} %
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {legend.map((item) => (
          <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, ...mono }}>
            <span
              style={{
                width: 12,
                height: 12,
                background: item.bg,
                border: '1px solid var(--line-light)',
              }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
