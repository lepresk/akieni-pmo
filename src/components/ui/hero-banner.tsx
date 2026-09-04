import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { MonoLabel } from '@/components/ui/mono-label';

export function HeroBanner({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  readonly eyebrow?: ReactNode;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
}): ReactElement {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-4 bg-black px-6 py-5 text-white',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <MonoLabel tone="accent">{eyebrow}</MonoLabel> : null}
        <div className="mt-1 text-[22px] font-semibold tracking-tight">{title}</div>
        {description ? <div className="text-muted-2 mt-1 text-[13px]">{description}</div> : null}
      </div>
      {action}
    </div>
  );
}
