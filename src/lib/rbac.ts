/**
 * Role-based access control. These predicates are the single source of truth for
 * authorization and are always evaluated server-side (see CLAUDE.md 5). The prototype's
 * client-side masking is replaced here by real server checks.
 */

export const ROLES = [
  'staff',
  'pm',
  'pmo',
  'manager',
  'finance',
  'rh',
  'direction',
  'admin',
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  staff: 'Staff',
  pm: 'Chef de projet (PM)',
  pmo: 'PMO',
  manager: 'Manager (N+1)',
  finance: 'Finance',
  rh: 'RH',
  direction: 'Direction',
  admin: 'Admin',
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

const has =
  (...allowed: readonly Role[]) =>
  (role: Role): boolean =>
    allowed.includes(role);

/** Sensitive compensation: salaries, loaded cost, reference TJM. */
export const canSalary = has('finance', 'rh', 'direction');
/** Project margin (derived from cost). */
export const canMargin = has('finance', 'direction');
/** Invoicing module. */
export const canInvoice = has('finance', 'direction', 'admin');
/** Referentials administration screen. */
export const canRef = has('admin', 'pmo', 'direction', 'finance');
/** Audit log. */
export const canAudit = has('direction', 'admin');
/** Expense entry. */
export const canExpense = has('finance', 'direction', 'admin', 'pmo');
/** Timesheet validation. */
export const canValidate = has('manager', 'pmo', 'direction', 'admin');
/** Period lock / close. */
export const canLock = has('pmo', 'direction', 'admin');
/** Staffing arbitration. */
export const canStaff = has('pmo', 'direction', 'admin', 'manager');
/** Edit project structure / planning / resources. */
export const canEdit = has('pm', 'pmo', 'direction', 'admin');
/** Edit budget. */
export const canEditBudget = has('pm', 'pmo', 'direction', 'admin', 'finance');
/** Approve or refuse a leave request. */
export const canApproveLeave = has('manager', 'rh', 'pmo', 'direction', 'admin');
