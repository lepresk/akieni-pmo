import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { StatusDot } from '@/components/ui/dot';

export function List({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className={cn('border-line-light flex flex-col gap-0 border bg-white', className)}>
      {children}
    </div>
  );
}

export function ListItem({
  href,
  urgent = false,
  title,
  detail,
  trailing,
  className,
  children,
}: {
  readonly href?: Route | string;
  readonly urgent?: boolean;
  readonly title: ReactNode;
  readonly detail?: ReactNode;
  readonly trailing?: ReactNode;
  readonly className?: string;
  readonly children?: ReactNode;
}): ReactElement {
  const body = (
    <>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <StatusDot tone={urgent ? 'urgent' : 'accent'} className="mt-1.5" />
        <div className="min-w-0">
          <div className="text-ink text-[14px] font-medium">{title}</div>
          {detail ? <div className="text-muted mt-0.5 text-[12px]">{detail}</div> : null}
          {children}
        </div>
      </div>
      {trailing}
    </>
  );

  const classes = cn(
    'flex items-center gap-4 border-b border-line-light px-5 py-4 last:border-b-0',
    href && 'hover:bg-paper/60',
    className,
  );

  if (href) {
    return (
      <Link href={href as Route} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}

export function KvList({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return <div className={cn('flex flex-col gap-0', className)}>{children}</div>;
}

export function KvRow({
  label,
  value,
  tone = 'default',
  strong = false,
  className,
}: {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly tone?: 'default' | 'muted' | 'danger';
  readonly strong?: boolean;
  readonly className?: string;
}): ReactElement {
  return (
    <div
      className={cn(
        'border-line-light flex items-center justify-between gap-4 border-b py-2.5 text-[13px] last:border-b-0',
        className,
      )}
    >
      <span className="text-muted">{label}</span>
      <span
        className={cn(
          strong && 'font-medium',
          tone === 'muted' && 'text-muted',
          tone === 'danger' && 'text-danger',
          tone === 'default' && 'text-ink',
        )}
      >
        {value}
      </span>
    </div>
  );
}
