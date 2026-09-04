import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { MonoLabel } from '@/components/ui/mono-label';

/** Bordered flex-wrap form toolbar used by create/amend flows. */
export function FormRow({
  label,
  action,
  className,
  children,
}: {
  readonly label?: string;
  readonly action?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div
      className={cn(
        'border-line-light flex flex-wrap items-end gap-3 border bg-white p-4',
        className,
      )}
    >
      {label ? (
        <div className="mb-1 w-full">
          <MonoLabel>{label}</MonoLabel>
        </div>
      ) : null}
      {children}
      {action ? <div className="ml-auto flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
