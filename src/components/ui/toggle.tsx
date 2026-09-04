'use client';

import type { ReactElement } from 'react';

import { cn } from '@/lib/cn';

/** Accessible toggle switch for notification rules. */
export function Toggle({
  pressed,
  onPressedChange,
  'aria-label': ariaLabel,
  className,
}: {
  readonly pressed: boolean;
  readonly onPressedChange: (next: boolean) => void;
  readonly 'aria-label': string;
  readonly className?: string;
}): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={ariaLabel}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'rounded-pill relative h-5 w-9 shrink-0 border transition-colors',
        pressed ? 'border-cyan bg-cyan' : 'border-line-light bg-track',
        className,
      )}
    >
      <span
        className={cn(
          'rounded-pill absolute top-0.5 size-3.5 bg-white transition-transform',
          pressed ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
