import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type Tone = 'default' | 'muted' | 'danger' | 'success' | 'accent' | 'onDark';

const toneClass: Record<Tone, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  danger: 'text-danger',
  success: 'text-green',
  accent: 'text-cyan',
  onDark: 'text-white',
};

/** Uppercase mono label used across screens. */
export function MonoLabel({
  tone = 'muted',
  className,
  children,
}: {
  readonly tone?: Tone;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <span
      className={cn('tracking-label font-mono text-[10px] uppercase', toneClass[tone], className)}
    >
      {children}
    </span>
  );
}
