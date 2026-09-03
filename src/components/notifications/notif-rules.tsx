'use client';

import { useState, type ReactElement } from 'react';

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

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

export function NotifRules(): ReactElement {
  const [enabled, setEnabled] = useState<readonly boolean[]>([true, true, false, true]);

  const toggle = (index: number): void => {
    setEnabled((current) => current.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <div style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}>
      <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line-light)', ...mono }}>
        Règles de rappel
      </div>
      {RULES.map((rule, index) => {
        const on = enabled[index] ?? false;
        return (
          <div
            key={rule.label}
            style={{
              padding: '14px 22px',
              borderBottom: '1px solid var(--line-light)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{rule.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{rule.detail}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={on}
              style={{
                width: 42,
                height: 24,
                borderRadius: 999,
                border: '1px solid var(--line-light)',
                background: on ? 'var(--cyan-teal)' : '#e7e7e4',
                position: 'relative',
                transition: 'background var(--dur-1) var(--ease)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: on ? 20 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: on ? '#000' : 'var(--white)',
                  transition: 'left var(--dur-1) var(--ease)',
                }}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
