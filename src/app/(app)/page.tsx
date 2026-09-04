import type { Route } from 'next';
import type { ReactElement } from 'react';

import { Icon } from '@/components/icons';
import {
  EmptyState,
  HeroBanner,
  KpiGrid,
  KpiTile,
  LinkButton,
  List,
  ListItem,
  MonoLabel,
  PageSection,
} from '@/components/ui';
import { longDateWithWeek } from '@/lib/calendar/week-display';
import { getDashboard } from '@/lib/dashboard/dashboard-server';
import { getSession } from '@/lib/session';

export default async function DashboardPage(): Promise<ReactElement> {
  const { role, employeeId, user } = await getSession();
  const { queue, kpis } = await getDashboard(role, employeeId);

  return (
    <PageSection>
      <HeroBanner
        className="border-line-light border px-7 py-7"
        eyebrow={longDateWithWeek()}
        title={
          <>
            Bonjour {user.firstName},
            <br />
            voici ce qui vous attend.
          </>
        }
        description="Chaque ligne mène à une action. Votre saisie alimente le pilotage financier en temps réel."
        action={
          <LinkButton
            href={'/saisie' as Route}
            variant="primary"
            className="gap-2.5 px-5 py-3.5 text-[14px]"
          >
            <Icon name="clock" /> Saisir mes temps <Icon name="arrow" />
          </LinkButton>
        }
      />

      <List>
        <div className="border-line-light flex flex-wrap items-center justify-between gap-2.5 border-b px-[22px] py-4">
          <MonoLabel>À traiter aujourd&apos;hui · rôle {role}</MonoLabel>
          <span className="text-muted font-mono text-[11px]">
            Chaque ligne mène à l&apos;action
          </span>
        </div>
        {queue.length === 0 ? (
          <EmptyState>Rien à traiter pour ce rôle aujourd&apos;hui.</EmptyState>
        ) : null}
        {queue.map((item) => (
          <ListItem
            key={item.key}
            href={item.href as Route}
            urgent={item.urgent}
            title={item.label}
            detail={item.detail}
            trailing={
              <span className="text-ink flex items-center gap-2 text-[13px]">
                Ouvrir <Icon name="arrow" />
              </span>
            }
          />
        ))}
      </List>

      <KpiGrid minWidth={220}>
        {kpis.map((kpi) => (
          <KpiTile
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            className="min-h-[132px] px-6 py-[22px]"
            {...(kpi.deltaColor === '#b3261e'
              ? { deltaTone: 'danger' as const }
              : kpi.deltaColor === 'var(--cyan-teal)' || kpi.deltaColor === 'var(--green)'
                ? { deltaTone: 'accent' as const }
                : { deltaTone: 'muted' as const })}
          />
        ))}
      </KpiGrid>
    </PageSection>
  );
}
