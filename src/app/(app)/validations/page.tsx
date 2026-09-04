import type { ReactElement } from 'react';

import { RestrictedNotice } from '@/components/restricted-notice';
import {
  Button,
  Card,
  HeroBanner,
  Input,
  MonoLabel,
  PageSection,
  StatusBadge,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { canValidate } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import {
  rejectSubmission,
  validateAll,
  validateSubmission,
} from '@/lib/validations/validations-actions';
import { getSubmissions } from '@/lib/validations/validations-server';

export default async function ValidationsPage(): Promise<ReactElement> {
  const { role, user } = await getSession();
  if (!canValidate(role)) {
    return (
      <RestrictedNotice
        title="Validation réservée aux managers"
        body="La validation des feuilles de temps appartient au manager N+1. Un chef de projet suit la consommation et conteste une imputation depuis l'onglet Temps d'un projet."
      />
    );
  }

  const { rows, counts, scopeNote } = await getSubmissions(role, user.name);

  return (
    <PageSection>
      <HeroBanner
        className="border-line-light border"
        title={`${counts.pending} semaine(s) à valider`}
        description={scopeNote}
        {...(counts.pending > 0
          ? {
              action: (
                <form action={validateAll}>
                  <Button type="submit" variant="primary" className="px-4 py-2.5 text-[13px]">
                    Tout valider
                  </Button>
                </form>
              ),
            }
          : {})}
      />

      <div className="tracking-label text-muted flex gap-4 font-mono text-[10px] uppercase">
        <span>À valider · {counts.pending}</span>
        <span>Validées · {counts.validated}</span>
        <span>Rejetées · {counts.rejected}</span>
      </div>

      {rows.map((row) => {
        const gap = row.hours - 40;
        const gapLabel = gap === 0 ? 'conforme' : `${gap > 0 ? '+' : ''}${gap} h`;
        return (
          <Card key={row.id} padding="none">
            <div className="border-line-light flex flex-wrap items-center gap-4 border-b px-[22px] py-4">
              <div className="min-w-0 flex-[1_1_240px]">
                <div className="text-[14px] font-medium">{row.personName}</div>
                <div className="text-muted text-[12px]">
                  {row.department} · N+1 {row.managerName} · {row.weekLabel}
                </div>
              </div>
              <div className="flex gap-5">
                <div>
                  <MonoLabel>Saisi</MonoLabel>
                  <div className="font-mono text-[14px]">{row.hours} h</div>
                </div>
                <div>
                  <MonoLabel>Facturable</MonoLabel>
                  <div className="font-mono text-[14px]">{row.billable} h</div>
                </div>
                <div>
                  <MonoLabel>Écart</MonoLabel>
                  <div
                    className={cn('font-mono text-[14px]', gap === 0 ? 'text-ink' : 'text-danger')}
                  >
                    {gapLabel}
                  </div>
                </div>
              </div>
              <StatusBadge status={row.status} />
            </div>

            {row.flags.length > 0 ? (
              <div className="border-line-light flex flex-col gap-1 border-b px-[22px] py-2.5">
                {row.flags.map((flag) => (
                  <span key={flag} className="text-danger text-[12px]">
                    {flag}
                  </span>
                ))}
              </div>
            ) : null}
            {row.motif ? (
              <div className="border-line-light text-muted border-b px-[22px] py-2.5 text-[12px]">
                Motif : {row.motif}
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5 px-[22px] py-3">
              {row.lines.map((line, index) => (
                <div key={`${row.id}-${index}`} className="flex justify-between text-[12px]">
                  <span className="text-muted">
                    {line.project} · {line.poste} · {line.task}
                  </span>
                  <span className="font-mono">{line.hours} h</span>
                </div>
              ))}
            </div>

            {row.status === 'pending' ? (
              <div className="border-line-light flex flex-wrap items-center gap-2.5 border-t px-[22px] py-3">
                <form action={validateSubmission}>
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" variant="primary" className="px-4 py-2 text-[13px]">
                    Valider
                  </Button>
                </form>
                <form action={rejectSubmission} className="flex flex-1 items-center gap-2">
                  <input type="hidden" name="id" value={row.id} />
                  <Input name="motif" placeholder="Motif de rejet" width="flex" />
                  <Button type="submit" variant="danger" className="px-4 py-2 text-[13px]">
                    Rejeter
                  </Button>
                </form>
              </div>
            ) : null}
          </Card>
        );
      })}
    </PageSection>
  );
}
