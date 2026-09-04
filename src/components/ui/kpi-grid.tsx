import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { MonoLabel } from '@/components/ui/mono-label';
import type { Tone } from '@/components/ui/mono-label';

export function KpiGrid({
  minWidth = 200,
  className,
  children,
}: {
  readonly minWidth?: number;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div
      className={cn('border-line-light grid gap-0 border bg-white', className)}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))` }}
    >
      {children}
    </div>
  );
}

export function KpiTile({
  label,
  value,
  note,
  delta,
  deltaTone = 'muted',
  className,
}: {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly note?: ReactNode;
  readonly delta?: ReactNode;
  readonly deltaTone?: Tone;
  readonly className?: string;
}): ReactElement {
  const deltaToneClass =
    deltaTone === 'danger'
      ? 'text-danger'
      : deltaTone === 'success'
        ? 'text-green'
        : deltaTone === 'accent'
          ? 'text-cyan'
          : 'text-muted';

  return (
    <div className={cn('border-line-light border-r p-5 last:border-r-0', className)}>
      <MonoLabel>{label}</MonoLabel>
      <div className="leading-display tracking-display text-ink mt-2 text-[32px] font-semibold">
        {value}
      </div>
      {note ? <div className="text-muted mt-1 text-[12px]">{note}</div> : null}
      {delta ? <div className={cn('mt-1 text-[12px]', deltaToneClass)}>{delta}</div> : null}
    </div>
  );
}
