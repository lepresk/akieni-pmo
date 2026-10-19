'use client';

import { useState, type ReactElement } from 'react';

import { Card, EmptyState, MonoLabel, Toggle } from '@/components/ui';
import { setNotificationRule } from '@/lib/notifications/notifications-actions';
import type { NotificationRuleView } from '@/lib/notifications/notifications-server';

export function NotifRules({
  rules: initialRules,
}: {
  readonly rules: readonly NotificationRuleView[];
}): ReactElement {
  const [rules, setRules] = useState<readonly NotificationRuleView[]>(initialRules);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const toggle = async (rule: NotificationRuleView): Promise<void> => {
    const nextEnabled = !rule.enabled;
    setPendingId(rule.id);
    setRules((current) =>
      current.map((row) => (row.id === rule.id ? { ...row, enabled: nextEnabled } : row)),
    );

    const result = await setNotificationRule({ id: rule.id, enabled: nextEnabled });
    if (!result.ok) {
      setRules((current) =>
        current.map((row) => (row.id === rule.id ? { ...row, enabled: rule.enabled } : row)),
      );
    }
    setPendingId(null);
  };

  return (
    <Card padding="none">
      <div className="border-line-light border-b px-[22px] py-4">
        <MonoLabel>Règles de rappel</MonoLabel>
      </div>
      {rules.length === 0 ? (
        <EmptyState>Aucune règle enregistrée.</EmptyState>
      ) : (
        rules.map((rule) => {
          const busy = pendingId === rule.id;
          return (
            <div
              key={rule.id}
              className="border-line-light flex items-center gap-3.5 border-b px-[22px] py-3.5 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium">{rule.label}</div>
              </div>
              <Toggle
                pressed={rule.enabled}
                onPressedChange={() => {
                  if (!busy) void toggle(rule);
                }}
                aria-label={rule.label}
              />
            </div>
          );
        })
      )}
    </Card>
  );
}
