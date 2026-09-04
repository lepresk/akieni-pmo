import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { type ButtonVariant } from '@/components/ui/button';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'border-cyan bg-cyan text-black font-medium px-3 py-2',
  secondary: 'border-line-light bg-white text-ink px-3 py-2 hover:bg-paper',
  ghost: 'border-transparent bg-transparent text-muted px-2 py-1 hover:text-ink',
  danger: 'border-danger bg-white text-danger px-3 py-2 hover:bg-paper',
};

export function LinkButton({
  href,
  variant = 'secondary',
  className,
  children,
}: {
  readonly href: Route | string;
  readonly variant?: ButtonVariant;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Link
      href={href as Route}
      className={cn(
        'inline-flex items-center justify-center gap-2 border text-[12px] transition-colors duration-[var(--dur-1)] ease-[var(--ease)]',
        variantClass[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
