import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function Chip({
  href,
  active = false,
  className,
  children,
  onClick,
  type = 'button',
}: {
  readonly href?: Route | string;
  readonly active?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit';
}): ReactElement {
  const classes = cn(
    'inline-flex items-center border px-3 py-1.5 font-mono text-[10px] tracking-label uppercase transition-colors',
    active
      ? 'border-black bg-black text-white'
      : 'border-line-light bg-white text-muted hover:text-ink',
    className,
  );

  if (href) {
    return (
      <Link href={href as Route} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} data-active={active}>
      {children}
    </button>
  );
}

export function ChipGroup({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}
