import type { ReactElement } from 'react';

import { approveLeave, createLeave, refuseLeave } from '@/lib/leaves/leaves-actions';
import { getLeaves } from '@/lib/leaves/leaves-server';
import { canApproveLeave } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

function statusBadge(status: 'pending' | 'validated' | 'rejected'): ReactElement {
  const map = {
    pending: { label: 'En attente', color: 'var(--ink)', bg: 'transparent' },
    validated: { label: 'Validé', color: 'var(--ink)', bg: 'rgba(56,240,115,.14)' },
    rejected: { label: 'Refusé', color: '#b3261e', bg: 'transparent' },
  }[status];
  return (
    <span
      style={{
        ...mono,
        color: map.color,
        background: map.bg,
        border: '1px solid var(--line-light)',
        padding: '3px 8px',
      }}
    >
      {map.label}
    </span>
  );
}

export default async function CongesPage(): Promise<ReactElement> {
  const { role } = await getSession();
  const { rows, pending } = await getLeaves();
  const canAct = canApproveLeave(role);

  const kpis: readonly { readonly label: string; readonly value: string }[] = [
    { label: 'Solde acquis', value: '18,5 j' },
    { label: 'Pris cette année', value: '9 j' },
    { label: 'En attente N+1', value: String(pending) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              padding: '20px 22px',
              borderRight: '1px solid var(--line-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={mono}>{kpi.label}</span>
            <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.045em' }}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      <form
        action={createLeave}
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
        <span style={mono}>Demander un congé</span>
        <select
          name="type"
          style={{ border: '1px solid var(--line-light)', padding: '8px 10px', fontSize: 13 }}
        >
          <option>Congé payé</option>
          <option>Maladie</option>
          <option>Congé sans solde</option>
          <option>Récupération</option>
        </select>
        <input
          name="from"
          placeholder="Du (ex. 12 août)"
          style={{
            border: '1px solid var(--line-light)',
            padding: '8px 10px',
            fontSize: 13,
            width: 140,
          }}
        />
        <input
          name="to"
          placeholder="Au (ex. 23 août)"
          style={{
            border: '1px solid var(--line-light)',
            padding: '8px 10px',
            fontSize: 13,
            width: 140,
          }}
        />
        <input
          name="days"
          type="number"
          min={0}
          step={0.5}
          placeholder="Jours"
          style={{
            border: '1px solid var(--line-light)',
            padding: '8px 10px',
            fontSize: 13,
            width: 90,
          }}
        />
        <input
          name="note"
          placeholder="Note (optionnel)"
          style={{
            border: '1px solid var(--line-light)',
            padding: '8px 10px',
            fontSize: 13,
            flex: '1 1 160px',
          }}
        />
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
          Demander
        </button>
      </form>

      <div style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}>
        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--line-light)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{row.personName}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {row.type} · {row.fromLabel} → {row.toLabel} · {row.days} j
              </div>
              {row.note && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{row.note}</div>
              )}
            </div>
            {statusBadge(row.status)}
            {canAct && row.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <form action={approveLeave}>
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    style={{
                      background: 'var(--cyan-teal)',
                      color: '#000',
                      border: 'none',
                      padding: '8px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Valider
                  </button>
                </form>
                <form action={refuseLeave}>
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    style={{
                      background: 'var(--white)',
                      color: '#b3261e',
                      border: '1px solid var(--line-light)',
                      padding: '8px 14px',
                      fontSize: 13,
                    }}
                  >
                    Refuser
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
