import type { ReactElement } from 'react';

import { RestrictedNotice } from '@/components/restricted-notice';
import { getAudit } from '@/lib/audit/audit-server';
import { canAudit } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

const columns = '1.2fr 1.2fr 1fr 1.6fr 1.8fr 1fr';

export default async function AuditPage(): Promise<ReactElement> {
  const { role } = await getSession();
  if (!canAudit(role)) {
    return (
      <RestrictedNotice
        title="Journal réservé à la Direction"
        body="Le journal d'audit trace les accès aux données sensibles. Il n'est consultable que par la Direction et l'Admin."
      />
    );
  }

  const rows = await getAudit();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          border: '1px dashed #c9c9c4',
          background: 'var(--white)',
          padding: '16px 20px',
          fontSize: 13,
          color: 'var(--muted)',
          lineHeight: 1.6,
        }}
      >
        Toute lecture d'un salaire, d'un TJM de référence ou d'une marge est journalisée avec
        l'auteur, le rôle et l'horodatage. Conservation 5 ans.
      </div>
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
              gridTemplateColumns: columns,
              columnGap: 16,
              padding: '12px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
              ...mono,
            }}
          >
            <span>Horodatage</span>
            <span>Auteur</span>
            <span>Rôle</span>
            <span>Action</span>
            <span>Objet</span>
            <span style={{ textAlign: 'right' }}>Nature</span>
          </div>
          {rows.map((row) => (
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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
                {row.at}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{row.who}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{row.role}</span>
              <span style={{ fontSize: 13 }}>{row.action}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{row.target}</span>
              <span style={{ textAlign: 'right' }}>
                <span
                  style={{
                    ...mono,
                    color: row.sensitive ? '#b3261e' : 'var(--muted)',
                    border: '1px solid var(--line-light)',
                    padding: '3px 8px',
                  }}
                >
                  {row.sensitive ? 'Donnée sensible' : 'Standard'}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
