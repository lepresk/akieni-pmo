import type { ReactElement } from 'react';

import { RestrictedNotice } from '@/components/restricted-notice';
import { getInvoices } from '@/lib/billing/billing-server';
import { canInvoice } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

const columns = '0.8fr 1.8fr 1.2fr 0.8fr 0.9fr 1fr 1fr';

function statusColor(status: string): string {
  if (status === 'Validée') return 'var(--ink)';
  if (status === 'Envoyée') return 'var(--ink)';
  return 'var(--muted)';
}

export default async function FacturationPage(): Promise<ReactElement> {
  const { role } = await getSession();
  if (!canInvoice(role)) {
    return (
      <RestrictedNotice
        title="Facturation réservée à la Finance"
        body="Le module de facturation est accessible à la Finance, à la Direction et à l'Admin."
      />
    );
  }

  const rows = await getInvoices();

  return (
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
          <span>Réf.</span>
          <span>Projet</span>
          <span>Client</span>
          <span>Modèle</span>
          <span>Quantité</span>
          <span>Montant HT</span>
          <span style={{ textAlign: 'right' }}>Statut</span>
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
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.ref}</span>
            <span style={{ fontSize: 13 }}>{row.projectName}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{row.clientName}</span>
            <span style={{ fontSize: 12 }}>{row.model}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {row.quantityLabel}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.amountLabel}</span>
            <span style={{ textAlign: 'right' }}>
              <span
                style={{
                  ...mono,
                  color: statusColor(row.status),
                  border: '1px solid var(--line-light)',
                  padding: '3px 8px',
                }}
              >
                {row.status}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
