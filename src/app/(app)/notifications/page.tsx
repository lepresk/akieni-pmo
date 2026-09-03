import type { ReactElement } from 'react';

import { NotifRules } from '@/components/notifications/notif-rules';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

interface Notif {
  readonly title: string;
  readonly channel: string;
  readonly body: string;
  readonly time: string;
  readonly dot: string;
  readonly unread: boolean;
}

const FEED: readonly Notif[] = [
  {
    title: 'Rappel de saisie · avant 18:00',
    channel: 'E-mail + Slack',
    body: 'Journée de mardi incomplète (6,5 h / 8 h).',
    time: '16:30',
    dot: 'var(--cyan-teal)',
    unread: true,
  },
  {
    title: 'Overbooking détecté',
    channel: 'Slack',
    body: 'Yann Massamba à 112 % en août (SFEC, CNSS).',
    time: '11:04',
    dot: '#b3261e',
    unread: false,
  },
  {
    title: 'Dépassement budget · SFEC recette',
    channel: 'E-mail',
    body: 'Recette / QA à 106 % (51 j / 48 j).',
    time: '09:12',
    dot: '#b3261e',
    unread: false,
  },
  {
    title: 'Jalon en retard · SFEC',
    channel: 'Slack',
    body: 'Test de charge 1 500 req/s décalé de 6 j.',
    time: 'hier',
    dot: 'var(--cyan-teal)',
    unread: false,
  },
  {
    title: 'Semaine 30 validée',
    channel: 'E-mail',
    body: 'Blaise Mabiala a validé 38,5 h dont 36 facturables.',
    time: 'lun.',
    dot: 'var(--green)',
    unread: false,
  },
];

export default function NotificationsPage(): ReactElement {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}
    >
      <div style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line-light)', ...mono }}>
          Fil d'activité
        </div>
        {FEED.map((notif) => (
          <div
            key={notif.title}
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--line-light)',
              display: 'flex',
              gap: 12,
              background: notif.unread ? 'rgba(18,235,214,.06)' : 'var(--white)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: notif.dot,
                marginTop: 6,
                flex: '0 0 7px',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{notif.title}</span>
                <span
                  style={{ ...mono, border: '1px solid var(--line-light)', padding: '2px 6px' }}
                >
                  {notif.channel}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>
                  {notif.time}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                {notif.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      <NotifRules />
    </div>
  );
}
