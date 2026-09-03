'use client';

import { useState, type CSSProperties, type KeyboardEvent, type ReactElement } from 'react';

import { Icon } from '@/components/icons';
import type { ProjectOption } from '@/lib/timesheet/timesheet-server';
import { declareMissionExpense, submitTimesheet } from '@/lib/timesheet/timesheet-actions';

const DAYS: readonly { readonly k: string; readonly d: string }[] = [
  { k: 'LUN', d: '27' },
  { k: 'MAR', d: '28' },
  { k: 'MER', d: '29' },
  { k: 'JEU', d: '30' },
  { k: 'VEN', d: '31' },
  { k: 'SAM', d: '01' },
  { k: 'DIM', d: '02' },
];
const CAP = 8;

interface Row {
  project: string;
  poste: string;
  activite: string;
  hours: number[];
  budget: number;
  remaining: number;
}

const DEFAULT_ROWS: readonly Row[] = [
  {
    project: 'SFEC · Facturation électronique',
    poste: 'Développement',
    activite: 'Développement des API métier',
    hours: [7, 6.5, 4, 0, 0, 0, 0],
    budget: 17,
    remaining: 9,
  },
  {
    project: 'SFEC · Facturation électronique',
    poste: 'Recette / QA',
    activite: 'Tests de charge',
    hours: [1, 1.5, 2, 0, 0, 0, 0],
    budget: 37,
    remaining: 15,
  },
  {
    project: 'CAMU · Couverture santé',
    poste: 'Analyse fonctionnelle',
    activite: 'Ateliers de cadrage',
    hours: [0, 0, 2, 0, 0, 0, 0],
    budget: 16,
    remaining: 10,
  },
  {
    project: 'Interne · Académie & avant-vente',
    poste: 'Formation interne',
    activite: 'Académie interne',
    hours: [0, 0, 0.5, 0, 0, 0, 0],
    budget: 43,
    remaining: 12,
  },
];

const mono: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
};
const btn: CSSProperties = {
  border: '1px solid var(--line-light)',
  background: 'var(--white)',
  padding: '8px 12px',
  fontSize: 12,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const input: CSSProperties = {
  border: '1px solid var(--line-light)',
  padding: '8px 10px',
  fontSize: 13,
};

const isBillable = (project: string): boolean => !project.startsWith('Interne');

export function SaisieGrid({
  options,
}: {
  readonly options: readonly ProjectOption[];
}): ReactElement {
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS.map((r) => ({ ...r, hours: [...r.hours] })));
  const [selDay, setSelDay] = useState(2);
  const [mobile, setMobile] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const [addProject, setAddProject] = useState(options[0]?.project ?? '');
  const [addPoste, setAddPoste] = useState(options[0]?.postes[0]?.label ?? '');
  const [addActivite, setAddActivite] = useState(options[0]?.postes[0]?.activities[0] ?? '');

  const [bProject, setBProject] = useState(options[0]?.project ?? '');
  const [bPoste, setBPoste] = useState(options[0]?.postes[0]?.label ?? '');
  const [bActivite, setBActivite] = useState(options[0]?.postes[0]?.activities[0] ?? '');
  const [bHours, setBHours] = useState('7');
  const [bDays, setBDays] = useState<boolean[]>([true, true, true, true, true, false, false]);

  const [fraisOpen, setFraisOpen] = useState(false);

  const postesOf = (project: string): readonly { label: string; activities: readonly string[] }[] =>
    options.find((o) => o.project === project)?.postes ?? [];
  const activitiesOf = (project: string, poste: string): readonly string[] =>
    postesOf(project).find((p) => p.label === poste)?.activities ?? ['Saisie'];

  const rowTotal = (row: Row): number => row.hours.reduce((s, h) => s + h, 0);
  const dayTotal = (day: number): number => rows.reduce((s, row) => s + (row.hours[day] ?? 0), 0);
  const weekTotal = rows.reduce((s, row) => s + rowTotal(row), 0);
  const billableH = rows.filter((r) => isBillable(r.project)).reduce((s, r) => s + rowTotal(r), 0);
  const nonBillableH = weekTotal - billableH;
  const payload = rows.map((r) => ({ project: r.project, poste: r.poste, hours: rowTotal(r) }));

  const setCell = (ri: number, di: number, value: number): void => {
    setRows((cur) =>
      cur.map((row, i) =>
        i === ri ? { ...row, hours: row.hours.map((h, d) => (d === di ? value : h)) } : row,
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
        activite: addActivite || 'Saisie',
        hours: [0, 0, 0, 0, 0, 0, 0],
        budget: 20,
        remaining: 20,
      },
    ]);
  };
  const dupDay = (): void => {
    setRows((cur) =>
      cur.map((row) => ({
        ...row,
        hours: row.hours.map((h, d) => (d <= 4 ? (row.hours[selDay] ?? 0) : h)),
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
        activite: bActivite || 'Saisie',
        hours: bDays.map((on) => (on ? h : 0)),
        budget: 20,
        remaining: 20,
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
            i === ri ? { ...row, hours: row.hours.map((h, d) => (d <= 4 ? v : h)) } : row,
          ),
        );
      }
    };

  const template = `320px repeat(7, 1fr) 70px`;

  if (mobile) {
    const day = selDay;
    const dayTot = dayTotal(day);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <button type="button" onClick={() => setMobile(false)} style={btn}>
          Vue bureau
        </button>
        <div
          style={{
            width: 360,
            border: '1px solid var(--line-light)',
            background: 'var(--white)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'var(--black)',
              color: 'var(--white)',
              padding: '10px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            09:41 · Akieni PMO
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
            >
              <span style={{ fontSize: 18, fontWeight: 600 }}>Ma journée</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  color: dayTot > CAP ? '#b3261e' : 'var(--ink)',
                }}
              >
                {dayTot} / {CAP} h
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {DAYS.map((d, i) => (
                <button
                  key={d.k}
                  type="button"
                  onClick={() => setSelDay(i)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: 11,
                    border: '1px solid var(--line-light)',
                    background: i === day ? 'var(--black)' : 'var(--white)',
                    color: i === day ? 'var(--white)' : 'var(--ink)',
                  }}
                >
                  {d.k}
                </button>
              ))}
            </div>
            {rows.map((row, ri) => (
              <div
                key={ri}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderTop: '1px solid var(--line-light)',
                  paddingTop: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{row.project.split(' · ')[0]}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{row.poste}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCell(ri, day, Math.max(0, (row.hours[day] ?? 0) - 0.5))}
                  style={{ ...btn, width: 44, height: 44, justifyContent: 'center' }}
                >
                  −
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', width: 34, textAlign: 'center' }}>
                  {row.hours[day] ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => setCell(ri, day, (row.hours[day] ?? 0) + 0.5)}
                  style={{ ...btn, width: 44, height: 44, justifyContent: 'center' }}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              border: '1px solid var(--line-light)',
              background: 'var(--white)',
              alignItems: 'center',
            }}
          >
            <span
              style={{ ...btn, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}
              title="Semaine précédente (lecture seule)"
            >
              ‹
            </span>
            <span style={{ padding: '8px 14px', fontSize: 13 }}>27 juil. → 2 août 2026 · S31</span>
            <span
              style={{ ...btn, borderTop: 'none', borderBottom: 'none', borderRight: 'none' }}
              title="Semaine suivante (non ouverte)"
            >
              ›
            </span>
          </div>
          <span style={{ ...mono }}>Capacité {CAP} h/j · 5 j</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setBulkOpen((v) => !v)} style={btn}>
            <Icon name="layers" size={14} /> Mode bulk
          </button>
          <button type="button" onClick={dupDay} style={btn}>
            <Icon name="copy" size={14} /> Dupliquer {DAYS[selDay]?.k.toLowerCase()} sur la semaine
          </button>
          <button type="button" onClick={dupWeek} style={btn}>
            <Icon name="calendar" size={14} /> Semaine précédente
          </button>
          <button type="button" onClick={() => setMobile(true)} style={btn}>
            <Icon name="phone" size={14} /> Vue mobile
          </button>
          <form action={submitTimesheet}>
            <input type="hidden" name="rows" value={JSON.stringify(payload)} />
            <button
              type="submit"
              disabled={weekTotal <= 0}
              style={{
                background: weekTotal > 0 ? 'var(--cyan-teal)' : '#e7e7e4',
                color: '#000',
                border: 'none',
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="send" size={14} /> Soumettre la semaine
            </button>
          </form>
        </div>
      </div>

      {bulkOpen && (
        <div
          style={{
            border: '1px solid var(--line-light)',
            background: 'var(--white)',
            padding: '18px 22px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            alignItems: 'flex-end',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={mono}>Projet</span>
            <select
              value={bProject}
              onChange={(e) => {
                const p = postesOf(e.target.value)[0];
                setBProject(e.target.value);
                setBPoste(p?.label ?? '');
                setBActivite(p?.activities[0] ?? '');
              }}
              style={{ ...input, minWidth: 240 }}
            >
              {options.map((o) => (
                <option key={o.project}>{o.project}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={mono}>Poste de coût</span>
            <select
              value={bPoste}
              onChange={(e) => {
                setBPoste(e.target.value);
                setBActivite(activitiesOf(bProject, e.target.value)[0] ?? '');
              }}
              style={{ ...input, minWidth: 180 }}
            >
              {postesOf(bProject).map((p) => (
                <option key={p.label}>{p.label}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={mono}>Activité</span>
            <select
              value={bActivite}
              onChange={(e) => setBActivite(e.target.value)}
              style={{ ...input, minWidth: 200 }}
            >
              {activitiesOf(bProject, bPoste).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={mono}>Heures / jour</span>
            <input
              value={bHours}
              onChange={(e) => setBHours(e.target.value)}
              style={{ ...input, width: 80 }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={mono}>Jours</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {DAYS.map((d, i) => (
                <button
                  key={d.k}
                  type="button"
                  onClick={() => setBDays((cur) => cur.map((v, j) => (j === i ? !v : v)))}
                  style={{
                    width: 34,
                    padding: '8px 0',
                    fontSize: 11,
                    border: '1px solid var(--line-light)',
                    background: bDays[i] ? 'var(--black)' : 'var(--white)',
                    color: bDays[i] ? 'var(--white)' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {d.k.charAt(0) + d.k.charAt(1).toLowerCase()}
                </button>
              ))}
            </div>
          </label>
          <button
            type="button"
            onClick={applyBulk}
            style={{
              background: 'var(--black)',
              color: 'var(--white)',
              border: 'none',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Appliquer en masse
          </button>
        </div>
      )}

      <div
        style={{
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
          overflowX: 'auto',
        }}
      >
        <div style={{ minWidth: 900 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: template,
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
            }}
          >
            <span style={{ ...mono, padding: '12px 16px' }}>Projet · poste · activité</span>
            {DAYS.map((d, i) => (
              <button
                key={d.k}
                type="button"
                onClick={() => setSelDay(i)}
                style={{
                  padding: '10px 0',
                  border: 'none',
                  background: i === selDay ? 'var(--black)' : 'transparent',
                  color: i === selDay ? 'var(--white)' : i >= 5 ? 'var(--muted)' : 'var(--ink)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}
                >
                  {d.k}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{d.d}</span>
              </button>
            ))}
            <span style={{ ...mono, padding: '12px 8px', textAlign: 'right' }}>Total</span>
          </div>

          {rows.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: 'grid',
                gridTemplateColumns: template,
                borderBottom: '1px solid var(--line-light)',
                alignItems: 'center',
                borderLeft: `3px solid ${isBillable(row.project) ? 'var(--cyan-teal)' : 'var(--line-light)'}`,
              }}
            >
              <span
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13 }}>{row.project}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {row.poste} · {row.activite}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: row.remaining <= 2 ? '#b3261e' : 'var(--muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    reste {row.remaining} j / {row.budget} j
                    {row.remaining <= 2 ? ' · quasi épuisé' : ''}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(ri)}
                  aria-label="Supprimer la ligne"
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 2,
                    marginTop: 2,
                    flex: '0 0 auto',
                  }}
                >
                  <Icon name="trash" size={15} />
                </button>
              </span>
              {DAYS.map((d, di) => (
                <input
                  key={d.k}
                  id={`ts-${ri}-${di}`}
                  inputMode="decimal"
                  value={(row.hours[di] ?? 0) === 0 ? '' : String(row.hours[di])}
                  onChange={(e) => setCell(ri, di, Number(e.target.value.replace(',', '.')) || 0)}
                  onKeyDown={onKey(ri, di)}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderLeft: '1px solid var(--line-light)',
                    textAlign: 'center',
                    padding: '12px 0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    background: di === selDay ? 'rgba(18,235,214,.06)' : 'transparent',
                  }}
                />
              ))}
              <span
                style={{
                  padding: '0 8px',
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                }}
              >
                {rowTotal(row)}
              </span>
            </div>
          ))}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: template,
              background: 'var(--paper)',
              alignItems: 'center',
            }}
          >
            <span style={{ ...mono, padding: '10px 16px' }}>Total par jour</span>
            {DAYS.map((d, i) => {
              const t = dayTotal(i);
              return (
                <span
                  key={d.k}
                  style={{
                    textAlign: 'center',
                    padding: '10px 0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: t > CAP ? '#b3261e' : 'var(--ink)',
                    background: t > CAP ? 'rgba(179,38,30,.10)' : 'transparent',
                  }}
                >
                  {t === 0 ? '—' : t}
                </span>
              );
            })}
            <span
              style={{
                padding: '0 8px',
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {weekTotal}
            </span>
            <span />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
              padding: '12px 16px',
              borderTop: '1px solid var(--line-light)',
            }}
          >
            <span style={mono}>Ajouter une ligne</span>
            <select
              value={addProject}
              onChange={(e) => {
                setAddProject(e.target.value);
                const p = postesOf(e.target.value)[0];
                setAddPoste(p?.label ?? '');
                setAddActivite(p?.activities[0] ?? '');
              }}
              style={input}
            >
              {options.map((o) => (
                <option key={o.project}>{o.project}</option>
              ))}
            </select>
            <select
              value={addPoste}
              onChange={(e) => {
                setAddPoste(e.target.value);
                setAddActivite(activitiesOf(addProject, e.target.value)[0] ?? '');
              }}
              style={input}
            >
              {postesOf(addProject).map((p) => (
                <option key={p.label}>{p.label}</option>
              ))}
            </select>
            <select
              value={addActivite}
              onChange={(e) => setAddActivite(e.target.value)}
              style={input}
            >
              {activitiesOf(addProject, addPoste).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <button type="button" onClick={addRow} style={btn}>
              + Ajouter
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ ...mono, textTransform: 'none' }}>
          ↵ ligne suivante · ↑↓ naviguer · ⇥ jour suivant · D dupliquer la cellule sur la semaine
        </span>
        <span style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <span style={{ color: 'var(--green)' }}>● Facturable {billableH} h</span>
          <span style={{ color: 'var(--muted)' }}>● Non facturable {nonBillableH} h</span>
        </span>
      </div>

      <div style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}>
        <div
          style={{
            padding: '16px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <div style={{ ...mono }}>Mes frais de mission</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              Déclarez vos frais avec justificatif : la comptabilité les contrôle puis les
              rembourse.
            </div>
          </div>
          <button type="button" onClick={() => setFraisOpen((v) => !v)} style={btn}>
            + Déclarer un frais
          </button>
        </div>
        {fraisOpen && (
          <form
            action={declareMissionExpense}
            style={{
              padding: '0 22px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <select name="projectName" style={input}>
              {options.map((o) => (
                <option key={o.project}>{o.project}</option>
              ))}
            </select>
            <input
              name="label"
              placeholder="Nature (per diem, transport...)"
              style={{ ...input, flex: '1 1 180px' }}
            />
            <input
              name="amount"
              type="number"
              min={0}
              placeholder="Montant XAF"
              style={{ ...input, width: 140 }}
            />
            <input name="date" placeholder="Date (ex. 29 juil.)" style={{ ...input, width: 130 }} />
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--muted)',
              }}
            >
              <input type="checkbox" name="billable" /> Refacturable
            </label>
            <button
              type="submit"
              style={{ ...btn, background: 'var(--cyan-teal)', border: 'none', fontWeight: 500 }}
            >
              Déclarer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
