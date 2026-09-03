import type { ReactElement } from 'react';

import { Icon } from '@/components/icons';
import { pct, seniorityLabel, xaf } from '@/lib/display';
import { getEmployeeDetail, resolveEmployeeId } from '@/lib/employees/employee-server';
import { ROLE_LABELS } from '@/lib/rbac';
import { getSession } from '@/lib/session';

const monoLabel = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
};

export default async function EmployePage(): Promise<ReactElement> {
  const { role, employeeId } = await getSession();
  const id = await resolveEmployeeId(employeeId);
  const employee = id ? await getEmployeeDetail(id, role) : null;

  if (!employee) {
    return (
      <div style={{ padding: 22, color: 'var(--muted)' }}>Aucune fiche employé disponible.</div>
    );
  }

  const fields: readonly { readonly label: string; readonly value: string }[] = [
    { label: 'Manager N+1', value: employee.managerName },
    { label: 'Département', value: employee.departmentName },
    { label: 'Séniorité', value: seniorityLabel(employee.seniority) },
    {
      label: 'Chargeabilité moyenne',
      value: employee.avgLoad !== null ? pct(employee.avgLoad) : '-',
    },
  ];

  const canSeeSalary = employee.salaryGross !== null;

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, alignItems: 'start' }}
    >
      <div style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}>
        <div
          style={{
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderBottom: '1px solid var(--line-light)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: 'var(--black)',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 15,
            }}
          >
            {employee.initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
              {employee.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{employee.departmentName}</div>
          </div>
        </div>
        {fields.map((field) => (
          <div
            key={field.label}
            style={{
              padding: '14px 24px',
              borderBottom: '1px solid var(--line-light)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span style={monoLabel}>{field.label}</span>
            <span style={{ fontSize: 13 }}>{field.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {canSeeSalary ? (
          <div style={{ border: '1px solid var(--line-light)', background: 'var(--white)' }}>
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--line-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={monoLabel}>Rémunération · confidentiel</span>
              <span style={{ ...monoLabel, color: 'var(--cyan-teal)' }}>
                Visible · {ROLE_LABELS[role]}
              </span>
            </div>
            <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={monoLabel}>Salaire brut mensuel</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {employee.salaryGross !== null ? xaf(employee.salaryGross) : '-'}
              </span>
            </div>
            <div
              style={{
                padding: '14px 22px',
                borderTop: '1px solid var(--line-light)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={monoLabel}>TJM de référence</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {employee.referenceTjm !== null ? xaf(employee.referenceTjm) : '-'}
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: '1px dashed #c9c9c4',
              background: 'var(--white)',
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              textAlign: 'center',
            }}
          >
            <span style={{ color: 'var(--cyan-teal)', display: 'flex' }}>
              <Icon name="lock" size={28} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Bloc restreint</span>
            <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 380 }}>
              Salaire brut, net et TJM de référence sont masqués pour le rôle {ROLE_LABELS[role]}.
              Ces champs sont accessibles aux rôles Finance, RH et Direction, et n'apparaissent dans
              aucun export généré depuis ce compte.
            </span>
          </div>
        )}

        <div
          style={{ border: '1px solid var(--line-light)', background: 'var(--white)', padding: 22 }}
        >
          <span style={monoLabel}>Chargeabilité · 8 semaines</span>
          <div
            style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 16 }}
          >
            {employee.weeks.map((week) => (
              <div
                key={week.code}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 90 }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.min(100, week.pct)}%`,
                      background: week.pct > 100 ? '#b3261e' : 'var(--black)',
                    }}
                  />
                </div>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}
                >
                  {week.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
