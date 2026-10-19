import type { ReactElement } from 'react';

import { NotifRules } from '@/components/notifications/notif-rules';
import { Badge, Button, Card, EmptyState, MonoLabel, SplitLayout } from '@/components/ui';
import { cn } from '@/lib/cn';
import { markNotificationReadForm } from '@/lib/notifications/notifications-actions';
import {
  formatNotificationTime,
  listNotificationRules,
  listNotifications,
} from '@/lib/notifications/notifications-server';

export default async function NotificationsPage(): Promise<ReactElement> {
  const [feed, rules] = await Promise.all([listNotifications(), listNotificationRules()]);

  return (
    <SplitLayout
      ratio="1.5/1"
      primary={
        <Card padding="none">
          <div className="border-line-light border-b px-[22px] py-4">
            <MonoLabel>Fil d&apos;activité</MonoLabel>
          </div>
          {feed.length === 0 ? (
            <EmptyState>Aucune notification.</EmptyState>
          ) : (
            feed.map((notif) => {
              const unread = notif.readAt === null;
              return (
                <div
                  key={notif.id}
                  className={cn(
                    'border-line-light flex gap-3 border-b px-[22px] py-4 last:border-b-0',
                    unread ? 'bg-[rgba(18,235,214,0.06)]' : 'bg-white',
                  )}
                >
                  <span
                    className={cn(
                      'rounded-pill mt-1.5 size-1.5 shrink-0',
                      unread ? 'bg-cyan' : 'bg-track',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[14px] font-medium">{notif.title}</span>
                      <Badge>{notif.channel}</Badge>
                      <span className="text-muted ml-auto text-[12px]">
                        {formatNotificationTime(notif.createdAt)}
                      </span>
                    </div>
                    <div className="text-muted mt-1 text-[13px] leading-relaxed">{notif.body}</div>
                    {unread && (
                      <form action={markNotificationReadForm} className="mt-2">
                        <input type="hidden" name="id" value={notif.id} />
                        <Button type="submit" variant="ghost" className="px-0 py-0 text-[12px]">
                          Marquer comme lu
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Card>
      }
      secondary={<NotifRules rules={rules} />}
    />
  );
}
