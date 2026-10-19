'use client';

import { useActionState, useMemo, useState, type KeyboardEvent, type ReactElement } from 'react';

import { Icon } from '@/components/icons';
import { Button, Callout, Card, FormRow, Input, MonoLabel, Select } from '@/components/ui';
import {
  getWeekSnapshot,
  shiftWeekSnapshot,
  submissionWeekLabel,
  type WeekSnapshot,
} from '@/lib/calendar/week-display';
import { cn } from '@/lib/cn';
import { dayMonthFr } from '@/lib/display';
import type { ProjectOption } from '@/lib/timesheet/timesheet-server';
import {
  submitTimesheetForm,
  declareMissionExpense,
  type TimesheetFormState,
} from '@/lib/timesheet/timesheet-actions';
import type { TimesheetLineInput } from '@/lib/timesheet/timesheet-schemas';

const DAY_CAP_HOURS = 8;

/** Shared grid template for the header, entry rows and totals row. */
const GRID_COLS = 'grid-cols-[320px_repeat(7,1fr)_70px]';

type DayHours = [number, number, number, number, number, number, number];

interface Row {
  project: string;
  poste: string;
  activity: string;
  hours: DayHours;
  budget: number | null;
  remaining: number | null;
}

const EMPTY_HOURS: DayHours = [0, 0, 0, 0, 0, 0, 0];

const INITIAL_FORM_STATE: TimesheetFormState = { error: null };

function toDayHours(hours: readonly number[]): DayHours {
  return [
    hours[0] ?? 0,
    hours[1] ?? 0,
    hours[2] ?? 0,
    hours[3] ?? 0,
    hours[4] ?? 0,
    hours[5] ?? 0,
    hours[6] ?? 0,
  ];
}

function rowsFromInitial(initialRows: readonly TimesheetLineInput[]): Row[] {
  return initialRows.map((row) => ({
    project: row.project,
    poste: row.poste,
    activity: row.activity,
    hours: toDayHours(row.hours),
    budget: null,
    remaining: null,
  }));
}

const isBillable = (project: string): boolean => !project.startsWith('Interne');

function formatBudgetCell(remaining: number | null, budget: number | null): string {
  const remainingLabel = remaining == null ? '-' : String(remaining);
  const budgetLabel = budget == null ? '-' : String(budget);
  return `reste ${remainingLabel} j / ${budgetLabel} j`;
}

export function SaisieGrid({
  options,
  initialWeek,
  initialRows,
}: {
  readonly options: readonly ProjectOption[];
  readonly initialWeek: WeekSnapshot;
  readonly initialRows: readonly TimesheetLineInput[];
}): ReactElement {
  const [week, setWeek] = useState<WeekSnapshot>(initialWeek);
  const days = week.days;
  const [rows, setRows] = useState<Row[]>(() => rowsFromInitial(initialRows));
  const [selDay, setSelDay] = useState(() =>
    initialWeek.todayIndex >= 0 ? initialWeek.todayIndex : 0,
  );
  const [mobile, setMobile] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [formState, formAction] = useActionState(submitTimesheetForm, INITIAL_FORM_STATE);

  const [addProject, setAddProject] = useState(options[0]?.project ?? '');
  const [addPoste, setAddPoste] = useState(options[0]?.postes[0]?.label ?? '');
  const [addActivity, setAddActivity] = useState(options[0]?.postes[0]?.activities[0] ?? '');

  const [bProject, setBProject] = useState(options[0]?.project ?? '');
  const [bPoste, setBPoste] = useState(options[0]?.postes[0]?.label ?? '');
  const [bActivity, setBActivity] = useState(options[0]?.postes[0]?.activities[0] ?? '');
  const [bHours, setBHours] = useState('7');
  const [bDays, setBDays] = useState<boolean[]>([true, true, true, true, true, false, false]);

  const [fraisOpen, setFraisOpen] = useState(false);

  const expenseDateHint = useMemo(() => {
    const today = getWeekSnapshot();
    const idx = today.todayIndex >= 0 ? today.todayIndex : 0;
    const iso = today.days[idx]?.iso;
    return iso ? dayMonthFr(iso) : 'Date';
  }, []);

  const goWeek = (delta: number): void => {
    const next = shiftWeekSnapshot(week.mondayIso, delta);
    setWeek(next);
    setSelDay(next.todayIndex >= 0 ? next.todayIndex : 0);
  };

  const postesOf = (project: string): readonly { label: string; activities: readonly string[] }[] =>
    options.find((o) => o.project === project)?.postes ?? [];
  const activitiesOf = (project: string, poste: string): readonly string[] =>
    postesOf(project).find((p) => p.label === poste)?.activities ?? ['Saisie'];

  const rowTotal = (row: Row): number => row.hours.reduce((s, h) => s + h, 0);
  const dayTotal = (day: number): number => rows.reduce((s, row) => s + (row.hours[day] ?? 0), 0);
  const weekTotal = rows.reduce((s, row) => s + rowTotal(row), 0);
  const billableH = rows.filter((r) => isBillable(r.project)).reduce((s, r) => s + rowTotal(r), 0);
  const nonBillableH = weekTotal - billableH;
  const payload = rows.map((r) => ({
    project: r.project,
    poste: r.poste,
    activity: r.activity,
    hours: toDayHours(r.hours),
  }));
  const weekLabel = submissionWeekLabel(week);

  const setCell = (ri: number, di: number, value: number): void => {
    setRows((cur) =>
      cur.map((row, i) =>
        i === ri
          ? { ...row, hours: toDayHours(row.hours.map((h, d) => (d === di ? value : h))) }
          : row,
      ),
    );
  };
  const removeRow = (ri: number): void => setRows((cur) => cur.filter((_, i) => i !== ri));
  const addRow = (): void => {
    if (!addProject || !addPoste) return;
    setRows((cur) => [
      ...cur,
      {
        project: addProject,
        poste: addPoste,
        activity: addActivity || 'Saisie',
        hours: [...EMPTY_HOURS],
        budget: null,
        remaining: null,
      },
    ]);
  };
  const dupDay = (): void => {
    setRows((cur) =>
      cur.map((row) => ({
        ...row,
        hours: toDayHours(row.hours.map((h, d) => (d <= 4 ? (row.hours[selDay] ?? 0) : h))),
      })),
    );
  };
  const dupWeek = (): void => {
    setRows((cur) =>
      cur.map((row) => ({
        ...row,
        hours: isBillable(row.project) ? [7, 7, 7, 7, 6, 0, 0] : [0, 0, 0, 0, 1, 0, 0],
      })),
    );
  };
  const applyBulk = (): void => {
    const h = Number(bHours) || 0;
    setRows((cur) => [
      ...cur,
      {
        project: bProject,
        poste: bPoste,
        activity: bActivity || 'Saisie',
        hours: toDayHours(bDays.map((on) => (on ? h : 0))),
        budget: null,
        remaining: null,
      },
    ]);
    setBulkOpen(false);
  };
  const onKey =
    (ri: number, di: number) =>
    (e: KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const v = rows[ri]?.hours[di] ?? 0;
        setRows((cur) =>
          cur.map((row, i) =>
            i === ri
              ? { ...row, hours: toDayHours(row.hours.map((h, d) => (d <= 4 ? v : h))) }
              : row,
          ),
        );
      }
    };

  if (mobile) {
    const day = selDay;
    const dayTot = dayTotal(day);
    return (
      <div className="flex flex-col items-start gap-4">
        <Button onClick={() => setMobile(false)}>Vue bureau</Button>
        <Card padding="none" className="w-[360px] overflow-hidden">
          <div className="bg-black px-4 py-2.5 font-mono text-[11px] text-white">
            {week.shortLabel} · Akieni PMO
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[18px] font-semibold">Ma journée</span>
              <span
                className={cn(
                  'font-mono text-[14px]',
                  dayTot > DAY_CAP_HOURS ? 'text-danger' : 'text-ink',
                )}
              >
                {dayTot} / {DAY_CAP_HOURS} h
              </span>
            </div>
            <div className="flex gap-1.5">
              {days.map((d, i) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setSelDay(i)}
                  className={cn(
                    'border-line-light flex-1 border py-1.5 text-[11px]',
                    i === day ? 'bg-black text-white' : 'text-ink bg-white',
                  )}
                >
                  {d.key}
                </button>
              ))}
            </div>
            {rows.map((row, ri) => (
              <div key={ri} className="border-line-light flex items-center gap-2.5 border-t pt-2.5">
                <div className="flex-1">
                  <div className="text-[13px]">{row.project.split(' · ')[0]}</div>
                  <div className="text-muted text-[11px]">{row.poste}</div>
                </div>
                <Button
                  onClick={() => setCell(ri, day, Math.max(0, (row.hours[day] ?? 0) - 0.5))}
                  className="h-11 w-11 p-0"
                >
                  −
                </Button>
                <span className="w-[34px] text-center font-mono">{row.hours[day] ?? 0}</span>
                <Button
                  onClick={() => setCell(ri, day, (row.hours[day] ?? 0) + 0.5)}
                  className="h-11 w-11 p-0"
                >
                  +
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="border-line-light flex items-center border bg-white">
            <button
              type="button"
              onClick={() => goWeek(-1)}
              className="border-line-light flex cursor-pointer items-center gap-2 border-r px-3 py-2 text-[12px]"
              title="Semaine précédente"
            >
              ‹
            </button>
            <span className="px-3.5 py-2 text-[13px]">{week.rangeLabel}</span>
            <button
              type="button"
              onClick={() => goWeek(1)}
              className="border-line-light flex cursor-pointer items-center gap-2 border-l px-3 py-2 text-[12px]"
              title="Semaine suivante"
            >
              ›
            </button>
          </div>
          <MonoLabel>Capacité {DAY_CAP_HOURS} h/j · 5 j</MonoLabel>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setBulkOpen((v) => !v)}>
            <Icon name="layers" size={14} /> Mode bulk
          </Button>
          <Button onClick={dupDay}>
            <Icon name="copy" size={14} /> Dupliquer {days[selDay]?.key.toLowerCase()} sur la
            semaine
          </Button>
          <Button onClick={dupWeek}>
            <Icon name="calendar" size={14} /> Remplir semaine type
          </Button>
          <Button onClick={() => setMobile(true)}>
            <Icon name="phone" size={14} /> Vue mobile
          </Button>
          <form action={formAction}>
            <input type="hidden" name="rows" value={JSON.stringify(payload)} />
            <input type="hidden" name="weekLabel" value={weekLabel} />
            <input type="hidden" name="mondayIso" value={week.mondayIso} />
            <Button
              type="submit"
              variant="primary"
              disabled={weekTotal <= 0}
              className={cn(
                'border-none px-4 py-[9px] text-[13px] disabled:opacity-100',
                weekTotal > 0 ? 'bg-cyan' : 'bg-line-light',
              )}
            >
              <Icon name="send" size={14} /> Soumettre la semaine
            </Button>
          </form>
        </div>
      </div>

      {formState.error ? <Callout variant="warning">{formState.error}</Callout> : null}

      {bulkOpen && (
        <FormRow className="gap-[20px] px-[22px] py-[18px]">
          <label className="flex flex-col gap-1.5">
            <MonoLabel>Projet</MonoLabel>
            <Select
              value={bProject}
              onChange={(e) => {
                const p = postesOf(e.target.value)[0];
                setBProject(e.target.value);
                setBPoste(p?.label ?? '');
                setBActivity(p?.activities[0] ?? '');
              }}
              className="min-w-[240px]"
            >
              {options.map((o) => (
                <option key={o.project}>{o.project}</option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1.5">
            <MonoLabel>Poste de coût</MonoLabel>
            <Select
              value={bPoste}
              onChange={(e) => {
                setBPoste(e.target.value);
                setBActivity(activitiesOf(bProject, e.target.value)[0] ?? '');
              }}
              className="min-w-[180px]"
            >
              {postesOf(bProject).map((p) => (
                <option key={p.label}>{p.label}</option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1.5">
            <MonoLabel>Activité</MonoLabel>
            <Select
              value={bActivity}
              onChange={(e) => setBActivity(e.target.value)}
              className="min-w-[200px]"
            >
              {activitiesOf(bProject, bPoste).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1.5">
            <MonoLabel>Heures / jour</MonoLabel>
            <Input
              value={bHours}
              onChange={(e) => setBHours(e.target.value)}
              className="w-[80px]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <MonoLabel>Jours</MonoLabel>
            <div className="flex gap-1">
              {days.map((d, i) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setBDays((cur) => cur.map((v, j) => (j === i ? !v : v)))}
                  className={cn(
                    'border-line-light w-[34px] border py-2 text-[11px]',
                    bDays[i] ? 'bg-black text-white' : 'text-ink bg-white',
                  )}
                >
                  {d.key.charAt(0) + d.key.charAt(1).toLowerCase()}
                </button>
              ))}
            </div>
          </label>
          <Button
            onClick={applyBulk}
            className="border-none bg-black px-[18px] py-2.5 text-[13px] font-medium text-white hover:bg-black"
          >
            Appliquer en masse
          </Button>
        </FormRow>
      )}

      <div className="border-line-light overflow-x-auto border bg-white">
        <div className="min-w-[900px]">
          <div className={cn('border-line-light bg-paper grid border-b', GRID_COLS)}>
            <MonoLabel className="px-4 py-3">Projet · poste · activité</MonoLabel>
            {days.map((d, i) => (
              <button
                key={d.iso}
                type="button"
                onClick={() => setSelDay(i)}
                className={cn(
                  'flex cursor-pointer flex-col items-center border-0 py-2.5',
                  i === selDay
                    ? 'bg-black text-white'
                    : cn('bg-transparent', i >= 5 ? 'text-muted' : 'text-ink'),
                )}
              >
                <span className="font-mono text-[10px] tracking-[0.1em]">{d.key}</span>
                <span className="font-mono text-[12px]">{d.dayOfMonth}</span>
              </button>
            ))}
            <MonoLabel className="px-2 py-3 text-right">Total</MonoLabel>
          </div>

          {rows.length === 0 ? (
            <div className="text-muted px-4 py-6 text-[13px]">
              Aucune ligne pour cette semaine. Ajoutez un projet ci-dessous ou soumettez après
              saisie.
            </div>
          ) : null}

          {rows.map((row, ri) => (
            <div
              key={ri}
              className={cn(
                'border-line-light grid items-center border-b border-l-[3px]',
                GRID_COLS,
                isBillable(row.project) ? 'border-l-cyan' : 'border-l-line-light',
              )}
            >
              <span className="flex items-start justify-between gap-2 px-3.5 py-2.5">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13px]">{row.project}</span>
                  <span className="text-muted text-[11px]">
                    {row.poste} · {row.activity}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[10px]',
                      row.remaining != null && row.remaining <= 2 ? 'text-danger' : 'text-muted',
                    )}
                  >
                    {formatBudgetCell(row.remaining, row.budget)}
                    {row.remaining != null && row.remaining <= 2 ? ' · quasi épuisé' : ''}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  onClick={() => removeRow(ri)}
                  aria-label="Supprimer la ligne"
                  className="mt-0.5 flex-none border-none p-0.5"
                >
                  <Icon name="trash" size={15} />
                </Button>
              </span>
              {days.map((d, di) => (
                <input
                  key={d.iso}
                  id={`ts-${ri}-${di}`}
                  inputMode="decimal"
                  value={(row.hours[di] ?? 0) === 0 ? '' : String(row.hours[di])}
                  onChange={(e) => setCell(ri, di, Number(e.target.value.replace(',', '.')) || 0)}
                  onKeyDown={onKey(ri, di)}
                  className={cn(
                    'border-l-line-light w-full border-l py-3 text-center font-mono text-[12px]',
                    di === selDay ? 'bg-cyan/[0.06]' : 'bg-transparent',
                  )}
                />
              ))}
              <span className="px-2 text-right font-mono text-[12px]">{rowTotal(row)}</span>
            </div>
          ))}

          <div className={cn('bg-paper grid items-center', GRID_COLS)}>
            <MonoLabel className="px-4 py-2.5">Total par jour</MonoLabel>
            {days.map((d, i) => {
              const t = dayTotal(i);
              return (
                <span
                  key={d.iso}
                  className={cn(
                    'py-2.5 text-center font-mono text-[12px]',
                    t > DAY_CAP_HOURS ? 'bg-danger/10 text-danger' : 'text-ink bg-transparent',
                  )}
                >
                  {t === 0 ? '-' : t}
                </span>
              );
            })}
            <span className="px-2 text-right font-mono text-[13px] font-semibold">{weekTotal}</span>
            <span />
          </div>

          <div className="border-line-light flex flex-wrap items-center gap-2.5 border-t px-4 py-3">
            <MonoLabel>Ajouter une ligne</MonoLabel>
            <Select
              value={addProject}
              onChange={(e) => {
                setAddProject(e.target.value);
                const p = postesOf(e.target.value)[0];
                setAddPoste(p?.label ?? '');
                setAddActivity(p?.activities[0] ?? '');
              }}
            >
              {options.map((o) => (
                <option key={o.project}>{o.project}</option>
              ))}
            </Select>
            <Select
              value={addPoste}
              onChange={(e) => {
                setAddPoste(e.target.value);
                setAddActivity(activitiesOf(addProject, e.target.value)[0] ?? '');
              }}
            >
              {postesOf(addProject).map((p) => (
                <option key={p.label}>{p.label}</option>
              ))}
            </Select>
            <Select value={addActivity} onChange={(e) => setAddActivity(e.target.value)}>
              {activitiesOf(addProject, addPoste).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
            <Button onClick={addRow}>+ Ajouter</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <MonoLabel className="normal-case">
          ↵ ligne suivante · ↑↓ naviguer · ⇥ jour suivant · D dupliquer la cellule sur la semaine
        </MonoLabel>
        <span className="flex gap-4 font-mono text-[12px]">
          <span className="text-green">● Facturable {billableH} h</span>
          <span className="text-muted">● Non facturable {nonBillableH} h</span>
        </span>
      </div>

      <Card padding="none">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-[22px] py-4">
          <div>
            <MonoLabel>Mes frais de mission</MonoLabel>
            <div className="text-muted mt-1 text-[12px]">
              Déclarez vos frais avec justificatif : la comptabilité les contrôle puis les
              rembourse.
            </div>
          </div>
          <Button onClick={() => setFraisOpen((v) => !v)}>+ Déclarer un frais</Button>
        </div>
        {fraisOpen && (
          <form
            action={declareMissionExpense}
            className="flex flex-wrap items-center gap-2.5 px-[22px] pb-[18px]"
          >
            <Select name="projectName">
              {options.map((o) => (
                <option key={o.project}>{o.project}</option>
              ))}
            </Select>
            <Input
              name="label"
              placeholder="Nature (per diem, transport...)"
              className="flex-[1_1_180px]"
            />
            <Input
              name="amount"
              type="number"
              min={0}
              placeholder="Montant XAF"
              className="w-[140px]"
            />
            <Input
              name="date"
              placeholder={`Date (ex. ${expenseDateHint})`}
              className="w-[130px]"
            />
            <label className="text-muted flex items-center gap-1.5 text-[12px]">
              <input type="checkbox" name="billable" /> Refacturable
            </label>
            <Button type="submit" variant="primary" className="border-none">
              Déclarer
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
