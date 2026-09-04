import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 border text-[12px] transition-colors duration-[var(--dur-1)] ease-[var(--ease)] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'border-cyan bg-cyan text-black font-medium px-3 py-2',
        secondary: 'border-line-light bg-white text-ink px-3 py-2 hover:bg-paper',
        ghost: 'border-transparent bg-transparent text-muted px-2 py-1 hover:text-ink',
        danger: 'border-danger bg-white text-danger px-3 py-2 hover:bg-paper',
      },
    },
    defaultVariants: { variant: 'secondary' },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;

export function Button({
  variant = 'secondary',
  className,
  type = 'button',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ButtonVariant;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <button type={type} className={cn(buttonVariants({ variant }), className)} {...props}>
      {children}
    </button>
  );
}
