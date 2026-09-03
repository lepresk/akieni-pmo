import type { Role } from '@/lib/rbac';

/** Placeholder for a value hidden from the current role. */
export const RESTRICTED = '- restreint -';

const SENIORITY_LABELS: Readonly<Record<string, string>> = {
  junior: 'Junior',
  confirmed: 'Confirmé',
  senior: 'Senior',
  lead: 'Lead',
  manager: 'Manager',
};

const MONTHS_FR = [
  'janv.',
  'févr.',
  'mars',
  'avril',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
] as const;

/** Group thousands with a regular space (deterministic, locale-independent). */
export function groupThousands(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Format an integer amount in whole XAF, e.g. `XAF 1 450 000`. */
export function xaf(value: number): string {
  return `XAF ${groupThousands(value)}`;
}

export function seniorityLabel(value: string | null): string {
  if (!value) return '-';
  return SENIORITY_LABELS[value] ?? value;
}

/** `2026-01-01` -> `01/01/2026`. */
export function dateSlash(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

/** `2026-08-15` -> `15 août`. */
export function dayMonthFr(iso: string): string {
  const [, month, day] = iso.split('-');
  if (!month || !day) return iso;
  const label = MONTHS_FR[Number(month) - 1];
  return label ? `${day} ${label}` : iso;
}

const SEGMENT_LABELS: Readonly<Record<string, string>> = {
  public: 'Public',
  private: 'Privé',
  internal: 'Interne',
};

const MODEL_LABELS: Readonly<Record<string, string>> = {
  regie: 'Régie',
  forfait: 'Forfait',
  non_billable: 'Non facturable',
};

export function segmentLabel(value: string): string {
  return SEGMENT_LABELS[value] ?? value;
}

export function modelLabel(value: string): string {
  return MODEL_LABELS[value] ?? value;
}

export function pct(value: number): string {
  return `${Math.round(value)} %`;
}

/** Chargeability / load color by threshold: overbooked > 100 (red), bench < 60 (muted). */
export function loadColor(value: number): string {
  if (value > 100) return '#b3261e';
  if (value < 60) return 'var(--muted)';
  return 'var(--ink)';
}

/** Margin percentage from the internal cost ratio: margin = 1 - costLoad. */
export function marginFromCostLoad(costLoad: number): number {
  return Math.round((1 - costLoad) * 100);
}

/** Margin color: loss (< 0) or thin (< 10%) is red. */
export function marginColor(costLoad: number): string {
  const margin = 1 - costLoad;
  return margin < 0.1 ? '#b3261e' : 'var(--ink)';
}

/** Human role label re-exported for convenience in server components. */
export type { Role };
