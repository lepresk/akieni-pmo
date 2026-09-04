import type { ReactElement } from 'react';

import { cn } from '@/lib/cn';

/** Capacite heatmap cell by load percentage bands. */
export function HeatCell({
  pct,
  className,
}: {
  readonly pct: number;
  readonly className?: string;
}): ReactElement {
  const band =
    pct > 100
      ? 'bg-[rgba(179,38,30,0.18)] text-danger'
      : pct >= 85
        ? 'bg-[rgba(18,235,214,0.18)] text-ink'
        : pct >= 60
          ? 'bg-paper text-ink'
          : 'bg-white text-muted';

  return (
    <div
      className={cn(
        'border-line-light flex min-h-10 items-center justify-center border font-mono text-[11px]',
        band,
        className,
      )}
    >
      {Math.round(pct)}%
    </div>
  );
}
