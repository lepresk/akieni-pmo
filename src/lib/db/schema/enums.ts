import { pgEnum } from 'drizzle-orm/pg-core';

/** Application roles, mirroring the RBAC model in docs/product. */
export const userRole = pgEnum('user_role', [
  'staff',
  'pm',
  'pmo',
  'manager',
  'finance',
  'rh',
  'direction',
  'admin',
]);

/** Employee / assignment seniority levels. */
export const seniority = pgEnum('seniority', ['junior', 'confirmed', 'senior', 'lead', 'manager']);

/** Commercial segment of a project. */
export const segment = pgEnum('segment', ['public', 'private', 'internal']);

/** Billing model of a project. */
export const projectModel = pgEnum('project_model', ['regie', 'forfait', 'non_billable']);

/** Whether a project is a multi-level program or a single project. */
export const projectNature = pgEnum('project_nature', ['program', 'simple']);
