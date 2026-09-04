import type { ReactElement } from 'react';

import { Icon } from '@/components/icons';
import { Avatar, Card, EmptyState, MeterBar, MonoLabel, SplitLayout, Stack } from '@/components/ui';
import { pct, seniorityLabel, xaf } from '@/lib/display';
import { getEmployeeDetail, resolveEmployeeId } from '@/lib/employees/employee-server';
import { ROLE_LABELS } from '@/lib/rbac';
import { getSession } from '@/lib/session';

export default async function EmployePage(): Promise<ReactElement> {
  const { role, employeeId } = await getSession();
  const id = await resolveEmployeeId(employeeId);
  const employee = id ? await getEmployeeDetail(id, role) : null;

  if (!employee) {
    return <EmptyState>Aucune fiche employé disponible.</EmptyState>;
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
    <SplitLayout
      ratio="1/1.3"
      primary={
        <Card padding="none">
          <div className="border-line-light flex items-center gap-3.5 border-b p-6">
            <Avatar initials={employee.initials} size="lg" className="size-12 text-[15px]" />
            <div>
              <div className="text-[18px] font-semibold tracking-tight">{employee.name}</div>
              <div className="text-muted text-[13px]">{employee.departmentName}</div>
            </div>
          </div>
          {fields.map((field) => (
            <div
              key={field.label}
              className="border-line-light flex justify-between gap-3 border-b px-6 py-3.5 last:border-b-0"
            >
              <MonoLabel>{field.label}</MonoLabel>
              <span className="text-[13px]">{field.value}</span>
            </div>
          ))}
        </Card>
      }
      secondary={
        <Stack gap={20}>
          {canSeeSalary ? (
            <Card padding="none">
              <div className="border-line-light flex items-center justify-between border-b px-[22px] py-4">
                <MonoLabel>Rémunération · confidentiel</MonoLabel>
                <MonoLabel tone="accent">Visible · {ROLE_LABELS[role]}</MonoLabel>
              </div>
              <div className="flex justify-between px-[22px] py-3.5">
                <MonoLabel>Salaire brut mensuel</MonoLabel>
                <span className="font-mono text-[13px]">
                  {employee.salaryGross !== null ? xaf(employee.salaryGross) : '-'}
                </span>
              </div>
              <div className="border-line-light flex justify-between border-t px-[22px] py-3.5">
                <MonoLabel>TJM de référence</MonoLabel>
                <span className="font-mono text-[13px]">
                  {employee.referenceTjm !== null ? xaf(employee.referenceTjm) : '-'}
                </span>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center gap-3 border border-dashed border-[#c9c9c4] bg-white p-7 text-center">
              <span className="text-cyan flex">
                <Icon name="lock" size={28} />
              </span>
              <span className="text-[15px] font-semibold">Bloc restreint</span>
              <span className="text-muted max-w-[380px] text-[13px] leading-relaxed">
                Salaire brut, net et TJM de référence sont masqués pour le rôle {ROLE_LABELS[role]}.
                Ces champs sont accessibles aux rôles Finance, RH et Direction, et
                n&apos;apparaissent dans aucun export généré depuis ce compte.
              </span>
            </div>
          )}

          <Card padding="md">
            <MonoLabel>Chargeabilité · 8 semaines</MonoLabel>
            <MeterBar weeks={employee.weeks} className="mt-4 h-[120px]" />
          </Card>
        </Stack>
      }
    />
  );
}
