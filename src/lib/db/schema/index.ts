/**
 * Database schema barrel. The current migration covers the reference/organization core
 * (departments, employees, users, clients, projects, cost centers, rate grid, holidays).
 * Transactional entities (timesheets, expenses, leaves, assignments, plan, invoices) are
 * added in the next slice.
 */
export * from './enums';
export * from './organization';
export * from './clients';
export * from './projects';
export * from './referentials';
export * from './plan';
export * from './transactions';
export * from './audit';
export * from './billing';
export * from './notifications';
export * from './project-structure';
