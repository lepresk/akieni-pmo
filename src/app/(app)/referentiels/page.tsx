import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { Icon } from '@/components/icons';
import { RESTRICTED, dateSlash, dayMonthFr, seniorityLabel, xaf } from '@/lib/display';
import { canRef, canSalary } from '@/lib/rbac';
import {
  getCostCenterCatalog,
  getHolidays,
  getRateGrid,
} from '@/lib/referentials/referentials-server';
import { getSession } from '@/lib/session';

type Tab = 'postes' | 'rates' | 'calendrier';

const TABS: readonly { readonly key: Tab; readonly label: string }[] = [
  { key: 'postes', label: 'Postes de coût' },
  { key: 'rates', label: 'Grille de TJM' },
  { key: 'calendrier', label: 'Calendrier' },
];

const monoHeader = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

function RestrictedNotice({
  title,
  body,
}: {
  readonly title: string;
  readonly body: string;
}): ReactElement {
  return (
    <div
      style={{
        border: '1px solid var(--line-light)',
        background: 'var(--white)',
        padding: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        textAlign: 'center',
        maxWidth: 640,
        margin: '40px auto',
      }}
    >
      <span style={{ color: 'var(--cyan-teal)', display: 'flex' }}>
        <Icon name="lock" size={40} />
      </span>
      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</span>
      <span style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 440 }}>
        {body}
      </span>
    </div>
  );
}

export default async function ReferentielsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly tab?: string }>;
}): Promise<ReactElement> {
  const { role } = await getSession();

  if (!canRef(role)) {
    return (
      <RestrictedNotice
        title="Administration réservée"
        body="Les référentiels - postes de coût, grille de TJM, calendrier - sont administrés par l'Admin, le PMO, la Finance et la Direction."
      />
    );
  }

  const requested = (await searchParams).tab;
  const tab: Tab = requested === 'rates' || requested === 'calendrier' ? requested : 'postes';
  const showCost = canSalary(role);

  const [postes, rates, holidays] = await Promise.all([
    tab === 'postes' ? getCostCenterCatalog() : Promise.resolve([]),
    tab === 'rates' ? getRateGrid() : Promise.resolve([]),
    tab === 'calendrier' ? getHolidays() : Promise.resolve([]),
  ]);

  return (
    <div style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}>
      <div
        style={{ display: 'flex', borderBottom: '1px solid var(--line-light)', flexWrap: 'wrap' }}
      >
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/referentiels?tab=${t.key}` as Route}
            className="ak-tab"
            data-active={t.key === tab}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'postes' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              columnGap: 16,
              padding: '12px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
              ...monoHeader,
            }}
          >
            <span>Poste de coût</span>
            <span>Nature</span>
            <span>Utilisation</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>
          {postes.map((c) => (
            <div
              key={c.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                columnGap: 16,
                padding: '13px 22px',
                borderBottom: '1px solid var(--line-light)',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13 }}>{c.label}</span>
              <span style={{ fontSize: 12, color: c.billable ? 'var(--ink)' : 'var(--muted)' }}>
                {c.billable ? 'Facturable' : 'Non facturable'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
                {c.usage} projet{c.usage > 1 ? 's' : ''}
              </span>
              <span style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  title="À venir"
                  style={{
                    border: '1px solid var(--line-light)',
                    background: 'var(--white)',
                    padding: '6px 11px',
                    fontSize: 12,
                  }}
                >
                  Désactiver
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'rates' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr',
              columnGap: 16,
              padding: '12px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
              ...monoHeader,
            }}
          >
            <span>Séniorité</span>
            <span>Coût chargé / j</span>
            <span>Prix de vente / j</span>
            <span>En vigueur depuis</span>
            <span style={{ textAlign: 'right' }}>État</span>
          </div>
          {rates.map((r, index) => (
            <div
              key={`${r.seniority}-${r.effectiveFrom}-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr',
                columnGap: 16,
                padding: '13px 22px',
                borderBottom: '1px solid var(--line-light)',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500 }}>{seniorityLabel(r.seniority)}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: showCost ? 'var(--ink)' : 'var(--muted)',
                }}
              >
                {showCost ? xaf(r.costPerDay) : RESTRICTED}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {xaf(r.sellPerDay)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
                {dateSlash(r.effectiveFrom)}
              </span>
              <span style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    border: '1px solid var(--line-light)',
                    color: r.isCurrent ? 'var(--ink)' : 'var(--muted)',
                    background: r.isCurrent ? 'rgba(56,240,115,.12)' : 'transparent',
                  }}
                >
                  {r.isCurrent ? 'En vigueur' : 'Historique'}
                </span>
              </span>
            </div>
          ))}
          <div
            style={{
              padding: '14px 22px',
              background: 'var(--paper)',
              fontSize: 12,
              color: 'var(--muted)',
              lineHeight: 1.6,
            }}
          >
            Un taux est daté : les changements ne réécrivent jamais les périodes déjà facturées.
          </div>
        </div>
      )}

      {tab === 'calendrier' && (
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--muted)',
              lineHeight: 1.6,
              maxWidth: 620,
            }}
          >
            Capacité de référence 8 h/j. Les jours fériés et les congés validés sortent du calcul de
            chargeabilité.
          </p>
          <div style={{ border: '1px solid var(--line-light)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                columnGap: 16,
                padding: '11px 16px',
                background: 'var(--paper)',
                borderBottom: '1px solid var(--line-light)',
                ...monoHeader,
              }}
            >
              <span>Date</span>
              <span>Jour férié · République du Congo</span>
            </div>
            {holidays.map((h) => (
              <div
                key={h.observedOn}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  columnGap: 16,
                  padding: '11px 16px',
                  borderBottom: '1px solid var(--line-light)',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {dayMonthFr(h.observedOn)}
                </span>
                <span style={{ fontSize: 13 }}>{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
