import type { ReactElement } from 'react';

import { cn } from '@/lib/cn';

export function StatusDot({
  tone = 'accent',
  className,
}: {
  readonly tone?: 'urgent' | 'accent' | 'success';
  readonly className?: string;
}): ReactElement {
  return (
    <span
      className={cn(
        'rounded-pill inline-block size-1.5 shrink-0',
        tone === 'urgent' && 'bg-danger',
        tone === 'accent' && 'bg-cyan shadow-glow-accent',
        tone === 'success' && 'bg-green shadow-glow-green',
        className,
      )}
    />
  );
}

export function Avatar({
  initials,
  size = 'md',
  className,
}: {
  readonly initials: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}): ReactElement {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-black font-mono text-white',
        size === 'sm' && 'size-7 text-[10px]',
        size === 'md' && 'size-[34px] text-[12px]',
        size === 'lg' && 'size-10 text-[13px]',
        className,
      )}
    >
      {initials}
    </div>
  );
}
