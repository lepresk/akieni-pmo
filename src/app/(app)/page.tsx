import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { Icon } from '@/components/icons';
import { getDashboard } from '@/lib/dashboard/dashboard-server';
import { getSession } from '@/lib/session';

const monoLabel = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

export default async function DashboardPage(): Promise<ReactElement> {
  const { role, employeeId, user } = await getSession();
  const { queue, kpis } = await getDashboard(role, employeeId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          border: '1px solid var(--line-light)',
          background: 'var(--black)',
          color: 'var(--white)',
          padding: '28px 28px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ ...monoLabel, color: 'var(--cyan-teal)' }}>
            Mercredi 29 juillet 2026 · S31
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 0.98,
              letterSpacing: '-0.045em',
              fontWeight: 600,
            }}
          >
            Bonjour {user.firstName},<br />
            voici ce qui vous attend.
          </h1>
          <p style={{ margin: 0, color: 'var(--muted-2)', fontSize: 15, lineHeight: 1.5 }}>
            Chaque ligne mène à une action. Votre saisie alimente le pilotage financier en temps
            réel.
          </p>
        </div>
        <Link
          href={'/saisie' as Route}
          style={{
            background: 'var(--cyan-teal)',
            color: '#000',
            padding: '14px 20px',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="clock" /> Saisir mes temps <Icon name="arrow" />
        </Link>
      </div>

      <div style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}>
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--line-light)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span style={monoLabel}>À traiter aujourd'hui · rôle {role}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
            Chaque ligne mène à l'action
          </span>
        </div>
        {queue.length === 0 && (
          <div style={{ padding: '22px', fontSize: 14, color: 'var(--muted)' }}>
            Rien à traiter pour ce rôle aujourd'hui.
          </div>
        )}
        {queue.map((item) => (
          <Link
            key={item.key}
            href={item.href as Route}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              alignItems: 'center',
              padding: '16px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--white)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: item.urgent ? '#b3261e' : 'var(--cyan-teal)',
                flex: '0 0 7px',
              }}
            />
            <span
              style={{
                flex: '1 1 280px',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                {item.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                {item.detail}
              </span>
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 13,
                color: 'var(--ink)',
              }}
            >
              Ouvrir <Icon name="arrow" />
            </span>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              padding: '22px 24px',
              borderRight: '1px solid var(--line-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              minHeight: 132,
            }}
          >
            <span style={monoLabel}>{kpi.label}</span>
            <span
              style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1 }}
            >
              {kpi.value}
            </span>
            <span style={{ fontSize: 12, color: kpi.deltaColor }}>{kpi.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
