import type { ReactElement } from 'react';

import { cn } from '@/lib/cn';
import { MonoLabel } from '@/components/ui/mono-label';

/** 8-week chargeability chart for the employee file. */
export function MeterBar({
  weeks,
  className,
}: {
  readonly weeks: readonly { readonly code: string; readonly pct: number }[];
  readonly className?: string;
}): ReactElement {
  return (
    <div className={cn('flex h-40 items-end gap-3', className)}>
      {weeks.map((week) => {
        const over = week.pct > 100;
        return (
          <div key={week.code} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
            <div className="bg-track relative flex flex-1 items-end">
              <div
                className={cn('w-full', over ? 'bg-danger' : 'bg-black')}
                style={{ height: `${Math.min(100, week.pct)}%` }}
              />
            </div>
            <MonoLabel className="text-center">{week.code}</MonoLabel>
          </div>
        );
      })}
    </div>
  );
}
