import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

import {
  Badge,
  Button,
  Card,
  DataTable,
  DataTableCell,
  DataTableRow,
  EmptyState,
  FormRow,
  Input,
  KpiGrid,
  KpiTile,
  KvList,
  KvRow,
  LinkButton,
  MonoLabel,
  PageSection,
  ProgressBar,
  Select,
  Tabs,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { marginColor, marginFromCostLoad, modelLabel, pct, segmentLabel, xaf } from '@/lib/display';
import { approveAmendment, createAmendment } from '@/lib/projects/amendments-actions';
import { getProjectHub } from '@/lib/projects/project-detail-server';
import {
  updateActivityProgressForm,
  updateAssignmentAllocationForm,
} from '@/lib/projects/project-structure-actions';
import { canEdit, canEditBudget, canMargin } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const NATURE_LABELS: Readonly<Record<string, string>> = {
  program: 'Programme',
  simple: 'Projet simple',
};

type Tab =
  'apercu' | 'sousprojets' | 'planning' | 'temps' | 'ressources' | 'budget' | 'atterrissage';

const NODE_COLUMNS = '1fr auto';
const TIME_COLUMNS = '1.4fr 1.2fr 1.8fr 0.6fr';
const COMPLETE_PROGRESS_PCT = 100;

export default async function ProjectHubPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ readonly id: string }>;
  readonly searchParams: Promise<{ readonly tab?: string; readonly node?: string }>;
}): Promise<ReactElement> {
  const { id } = await params;
  const query = await searchParams;
  const { role } = await getSession();
  const editable = canEdit(role);
  const scope = query.node ?? null;
  const hub = await getProjectHub(id, role, scope);

  if (!hub) return <EmptyState>Projet introuvable.</EmptyState>;

  const isProgram = hub.nature === 'program';
  const tabs: readonly { readonly key: Tab; readonly label: string }[] = [
    { key: 'apercu', label: 'Aperçu' },
    ...(isProgram && !scope ? [{ key: 'sousprojets' as Tab, label: 'Sous-projets' }] : []),
    { key: 'planning', label: 'Planning' },
    { key: 'temps', label: 'Temps' },
    { key: 'ressources', label: 'Ressources' },
    { key: 'budget', label: 'Budget' },
    { key: 'atterrissage', label: 'Atterrissage' },
  ];
  const requested = query.tab as Tab | undefined;
  const tab: Tab = tabs.some((t) => t.key === requested) && requested ? requested : 'apercu';

  const tabHref = (key: Tab): Route =>
    `/projets/${id}?tab=${key}${scope ? `&node=${encodeURIComponent(scope)}` : ''}` as Route;

  const tabItems = tabs.map((t) => ({ key: t.key, label: t.label, href: tabHref(t.key) }));

  const scopedBudgetDays = scope
    ? (hub.nodes.find((n) => n.name === scope)?.budgetDays ?? 0)
    : hub.budgetDays;
  const envelopeTotal = hub.envelope.mo + hub.envelope.achats + hub.envelope.mission;
  const consumed = hub.spend.facture + hub.spend.paye;
  const eac = hub.spentDays + hub.etcDays;
  const gap = eac - hub.budgetDays;

  const planningColumns = editable ? '1fr 50px 90px 130px' : '1fr 50px 90px 44px';
  const resourceColumns = editable ? '2fr 1.4fr 1fr 1fr' : '2fr 1fr 1fr 1fr';

  return (
    <PageSection>
      <Card padding="none" className="px-6 py-[22px]">
        <div className="flex flex-wrap items-center gap-3">
          {scope && (
            <Link href={tabHref('apercu').replace(/&node=.*/, '') as Route}>
              <MonoLabel tone="accent">← Programme</MonoLabel>
            </Link>
          )}
          <h1 className="text-[24px] font-semibold tracking-[-0.03em]">{scope ?? hub.name}</h1>
          <Badge tone="muted">
            {scope ? 'Sous-projet' : `${hub.code} · ${NATURE_LABELS[hub.nature] ?? hub.nature}`}
          </Badge>
        </div>
        {!scope && hub.description && (
          <p className="text-muted mt-2.5 max-w-[720px] text-[14px] leading-[1.6]">
            {hub.description}
          </p>
        )}
      </Card>

      <Tabs items={tabItems} activeKey={tab} className="flex-wrap" />

      {tab === 'apercu' && (
        <PageSection>
          <MonoLabel>Consultation</MonoLabel>
          <KpiGrid>
            {[
              { label: 'Client', value: hub.clientName },
              { label: 'Segment', value: segmentLabel(hub.segment) },
              { label: 'Modèle', value: modelLabel(hub.model) },
              { label: 'Chef de projet', value: hub.pmName },
              { label: 'Budget', value: `${scopedBudgetDays} j` },
              { label: 'Postes de coût', value: String(hub.costCenters.length) },
            ].map((fact) => (
              <KpiTile
                key={fact.label}
                label={fact.label}
                value={
                  <span className="text-[15px] font-normal tracking-normal">{fact.value}</span>
                }
                className="px-[22px] py-[18px]"
              />
            ))}
          </KpiGrid>
        </PageSection>
      )}

      {tab === 'sousprojets' && (
        <Card padding="none">
          {hub.nodes.map((node) => (
            <DataTableRow key={node.name} columns={NODE_COLUMNS} className="py-4">
              <DataTableCell stack>
                <span className="text-[14px] font-medium">{node.name}</span>
                <span className="text-muted text-[12px]">
                  PM {node.pmName ?? '-'} · {node.budgetDays} j
                </span>
              </DataTableCell>
              <DataTableCell align="end">
                <LinkButton
                  href={`/projets/${id}?tab=budget&node=${encodeURIComponent(node.name)}` as Route}
                  className="tracking-label font-mono text-[10px] uppercase"
                >
                  Piloter →
                </LinkButton>
              </DataTableCell>
            </DataTableRow>
          ))}
          {hub.nodes.length === 0 && <EmptyState>Projet simple, sans sous-projets.</EmptyState>}
        </Card>
      )}

      {tab === 'planning' && (
        <Card padding="none">
          {hub.activities.map((act) => (
            <DataTableRow key={act.id} columns={planningColumns} className="gap-x-3.5 py-[13px]">
              <DataTableCell stack>
                <span>{act.name}</span>
                <span className="text-muted text-[11px]">
                  {act.poste} · {act.responsible ?? '-'} · {act.fromWeekLabel} → {act.toWeekLabel}
                </span>
              </DataTableCell>
              <DataTableCell align="end" className="font-mono text-[12px]">
                {act.days} j
              </DataTableCell>
              <DataTableCell>
                {/* Full completion is a success signal here, so the danger threshold is off. */}
                <ProgressBar
                  value={act.progress}
                  width={90}
                  dangerAbove={Number.POSITIVE_INFINITY}
                  completeClassName={
                    act.progress >= COMPLETE_PROGRESS_PCT ? 'bg-green' : 'bg-black'
                  }
                />
              </DataTableCell>
              <DataTableCell align="end" className="font-mono text-[12px]">
                {editable ? (
                  <form
                    action={updateActivityProgressForm}
                    className="flex items-center justify-end gap-1"
                  >
                    <input type="hidden" name="activityId" value={act.id} />
                    <Input
                      name="progress"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={act.progress}
                      width={56}
                      aria-label={`Avancement ${act.name}`}
                    />
                    <Button type="submit" className="px-2 py-1 text-[11px]">
                      OK
                    </Button>
                  </form>
                ) : (
                  <>{act.progress} %</>
                )}
              </DataTableCell>
            </DataTableRow>
          ))}
        </Card>
      )}

      {tab === 'temps' && (
        <DataTable
          columns={TIME_COLUMNS}
          header={
            <>
              <MonoLabel>Personne</MonoLabel>
              <MonoLabel>Poste</MonoLabel>
              <MonoLabel>Tâche</MonoLabel>
              <MonoLabel className="text-right">Heures</MonoLabel>
            </>
          }
        >
          {hub.timeLines.map((line, index) => (
            <DataTableRow key={index} columns={TIME_COLUMNS}>
              <DataTableCell>{line.person}</DataTableCell>
              <DataTableCell tone="muted" className="text-[12px]">
                {line.poste}
              </DataTableCell>
              <DataTableCell className="text-[12px]">{line.task}</DataTableCell>
              <DataTableCell align="end" className="font-mono text-[12px]">
                {line.hours} h
              </DataTableCell>
            </DataTableRow>
          ))}
          {hub.timeLines.length === 0 && (
            <EmptyState>Aucune écriture de temps validée sur ce projet.</EmptyState>
          )}
        </DataTable>
      )}

      {tab === 'ressources' && (
        <DataTable
          columns={resourceColumns}
          header={
            <>
              <MonoLabel>Collaborateur</MonoLabel>
              <MonoLabel>Allocation</MonoLabel>
              <MonoLabel>TJM projet</MonoLabel>
              <MonoLabel className="text-right">Séniorité</MonoLabel>
            </>
          }
        >
          {hub.assignments.map((res) => (
            <DataTableRow key={res.id} columns={resourceColumns}>
              <DataTableCell>{res.employeeName}</DataTableCell>
              <DataTableCell className="font-mono text-[12px]">
                {editable ? (
                  <form action={updateAssignmentAllocationForm} className="flex items-center gap-1">
                    <input type="hidden" name="assignmentId" value={res.id} />
                    <Input
                      name="allocationPct"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={res.allocationPct}
                      width={64}
                      aria-label={`Allocation ${res.employeeName}`}
                    />
                    <Button type="submit" className="px-2 py-1 text-[11px]">
                      OK
                    </Button>
                  </form>
                ) : (
                  pct(res.allocationPct)
                )}
              </DataTableCell>
              <DataTableCell className="font-mono text-[12px]">
                {res.projectTjm !== null ? xaf(res.projectTjm) : '-'}
              </DataTableCell>
              <DataTableCell align="end" tone="muted" className="text-[12px]">
                {res.seniority ?? '-'}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      )}

      {tab === 'budget' && (
        <PageSection>
          <KpiGrid>
            {[
              { label: "Main d'œuvre", value: hub.envelope.mo },
              { label: 'Achats', value: hub.envelope.achats },
              { label: 'Frais de mission', value: hub.envelope.mission },
              { label: 'Enveloppe totale', value: envelopeTotal },
            ].map((tile) => (
              <KpiTile
                key={tile.label}
                label={tile.label}
                value={
                  <span className="font-mono text-[18px] font-semibold tracking-normal">
                    {xaf(tile.value)}
                  </span>
                }
                className="px-[22px] py-5"
              />
            ))}
          </KpiGrid>
          <Card padding="none" className="p-[22px]">
            <MonoLabel>Dépenses {scope ? `· ${scope}` : ''}</MonoLabel>
            <KvList className="mt-2.5">
              <KvRow
                label="Engagé (non consommé)"
                value={<span className="font-mono">{xaf(hub.spend.engage)}</span>}
              />
              <KvRow
                label="Consommé (facturé + payé)"
                value={<span className="font-mono">{xaf(consumed)}</span>}
              />
              {hub.costLoad !== null && (
                <KvRow
                  label="Marge projet"
                  value={
                    <span className="font-mono" style={{ color: marginColor(hub.costLoad) }}>
                      {marginFromCostLoad(hub.costLoad)} %
                    </span>
                  }
                />
              )}
            </KvList>
          </Card>
        </PageSection>
      )}

      {tab === 'atterrissage' && (
        <Card padding="none" className="p-[22px] text-[14px]">
          <KvList>
            <KvRow label="Budget" value={<span className="font-mono">{hub.budgetDays} j</span>} />
            <KvRow label="Consommé" value={<span className="font-mono">{hub.spentDays} j</span>} />
            <KvRow
              label="Reste à faire (ETC, déduit du planning)"
              value={<span className="font-mono">{hub.etcDays} j</span>}
            />
            <KvRow
              label="Atterrissage (EAC)"
              strong
              value={<span className="font-mono">{eac} j</span>}
            />
            <KvRow
              label="Écart au budget"
              value={
                <span className={cn('font-mono', gap > 0 && 'text-danger')}>
                  {gap > 0 ? '+' : ''}
                  {gap} j · {gap > 0 ? 'dépassement' : 'dans le budget'}
                </span>
              }
            />
          </KvList>

          <div className="border-line-light mt-2 border-t pt-3">
            <MonoLabel>Avenants</MonoLabel>
            {hub.amendments.length === 0 && (
              <EmptyState className="px-0 py-2">Aucun avenant.</EmptyState>
            )}
            {hub.amendments.map((am) => (
              <div key={am.id} className="mt-2 flex items-center justify-between gap-3 text-[13px]">
                <span>
                  {am.ref} · {am.reason} (+{am.days} j · {xaf(am.amount)})
                </span>
                {am.status === 'approved' ? (
                  <MonoLabel tone="default">Approuvé</MonoLabel>
                ) : canMargin(role) ? (
                  <form action={approveAmendment}>
                    <input type="hidden" name="id" value={am.id} />
                    <Button type="submit" variant="primary" className="px-3 py-1.5">
                      Approuver
                    </Button>
                  </form>
                ) : (
                  <MonoLabel>En attente</MonoLabel>
                )}
              </div>
            ))}
            {canEditBudget(role) && (
              <form action={createAmendment}>
                <FormRow className="mt-3.5 items-center gap-2 border-0 bg-transparent p-0">
                  <input type="hidden" name="projectId" value={id} />
                  <Select name="target">
                    <option value="mo">Main d&apos;œuvre</option>
                    <option value="achats">Achats</option>
                    <option value="mission">Frais de mission</option>
                  </Select>
                  <Input name="poste" placeholder="Poste" />
                  <Input name="days" type="number" min={0} placeholder="Jours" width={90} />
                  <Input
                    name="amount"
                    type="number"
                    min={0}
                    placeholder="Montant XAF"
                    width={140}
                  />
                  <Input name="reason" placeholder="Motif" className="min-w-0 flex-[1_1_160px]" />
                  <Button type="submit" className="px-3.5 py-2 text-[13px]">
                    Créer l&apos;avenant
                  </Button>
                </FormRow>
              </form>
            )}
          </div>
        </Card>
      )}
    </PageSection>
  );
}
