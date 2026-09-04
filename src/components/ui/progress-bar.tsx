import type { ReactElement } from 'react';

import { cn } from '@/lib/cn';

/** Horizontal progress track; width is a dynamic escape. */
export function ProgressBar({
  value,
  max = 100,
  dangerAbove = 100,
  width = 'fill',
  completeClassName = 'bg-black',
  className,
}: {
  readonly value: number;
  readonly max?: number;
  readonly dangerAbove?: number;
  readonly width?: number | 'fill';
  readonly completeClassName?: string;
  readonly className?: string;
}): ReactElement {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  // Strict greater-than matches portfolio spend coloring (overspend only when > 100%).
  const danger = value > dangerAbove;
  return (
    <div
      className={cn('bg-track h-1.5 overflow-hidden', className)}
      style={typeof width === 'number' ? { width } : { width: '100%' }}
    >
      <div
        className={cn('h-full', danger ? 'bg-danger' : completeClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
