import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';

const paddingClass = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export function Card({
  padding = 'md',
  dashed = false,
  className,
  children,
}: {
  readonly padding?: keyof typeof paddingClass;
  readonly dashed?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div
      className={cn(
        'bg-white',
        dashed ? 'border-line-light border border-dashed' : 'border-line-light border',
        paddingClass[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  aside,
  children,
  className,
}: {
  readonly title?: ReactNode;
  readonly aside?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
}): ReactElement {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
      {title ? <div className="min-w-0">{title}</div> : null}
      {aside}
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return <div className={cn(className)}>{children}</div>;
}

export function Surface({
  variant = 'white',
  className,
  children,
}: {
  readonly variant?: 'paper' | 'white' | 'dark' | 'dashed';
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div
      className={cn(
        variant === 'paper' && 'bg-paper',
        variant === 'white' && 'bg-white',
        variant === 'dark' && 'bg-black text-white',
        variant === 'dashed' && 'border-line-light border border-dashed bg-white',
        className,
      )}
    >
      {children}
    </div>
  );
}
