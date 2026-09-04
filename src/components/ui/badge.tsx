import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { Tone } from '@/components/ui/mono-label';

const toneClass: Record<Tone, string> = {
  default: 'border-line-light text-ink',
  muted: 'border-line-light text-muted',
  danger: 'border-danger text-danger',
  success: 'border-green/40 bg-[rgba(56,240,115,0.08)] text-ink',
  accent: 'border-cyan/40 bg-[rgba(18,235,214,0.08)] text-ink',
  onDark: 'border-line text-muted-2',
};

export function Badge({
  tone = 'default',
  filled = false,
  className,
  children,
}: {
  readonly tone?: Tone;
  readonly filled?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <span
      className={cn(
        'tracking-label inline-flex items-center border px-[8px] py-[3px] font-mono text-[10px] uppercase',
        toneClass[tone],
        filled && tone === 'success' && 'bg-[rgba(56,240,115,0.12)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_DEFAULTS: Readonly<
  Record<string, { readonly label: string; readonly tone: Tone; readonly filled?: boolean }>
> = {
  pending: { label: 'À valider', tone: 'muted' },
  validated: { label: 'Validée', tone: 'success', filled: true },
  rejected: { label: 'Rejetée', tone: 'danger' },
  engage: { label: 'Engagé', tone: 'muted' },
  facture: { label: 'Facturé', tone: 'default' },
  paye: { label: 'Payé', tone: 'success', filled: true },
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  readonly status: keyof typeof STATUS_DEFAULTS | 'custom';
  readonly label?: string;
  readonly className?: string;
}): ReactElement {
  const defaults =
    status === 'custom'
      ? { label: label ?? '-', tone: 'default' as Tone }
      : (STATUS_DEFAULTS[status] ?? { label: label ?? status, tone: 'default' as Tone });
  return (
    <Badge
      tone={defaults.tone}
      filled={defaults.filled === true}
      {...(className !== undefined ? { className } : {})}
    >
      {label ?? defaults.label}
    </Badge>
  );
}
