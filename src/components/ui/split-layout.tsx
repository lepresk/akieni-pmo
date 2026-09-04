import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function SplitLayout({
  primary,
  secondary,
  ratio = '1.5/1',
  className,
}: {
  readonly primary: ReactNode;
  readonly secondary: ReactNode;
  readonly ratio?: '1.5/1' | '1/1.3' | '1/1';
  readonly className?: string;
}): ReactElement {
  return (
    <div
      className={cn(
        'grid gap-[20px]',
        ratio === '1.5/1' && 'grid-cols-[1.5fr_1fr]',
        ratio === '1/1.3' && 'grid-cols-[1fr_1.3fr]',
        ratio === '1/1' && 'grid-cols-2',
        'max-lg:grid-cols-1',
        className,
      )}
    >
      <div className="min-w-0">{primary}</div>
      <div className="min-w-0">{secondary}</div>
    </div>
  );
}

export function Stack({
  gap = 16,
  className,
  children,
}: {
  readonly gap?: 8 | 12 | 16 | 20 | 24;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  // Prefer explicit px for 20/24: @theme remaps spacing-5/6 to --s-5/--s-6 (24px/32px).
  return (
    <div
      className={cn(
        'flex flex-col',
        gap === 8 && 'gap-2',
        gap === 12 && 'gap-3',
        gap === 16 && 'gap-4',
        gap === 20 && 'gap-[20px]',
        gap === 24 && 'gap-[24px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageSection({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return <section className={cn('flex flex-col gap-4', className)}>{children}</section>;
}
