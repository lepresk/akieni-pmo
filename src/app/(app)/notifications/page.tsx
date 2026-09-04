import type { ReactElement } from 'react';

import { NotifRules } from '@/components/notifications/notif-rules';
import { Badge, Card, MonoLabel, SplitLayout } from '@/components/ui';
import { cn } from '@/lib/cn';

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
    <SplitLayout
      ratio="1.5/1"
      primary={
        <Card padding="none">
          <div className="border-line-light border-b px-[22px] py-4">
            <MonoLabel>Fil d&apos;activité</MonoLabel>
          </div>
          {FEED.map((notif) => (
            <div
              key={notif.title}
              className={cn(
                'border-line-light flex gap-3 border-b px-[22px] py-4',
                notif.unread ? 'bg-[rgba(18,235,214,0.06)]' : 'bg-white',
              )}
            >
              <span
                className="rounded-pill mt-1.5 size-1.5 shrink-0"
                style={{ background: notif.dot }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[14px] font-medium">{notif.title}</span>
                  <Badge>{notif.channel}</Badge>
                  <span className="text-muted ml-auto text-[12px]">{notif.time}</span>
                </div>
                <div className="text-muted mt-1 text-[13px] leading-relaxed">{notif.body}</div>
              </div>
            </div>
          ))}
        </Card>
      }
      secondary={<NotifRules />}
    />
  );
}
