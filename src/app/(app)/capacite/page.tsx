import type { CSSProperties, ReactElement } from 'react';

import { HeatCell, Legend, MonoLabel, PageSection } from '@/components/ui';
import { cn } from '@/lib/cn';
import { getPlan } from '@/lib/capacity/capacity-server';

function avgTone(pct: number): string {
  if (pct > 100) return 'text-danger';
  if (pct >= 60) return 'text-ink';
  return 'text-muted';
}

export default async function CapacitePage(): Promise<ReactElement> {
  const { weekCodes, rows } = await getPlan();
  const template = `1.6fr repeat(${weekCodes.length}, 1fr) 0.8fr`;
  const gridStyle = { gridTemplateColumns: template } satisfies CSSProperties;

  return (
    <PageSection>
      <div className="border-line-light overflow-x-auto border bg-white">
        <div className="min-w-[820px]">
          <div
            className="border-line-light bg-paper tracking-label text-muted grid items-center gap-x-0 border-b px-[22px] py-3 font-mono text-[10px] uppercase"
            style={gridStyle}
          >
            <span>Collaborateur</span>
            {weekCodes.map((code) => (
              <span key={code} className="text-center">
                {code}
              </span>
            ))}
            <span className="text-right">Moy.</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.employeeId}
              className="border-line-light grid items-center border-b px-[22px] py-2.5"
              style={gridStyle}
            >
              <span className="flex flex-col">
                <span className="text-[13px] font-medium">{row.name}</span>
                <span className="text-muted text-[11px]">{row.department}</span>
              </span>
              {row.weeks.map((week) => (
                <HeatCell key={week.code} pct={week.pct} className="mx-0.5 border-0 py-1.5" />
              ))}
              <span
                className={cn('text-right font-mono text-[12px] font-medium', avgTone(row.avg))}
              >
                {row.avg} %
              </span>
            </div>
          ))}
        </div>
      </div>
      <Legend
        items={[
          { label: 'Optimal 85-100', swatchClass: 'bg-[rgba(56,240,115,0.14)]' },
          { label: 'Sous-booké 60-85', swatchClass: 'bg-[rgba(18,235,214,0.12)]' },
          { label: 'Bench < 60', swatchClass: 'bg-white' },
          { label: 'Overbooké > 100', swatchClass: 'bg-[rgba(179,38,30,0.12)]' },
        ]}
      />
      <MonoLabel className="sr-only">Légende capacité</MonoLabel>
    </PageSection>
  );
}
