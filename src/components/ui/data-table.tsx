import type { Route } from 'next';
import Link from 'next/link';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function DataTable({
  columns,
  minWidth = 820,
  header,
  className,
  children,
}: {
  readonly columns: string;
  readonly minWidth?: number;
  readonly header: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  const gridStyle = { gridTemplateColumns: columns } satisfies CSSProperties;
  return (
    <div className={cn('border-line-light overflow-x-auto border bg-white', className)}>
      <div style={{ minWidth }}>
        <div
          className="border-line-light bg-paper grid items-center gap-x-4 border-b px-[22px] py-3"
          style={gridStyle}
        >
          {header}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function DataTableRow({
  columns,
  href,
  className,
  children,
}: {
  readonly columns: string;
  readonly href?: Route | string;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  const gridStyle = { gridTemplateColumns: columns } satisfies CSSProperties;
  const classes = cn(
    'grid items-center gap-x-4 border-b border-line-light px-[22px] py-3.5 last:border-b-0',
    href && 'hover:bg-paper/60',
    className,
  );

  if (href) {
    return (
      <Link href={href as Route} className={classes} style={gridStyle}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes} style={gridStyle}>
      {children}
    </div>
  );
}

export function DataTableCell({
  align = 'start',
  mono = false,
  tone,
  stack = false,
  className,
  children,
}: {
  readonly align?: 'start' | 'end' | 'center';
  readonly mono?: boolean;
  readonly tone?: 'default' | 'muted' | 'danger' | 'accent';
  readonly stack?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div
      className={cn(
        'text-ink min-w-0 text-[13px]',
        align === 'end' && 'text-right',
        align === 'center' && 'text-center',
        mono && 'tracking-label text-muted font-mono text-[10px] uppercase',
        tone === 'muted' && 'text-muted',
        tone === 'danger' && 'text-danger',
        tone === 'accent' && 'text-cyan',
        stack && 'flex flex-col gap-0.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
