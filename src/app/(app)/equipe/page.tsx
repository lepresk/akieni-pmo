import type { ReactElement } from 'react';

import { RESTRICTED, loadColor, pct, seniorityLabel, xaf } from '@/lib/display';
import { canSalary } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import { getTeam } from '@/lib/team/team-server';

const monoHeader = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

const columns = '1.6fr 1fr 1.3fr 1fr 1fr 1.2fr';

export default async function EquipePage(): Promise<ReactElement> {
  const { role, employeeId } = await getSession();
  const rows = await getTeam(role, employeeId);
  const showSalary = canSalary(role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <span style={monoHeader}>{rows.length} collaborateur(s) · Brazzaville · Pointe-Noire</span>
      <div
        style={{
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
          overflowX: 'auto',
        }}
      >
        <div style={{ minWidth: 860 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: columns,
              columnGap: 16,
              padding: '12px 22px',
              borderBottom: '1px solid var(--line-light)',
              background: 'var(--paper)',
              ...monoHeader,
            }}
          >
            <span>Collaborateur</span>
            <span>Département</span>
            <span>Manager N+1</span>
            <span>Séniorité</span>
            <span>Chargeabilité</span>
            <span style={{ textAlign: 'right' }}>
              {showSalary ? 'Salaire brut' : 'Salaire · restreint'}
            </span>
          </div>
          {rows.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: columns,
                columnGap: 16,
                padding: '14px 22px',
                borderBottom: '1px solid var(--line-light)',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500 }}>{row.name}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{row.departmentName}</span>
              <span style={{ fontSize: 13 }}>{row.managerName}</span>
              <span style={{ fontSize: 13 }}>{seniorityLabel(row.seniority)}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: row.avgLoad !== null ? loadColor(row.avgLoad) : 'var(--muted)',
                }}
              >
                {row.avgLoad !== null ? pct(row.avgLoad) : '-'}
              </span>
              <span
                style={{
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: row.salaryGross !== null ? 'var(--ink)' : 'var(--muted)',
                }}
              >
                {row.salaryGross !== null ? xaf(row.salaryGross) : RESTRICTED}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
