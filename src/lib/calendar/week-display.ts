/**
 * ISO-8601 week helpers (Monday start) for timesheet chrome and labels.
 * Pure display/calendar utilities - no I/O.
 */

import { dayMonthFr } from '@/lib/display';

const DAY_KEYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'] as const;

export interface WeekDay {
  readonly key: (typeof DAY_KEYS)[number];
  /** Calendar day of month, zero-padded (e.g. "03"). */
  readonly dayOfMonth: string;
  /** ISO date YYYY-MM-DD in local time. */
  readonly iso: string;
}

export interface WeekSnapshot {
  /** Monday of the week as YYYY-MM-DD (local). */
  readonly mondayIso: string;
  readonly isoWeek: number;
  readonly isoYear: number;
  readonly days: readonly WeekDay[];
  /** e.g. `31 août → 6 sept. 2026 · S36` */
  readonly rangeLabel: string;
  /** e.g. `S36` */
  readonly shortLabel: string;
  /** Index 0-6 of today within this week, or -1 if today is outside. */
  readonly todayIndex: number;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Local calendar YYYY-MM-DD (no UTC shift). */
export function toLocalIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseLocalIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  return new Date(y, m - 1, d);
}

/** Monday 00:00 local of the ISO week containing `date`. */
export function startOfIsoWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return d;
}

/** ISO week number and week-year for a local date. */
export function isoWeekAndYear(date: Date): { readonly week: number; readonly year: number } {
  const monday = startOfIsoWeek(date);
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const year = thursday.getFullYear();
  const yearStart = startOfIsoWeek(new Date(year, 0, 4));
  const diffDays = Math.round((monday.getTime() - yearStart.getTime()) / 86_400_000);
  return { week: Math.floor(diffDays / 7) + 1, year };
}

function buildDays(monday: Date): readonly WeekDay[] {
  return DAY_KEYS.map((key, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return {
      key,
      dayOfMonth: pad2(day.getDate()),
      iso: toLocalIsoDate(day),
    };
  });
}

function rangeLabel(monday: Date, week: number): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const year = sunday.getFullYear();
  return `${dayMonthFr(toLocalIsoDate(monday))} → ${dayMonthFr(toLocalIsoDate(sunday))} ${year} · S${week}`;
}

export function getWeekSnapshot(date: Date = new Date()): WeekSnapshot {
  const monday = startOfIsoWeek(date);
  const { week, year } = isoWeekAndYear(date);
  const days = buildDays(monday);
  const todayIso = toLocalIsoDate(date);
  const todayIndex = days.findIndex((d) => d.iso === todayIso);

  return {
    mondayIso: toLocalIsoDate(monday),
    isoWeek: week,
    isoYear: year,
    days,
    rangeLabel: rangeLabel(monday, week),
    shortLabel: `S${week}`,
    todayIndex,
  };
}

/** Shift a week snapshot by `delta` ISO weeks (negative = previous). */
export function shiftWeekSnapshot(mondayIso: string, delta: number): WeekSnapshot {
  const monday = parseLocalIsoDate(mondayIso);
  monday.setDate(monday.getDate() + delta * 7);
  return getWeekSnapshot(monday);
}

/** Label stored on timesheet submissions, e.g. `S36 · en cours`. */
export function submissionWeekLabel(snapshot: WeekSnapshot): string {
  return `${snapshot.shortLabel} · en cours`;
}

/** Long French greeting date, e.g. `Jeudi 3 septembre 2026 · S36`. */
export function longDateWithWeek(date: Date = new Date()): string {
  const DAYS_FR = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ] as const;
  const MONTHS_LONG = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ] as const;
  const snap = getWeekSnapshot(date);
  const dayName = DAYS_FR[date.getDay()] ?? '';
  const month = MONTHS_LONG[date.getMonth()] ?? '';
  return `${dayName} ${date.getDate()} ${month} ${date.getFullYear()} · ${snap.shortLabel}`;
}
