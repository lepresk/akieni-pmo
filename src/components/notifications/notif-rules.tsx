'use client';

import { useState, type ReactElement } from 'react';

import { Card, MonoLabel, Toggle } from '@/components/ui';

interface Rule {
  readonly label: string;
  readonly detail: string;
}

const RULES: readonly Rule[] = [
  { label: 'Rappel quotidien de saisie', detail: '16:30 · jours ouvrés · e-mail + Slack' },
  { label: 'Alerte overbooking', detail: "> 100 % d'allocation sur 2 semaines glissantes" },
  { label: 'Alerte dépassement budget', detail: "seuil 90 % du budget d'un poste de coût" },
  { label: 'Jalon en retard', detail: 'notification au PM du niveau concerné' },
];

export function NotifRules(): ReactElement {
  const [enabled, setEnabled] = useState<readonly boolean[]>([true, true, false, true]);

  const toggle = (index: number): void => {
    setEnabled((current) => current.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <Card padding="none">
      <div className="border-line-light border-b px-[22px] py-4">
        <MonoLabel>Règles de rappel</MonoLabel>
      </div>
      {RULES.map((rule, index) => {
        const on = enabled[index] ?? false;
        return (
          <div
            key={rule.label}
            className="border-line-light flex items-center gap-3.5 border-b px-[22px] py-3.5 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium">{rule.label}</div>
              <div className="text-muted text-[12px]">{rule.detail}</div>
            </div>
            <Toggle pressed={on} onPressedChange={() => toggle(index)} aria-label={rule.label} />
          </div>
        );
      })}
    </Card>
  );
}
