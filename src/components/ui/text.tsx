import type { ElementType, ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import type { Tone } from '@/components/ui/mono-label';

const sizeClass = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  display: 'text-[40px] leading-display tracking-display',
} as const;

const toneClass: Record<Tone, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  danger: 'text-danger',
  success: 'text-green',
  accent: 'text-cyan',
  onDark: 'text-white',
};

export function Text({
  as: Tag = 'span',
  size = 'sm',
  weight = 400,
  tone = 'default',
  className,
  children,
}: {
  readonly as?: ElementType;
  readonly size?: keyof typeof sizeClass;
  readonly weight?: 400 | 500 | 600;
  readonly tone?: Tone;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Tag
      className={cn(
        sizeClass[size],
        toneClass[tone],
        weight === 500 && 'font-medium',
        weight === 600 && 'font-semibold',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Heading({
  level,
  className,
  children,
}: {
  readonly level: 1 | 2 | 3;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  const size =
    level === 1
      ? 'text-[22px] font-semibold tracking-tight'
      : level === 2
        ? 'text-lg font-semibold tracking-tight'
        : 'text-base font-semibold';
  return <Tag className={cn(size, className)}>{children}</Tag>;
}
