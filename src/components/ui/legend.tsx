import type { ReactElement } from 'react';

import { cn } from '@/lib/cn';

export function Legend({
  items,
  className,
}: {
  readonly items: readonly { readonly label: string; readonly swatchClass: string }[];
  readonly className?: string;
}): ReactElement {
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {items.map((item) => (
        <div key={item.label} className="text-muted flex items-center gap-2 text-[12px]">
          <span className={cn('border-line-light size-3 border', item.swatchClass)} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
