import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Heading } from '@/components/ui/text';

export function EmptyState({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className={cn('text-muted px-[22px] py-[22px] text-[13px]', className)}>{children}</div>
  );
}

export function Callout({
  variant = 'info',
  className,
  children,
}: {
  readonly variant?: 'info' | 'warning';
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div
      className={cn(
        'border-line-light bg-paper text-muted border border-dashed px-4 py-3 text-[13px]',
        variant === 'warning' && 'border-danger/30 text-danger',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RestrictedPanel({
  title,
  body,
  variant = 'page',
  className,
}: {
  readonly title: string;
  readonly body: string;
  readonly variant?: 'page' | 'inline';
  readonly className?: string;
}): ReactElement {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'border-line-light bg-paper text-muted border border-dashed px-5 py-6 text-[13px]',
          className,
        )}
      >
        <div className="text-ink mb-1 font-medium">{title}</div>
        {body}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-line-light mx-auto mt-10 flex max-w-[640px] flex-col items-center gap-3.5 border bg-white p-16 text-center',
        className,
      )}
    >
      <span className="text-cyan flex">
        <Icon name="lock" size={40} />
      </span>
      <Heading level={1} className="text-[22px]">
        {title}
      </Heading>
      <span className="text-muted max-w-[440px] text-[14px] leading-relaxed">{body}</span>
    </div>
  );
}
