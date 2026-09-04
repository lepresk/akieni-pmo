import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { cn } from '@/lib/cn';

export function Tabs({
  items,
  activeKey,
  className,
}: {
  readonly items: readonly {
    readonly key: string;
    readonly label: string;
    readonly href: string;
  }[];
  readonly activeKey: string;
  readonly className?: string;
}): ReactElement {
  return (
    <div className={cn('border-line-light flex items-stretch border-b', className)}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Link
            key={item.key}
            href={item.href as Route}
            data-active={active}
            className={cn(
              'border-b-2 px-5 py-3.5 text-[13px] transition-colors duration-[var(--dur-1)] ease-[var(--ease)]',
              active
                ? 'border-cyan text-ink font-medium'
                : 'text-muted hover:text-ink border-transparent',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
