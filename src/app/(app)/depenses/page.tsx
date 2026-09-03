import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { RestrictedNotice } from '@/components/restricted-notice';
import { xaf } from '@/lib/display';
import { advanceExpense, createExpense } from '@/lib/expenses/expenses-actions';
import { getExpenses, type ExpenseView } from '@/lib/expenses/expenses-server';
import { canExpense } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import { getProjectOptions } from '@/lib/timesheet/timesheet-server';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

const columns = '2fr 1.3fr 1fr 1fr 0.9fr 0.9fr';
const inputStyle = { border: '1px solid var(--line-light)', padding: '8px 10px', fontSize: 13 };

const FILTERS: readonly { readonly key: string; readonly label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'engage', label: 'Engagé' },
  { key: 'facture', label: 'Facturé' },
  { key: 'paye', label: 'Payé' },
  { key: 'refacturable', label: 'Refacturable' },
];

function stateBadge(state: 'engage' | 'facture' | 'paye'): ReactElement {
  const map = {
    engage: { label: 'Engagé', bg: 'transparent' },
    facture: { label: 'Facturé', bg: 'transparent' },
    paye: { label: 'Payé', bg: 'rgba(56,240,115,.14)' },
  }[state];
  return (
    <span
      style={{
        ...mono,
        color: 'var(--ink)',
        background: map.bg,
        border: '1px solid var(--line-light)',
        padding: '3px 8px',
      }}
    >
      {map.label}
    </span>
  );
}

function matches(row: ExpenseView, filter: string): boolean {
  if (filter === 'refacturable') return row.billable;
  if (filter === 'engage' || filter === 'facture' || filter === 'paye') return row.state === filter;
  return true;
}

export default async function DepensesPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly state?: string }>;
}): Promise<ReactElement> {
  const { role } = await getSession();
  if (!canExpense(role)) {
    return (
      <RestrictedNotice
        title="Saisie réservée à la comptabilité"
        body="Le registre des dépenses projet est accessible à la Finance, au PMO, à la Direction et à l'Admin."
      />
    );
  }

  const { rows, kpis } = await getExpenses();
  const options = await getProjectOptions();
  const filter = (await searchParams).state ?? 'all';
  const filtered = rows.filter((row) => matches(row, filter));

  const tiles = [
    { label: 'Engagé · non facturé', value: kpis.engage, note: 'bons de commande émis' },
    { label: 'Facturé fournisseur', value: kpis.facture, note: 'en attente de paiement' },
    { label: 'Payé', value: kpis.paye, note: 'sorties de trésorerie' },
    { label: 'Refacturable client', value: kpis.refacturable, note: 'à reporter en pré-facture' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
        }}
      >
        {tiles.map((tile) => (
          <div
            key={tile.label}
            style={{
              padding: '20px 22px',
              borderRight: '1px solid var(--line-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span style={mono}>{tile.label}</span>
            <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {xaf(tile.value)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{tile.note}</span>
          </div>
        ))}
      </div>

      <form
        action={createExpense}
        style={{
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
          padding: '16px 22px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <span style={mono}>Saisir une dépense</span>
        <select name="projectName" style={inputStyle}>
          {options.map((option) => (
            <option key={option.project} value={option.project}>
              {option.project}
            </option>
          ))}
        </select>
        <select name="nature" style={inputStyle}>
          <option value="achat">Achat & sous-traitance</option>
          <option value="mission">Frais de mission</option>
        </select>
        <input name="label" placeholder="Libellé" style={{ ...inputStyle, flex: '1 1 180px' }} />
        <input name="supplier" placeholder="Fournisseur" style={inputStyle} />
        <input
          name="amount"
          type="number"
          min={0}
          placeholder="Montant XAF"
          style={{ ...inputStyle, width: 140 }}
        />
        <input
          name="date"
          placeholder="Date (ex. 29 juil.)"
          style={{ ...inputStyle, width: 130 }}
        />
        <select name="state" style={inputStyle}>
          <option value="engage">Engagé</option>
          <option value="facture">Facturé</option>
          <option value="paye">Payé</option>
        </select>
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
          style={{
            background: 'var(--cyan-teal)',
            color: '#000',
            border: 'none',
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Enregistrer
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/depenses?state=${f.key}` as Route}
            style={{
              ...mono,
              padding: '6px 12px',
              border: '1px solid var(--line-light)',
              color: filter === f.key ? 'var(--ink)' : 'var(--muted)',
              background: filter === f.key ? 'var(--paper)' : 'transparent',
            }}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div
        style={{
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
          overflowX: 'auto',
        }}
      >
        <div style={{ minWidth: 940 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: columns,
              columnGap: 16,
              padding: '12px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
              ...mono,
            }}
          >
            <span>Charge</span>
            <span>Projet · périmètre</span>
            <span>Montant</span>
            <span>Refacturation</span>
            <span>État</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>
          {filtered.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: columns,
                columnGap: 16,
                padding: '13px 22px',
                borderBottom: '1px solid var(--line-light)',
                alignItems: 'center',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 13 }}>{row.label}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {row.supplier ?? '-'} · {row.dateLabel ?? '-'} · {row.poste ?? '-'}
                </span>
              </span>
              <span style={{ fontSize: 12 }}>
                {row.projectName}
                {row.sub && row.sub !== '—' ? ` · ${row.sub}` : ''}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {xaf(row.amount)}
              </span>
              <span style={{ fontSize: 12, color: row.billable ? 'var(--ink)' : 'var(--muted)' }}>
                {row.billable ? 'Refacturable' : 'À notre charge'}
              </span>
              <span>{stateBadge(row.state)}</span>
              <span style={{ textAlign: 'right' }}>
                {row.state !== 'paye' && (
                  <form action={advanceExpense} style={{ display: 'inline' }}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      style={{
                        border: '1px solid var(--line-light)',
                        background: 'var(--white)',
                        padding: '6px 10px',
                        fontSize: 12,
                      }}
                    >
                      {row.state === 'engage' ? '→ Facturer' : '→ Payer'}
                    </button>
                  </form>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
