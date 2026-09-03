import type { ReactElement } from 'react';

import { RestrictedNotice } from '@/components/restricted-notice';
import { canValidate } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import {
  rejectSubmission,
  validateAll,
  validateSubmission,
} from '@/lib/validations/validations-actions';
import { getSubmissions } from '@/lib/validations/validations-server';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

function statusBadge(status: 'pending' | 'validated' | 'rejected'): ReactElement {
  const map = {
    pending: { label: 'À valider', color: 'var(--ink)', bg: 'transparent' },
    validated: { label: 'Validée', color: 'var(--ink)', bg: 'rgba(56,240,115,.14)' },
    rejected: { label: 'Rejetée', color: '#b3261e', bg: 'transparent' },
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

export default async function ValidationsPage(): Promise<ReactElement> {
  const { role, user } = await getSession();
  if (!canValidate(role)) {
    return (
      <RestrictedNotice
        title="Validation réservée aux managers"
        body="La validation des feuilles de temps appartient au manager N+1. Un chef de projet suit la consommation et conteste une imputation depuis l'onglet Temps d'un projet."
      />
    );
  }

  const { rows, counts, scopeNote } = await getSubmissions(role, user.name);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          border: '1px solid var(--line-light)',
          background: 'var(--black)',
          color: 'var(--white)',
          padding: '18px 22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {counts.pending} semaine(s) à valider
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted-2)', marginTop: 4 }}>{scopeNote}</div>
          </div>
          {counts.pending > 0 && (
            <form action={validateAll}>
              <button
                type="submit"
                style={{
                  background: 'var(--cyan-teal)',
                  color: '#000',
                  border: 'none',
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Tout valider
              </button>
            </form>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, ...mono }}>
        <span>À valider · {counts.pending}</span>
        <span>Validées · {counts.validated}</span>
        <span>Rejetées · {counts.rejected}</span>
      </div>

      {rows.map((row) => {
        const gap = row.hours - 40;
        const gapLabel = gap === 0 ? 'conforme' : `${gap > 0 ? '+' : ''}${gap} h`;
        return (
          <div
            key={row.id}
            style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}
          >
            <div
              style={{
                padding: '16px 22px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'center',
                borderBottom: '1px solid var(--line-light)',
              }}
            >
              <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{row.personName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {row.department} · N+1 {row.managerName} · {row.weekLabel}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={mono}>Saisi</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{row.hours} h</div>
                </div>
                <div>
                  <div style={mono}>Facturable</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>
                    {row.billable} h
                  </div>
                </div>
                <div>
                  <div style={mono}>Écart</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 14,
                      color: gap === 0 ? 'var(--ink)' : '#b3261e',
                    }}
                  >
                    {gapLabel}
                  </div>
                </div>
              </div>
              {statusBadge(row.status)}
            </div>

            {row.flags.length > 0 && (
              <div
                style={{
                  padding: '10px 22px',
                  borderBottom: '1px solid var(--line-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {row.flags.map((flag) => (
                  <span key={flag} style={{ fontSize: 12, color: '#b3261e' }}>
                    {flag}
                  </span>
                ))}
              </div>
            )}
            {row.motif && (
              <div
                style={{
                  padding: '10px 22px',
                  borderBottom: '1px solid var(--line-light)',
                  fontSize: 12,
                  color: 'var(--muted)',
                }}
              >
                Motif : {row.motif}
              </div>
            )}

            <div style={{ padding: '12px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {row.lines.map((line, index) => (
                <div
                  key={`${row.id}-${index}`}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
                >
                  <span style={{ color: 'var(--muted)' }}>
                    {line.project} · {line.poste} · {line.task}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{line.hours} h</span>
                </div>
              ))}
            </div>

            {row.status === 'pending' && (
              <div
                style={{
                  padding: '12px 22px',
                  borderTop: '1px solid var(--line-light)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <form action={validateSubmission}>
                  <input type="hidden" name="id" value={row.id} />
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
                    Valider
                  </button>
                </form>
                <form
                  action={rejectSubmission}
                  style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 auto' }}
                >
                  <input type="hidden" name="id" value={row.id} />
                  <input
                    name="motif"
                    placeholder="Motif de rejet"
                    style={{
                      flex: 1,
                      minWidth: 160,
                      border: '1px solid var(--line-light)',
                      padding: '8px 10px',
                      fontSize: 13,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: 'var(--white)',
                      color: '#b3261e',
                      border: '1px solid var(--line-light)',
                      padding: '9px 16px',
                      fontSize: 13,
                    }}
                  >
                    Rejeter
                  </button>
                </form>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
