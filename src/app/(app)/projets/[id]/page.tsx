import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { marginColor, marginFromCostLoad, modelLabel, pct, segmentLabel, xaf } from '@/lib/display';
import { approveAmendment, createAmendment } from '@/lib/projects/amendments-actions';
import { getProjectHub } from '@/lib/projects/project-detail-server';
import { canEditBudget, canMargin } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

const NATURE_LABELS: Readonly<Record<string, string>> = {
  program: 'Programme',
  simple: 'Projet simple',
};

type Tab =
  'apercu' | 'sousprojets' | 'planning' | 'temps' | 'ressources' | 'budget' | 'atterrissage';

const card = { border: '1px solid var(--line-light)', background: 'var(--white)' } as const;

function Progress({ value }: { readonly value: number }): ReactElement {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 90,
        height: 6,
        background: '#efefec',
        verticalAlign: 'middle',
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: '0 auto 0 0',
          width: `${Math.min(100, value)}%`,
          background: value >= 100 ? 'var(--green)' : 'var(--black)',
        }}
      />
    </span>
  );
}

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
  const scope = query.node ?? null;
  const hub = await getProjectHub(id, role, scope);

  if (!hub) return <div style={{ padding: 22, color: 'var(--muted)' }}>Projet introuvable.</div>;

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

  const scopedBudgetDays = scope
    ? (hub.nodes.find((n) => n.name === scope)?.budgetDays ?? 0)
    : hub.budgetDays;
  const envelopeTotal = hub.envelope.mo + hub.envelope.achats + hub.envelope.mission;
  const consumed = hub.spend.facture + hub.spend.paye;
  const eac = hub.spentDays + hub.etcDays;
  const gap = eac - hub.budgetDays;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {scope && (
            <Link
              href={tabHref('apercu').replace(/&node=.*/, '') as Route}
              style={{ ...mono, color: 'var(--cyan-teal)' }}
            >
              ← Programme
            </Link>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em' }}>
            {scope ?? hub.name}
          </h1>
          <span style={{ ...mono, border: '1px solid var(--line-light)', padding: '3px 8px' }}>
            {scope ? 'Sous-projet' : `${hub.code} · ${NATURE_LABELS[hub.nature] ?? hub.nature}`}
          </span>
        </div>
        {!scope && hub.description && (
          <p
            style={{
              marginTop: 10,
              fontSize: 14,
              color: 'var(--muted)',
              lineHeight: 1.6,
              maxWidth: 720,
            }}
          >
            {hub.description}
          </p>
        )}
      </div>

      <div
        style={{ display: 'flex', borderBottom: '1px solid var(--line-light)', flexWrap: 'wrap' }}
      >
        {tabs.map((t) => (
          <Link key={t.key} href={tabHref(t.key)} className="ak-tab" data-active={t.key === tab}>
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'apercu' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            ...card,
          }}
        >
          {[
            { label: 'Client', value: hub.clientName },
            { label: 'Segment', value: segmentLabel(hub.segment) },
            { label: 'Modèle', value: modelLabel(hub.model) },
            { label: 'Chef de projet', value: hub.pmName },
            { label: 'Budget', value: `${scopedBudgetDays} j` },
            { label: 'Postes de coût', value: String(hub.costCenters.length) },
          ].map((fact) => (
            <div
              key={fact.label}
              style={{
                padding: '18px 22px',
                borderRight: '1px solid var(--line-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={mono}>{fact.label}</span>
              <span style={{ fontSize: 15 }}>{fact.value}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'sousprojets' && (
        <div style={card}>
          {hub.nodes.map((node) => (
            <div
              key={node.name}
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--line-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{node.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  PM {node.pmName ?? '-'} · {node.budgetDays} j
                </div>
              </div>
              <Link
                href={`/projets/${id}?tab=budget&node=${encodeURIComponent(node.name)}` as Route}
                style={{
                  ...mono,
                  border: '1px solid var(--line-light)',
                  padding: '8px 12px',
                  color: 'var(--ink)',
                }}
              >
                Piloter →
              </Link>
            </div>
          ))}
          {hub.nodes.length === 0 && (
            <div style={{ padding: 22, fontSize: 13, color: 'var(--muted)' }}>
              Projet simple, sans sous-projets.
            </div>
          )}
        </div>
      )}

      {tab === 'planning' && (
        <div style={card}>
          {hub.activities.map((act, index) => (
            <div
              key={`${act.name}-${index}`}
              style={{
                padding: '13px 22px',
                borderBottom: '1px solid var(--line-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 260px' }}>
                <div style={{ fontSize: 13 }}>{act.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {act.poste} · {act.responsible} · S{31 + act.fromWeek} → S{31 + act.toWeek}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  width: 50,
                  textAlign: 'right',
                }}
              >
                {act.days} j
              </span>
              <Progress value={act.progress} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  width: 44,
                  textAlign: 'right',
                }}
              >
                {act.progress} %
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'temps' && (
        <div style={card}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1.2fr 1.8fr 0.6fr',
              columnGap: 16,
              padding: '12px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
              ...mono,
            }}
          >
            <span>Personne</span>
            <span>Poste</span>
            <span>Tâche</span>
            <span style={{ textAlign: 'right' }}>Heures</span>
          </div>
          {hub.timeLines.map((line, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1.2fr 1.8fr 0.6fr',
                columnGap: 16,
                padding: '12px 22px',
                borderBottom: '1px solid var(--line-light)',
              }}
            >
              <span style={{ fontSize: 13 }}>{line.person}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{line.poste}</span>
              <span style={{ fontSize: 12 }}>{line.task}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {line.hours} h
              </span>
            </div>
          ))}
          {hub.timeLines.length === 0 && (
            <div style={{ padding: 22, fontSize: 13, color: 'var(--muted)' }}>
              Aucune écriture de temps validée sur ce projet.
            </div>
          )}
        </div>
      )}

      {tab === 'ressources' && (
        <div style={card}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              columnGap: 16,
              padding: '12px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
              ...mono,
            }}
          >
            <span>Collaborateur</span>
            <span>Allocation</span>
            <span>TJM projet</span>
            <span style={{ textAlign: 'right' }}>Séniorité</span>
          </div>
          {hub.assignments.map((res, index) => (
            <div
              key={`${res.employeeName}-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                columnGap: 16,
                padding: '12px 22px',
                borderBottom: '1px solid var(--line-light)',
              }}
            >
              <span style={{ fontSize: 13 }}>{res.employeeName}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {pct(res.allocationPct)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {res.projectTjm !== null ? xaf(res.projectTjm) : '-'}
              </span>
              <span style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>
                {res.seniority ?? '-'}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'budget' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              ...card,
            }}
          >
            {[
              { label: "Main d'œuvre", value: hub.envelope.mo },
              { label: 'Achats', value: hub.envelope.achats },
              { label: 'Frais de mission', value: hub.envelope.mission },
              { label: 'Enveloppe totale', value: envelopeTotal },
            ].map((tile) => (
              <div
                key={tile.label}
                style={{
                  padding: '20px 22px',
                  borderRight: '1px solid var(--line-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <span style={mono}>{tile.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>
                  {xaf(tile.value)}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              ...card,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: 13,
            }}
          >
            <span style={mono}>Dépenses {scope ? `· ${scope}` : ''}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Engagé (non consommé)</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{xaf(hub.spend.engage)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Consommé (facturé + payé)</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{xaf(consumed)}</span>
            </div>
            {hub.costLoad !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Marge projet</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: marginColor(hub.costLoad) }}>
                  {marginFromCostLoad(hub.costLoad)} %
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'atterrissage' && (
        <div
          style={{
            ...card,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            fontSize: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Budget</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{hub.budgetDays} j</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Consommé</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{hub.spentDays} j</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Reste à faire (ETC, déduit du planning)</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{hub.etcDays} j</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>Atterrissage (EAC)</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{eac} j</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Écart au budget</span>
            <span
              style={{ fontFamily: 'var(--font-mono)', color: gap > 0 ? '#b3261e' : 'var(--ink)' }}
            >
              {gap > 0 ? '+' : ''}
              {gap} j · {gap > 0 ? 'dépassement' : 'dans le budget'}
            </span>
          </div>
          <div style={{ marginTop: 8, borderTop: '1px solid var(--line-light)', paddingTop: 12 }}>
            <span style={mono}>Avenants</span>
            {hub.amendments.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
                Aucun avenant.
              </div>
            )}
            {hub.amendments.map((am) => (
              <div
                key={am.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                <span>
                  {am.ref} · {am.reason} (+{am.days} j · {xaf(am.amount)})
                </span>
                {am.status === 'approved' ? (
                  <span style={{ ...mono, color: 'var(--ink)' }}>Approuvé</span>
                ) : canMargin(role) ? (
                  <form action={approveAmendment}>
                    <input type="hidden" name="id" value={am.id} />
                    <button
                      type="submit"
                      style={{
                        background: 'var(--cyan-teal)',
                        color: '#000',
                        border: 'none',
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      Approuver
                    </button>
                  </form>
                ) : (
                  <span style={{ ...mono, color: 'var(--muted)' }}>En attente</span>
                )}
              </div>
            ))}
            {canEditBudget(role) && (
              <form
                action={createAmendment}
                style={{
                  marginTop: 14,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <input type="hidden" name="projectId" value={id} />
                <select
                  name="target"
                  style={{
                    border: '1px solid var(--line-light)',
                    padding: '8px 10px',
                    fontSize: 13,
                  }}
                >
                  <option value="mo">Main d&apos;œuvre</option>
                  <option value="achats">Achats</option>
                  <option value="mission">Frais de mission</option>
                </select>
                <input
                  name="poste"
                  placeholder="Poste"
                  style={{
                    border: '1px solid var(--line-light)',
                    padding: '8px 10px',
                    fontSize: 13,
                  }}
                />
                <input
                  name="days"
                  type="number"
                  min={0}
                  placeholder="Jours"
                  style={{
                    border: '1px solid var(--line-light)',
                    padding: '8px 10px',
                    fontSize: 13,
                    width: 90,
                  }}
                />
                <input
                  name="amount"
                  type="number"
                  min={0}
                  placeholder="Montant XAF"
                  style={{
                    border: '1px solid var(--line-light)',
                    padding: '8px 10px',
                    fontSize: 13,
                    width: 140,
                  }}
                />
                <input
                  name="reason"
                  placeholder="Motif"
                  style={{
                    border: '1px solid var(--line-light)',
                    padding: '8px 10px',
                    fontSize: 13,
                    flex: '1 1 160px',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--white)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line-light)',
                    padding: '8px 14px',
                    fontSize: 13,
                  }}
                >
                  Créer l&apos;avenant
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
