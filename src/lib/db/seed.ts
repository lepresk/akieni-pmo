import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import {
  activities,
  amendments,
  assignments,
  auditLog,
  clients,
  costCenterCatalog,
  costCenters,
  departments,
  employees,
  expenses,
  holidays,
  invoices,
  leaves,
  planLoad,
  projectEnvelopes,
  projectNodes,
  projects,
  rateGrid,
  submissions,
  users,
} from './schema';
import {
  ACT_PLAN,
  AMENDMENTS,
  AUDIT,
  EXPENSES,
  HOLIDAYS,
  INVOICES,
  LEAVES,
  MODEL_MAP,
  NATURE_MAP,
  NON_BILLABLE_POSTES,
  PLAN,
  PLAN_WEEKS,
  POSTE_CATALOG,
  PROJECT_ENVELOPES,
  PROJECTS,
  RATE_GRID,
  ROLE_USERS,
  SEGMENT_MAP,
  SENIORITY_MAP,
  STAFF,
  SUBMISSIONS,
} from './seed-data';

// The seed runs via tsx (outside Next), so load the local env explicitly.
import { config } from 'dotenv';

config({ path: '.env.local' });

/**
 * Seed the development database with the prototype's demo dataset. Idempotent: it
 * clears the seeded tables first, then re-inserts. Run with `pnpm db:seed`.
 */

const log = (message: string): void => {
  process.stdout.write(`${message}\n`);
};

const money = (value: string): number => Number(value.replace(/[^\d]/g, ''));

const slug = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '.');

type SeniorityValue = 'junior' | 'confirmed' | 'senior' | 'lead' | 'manager';

interface Person {
  name: string;
  deptName: string | null;
  initials: string | null;
  firstName: string | null;
  seniority: SeniorityValue | null;
  managerName: string | null;
  defaultTjm: number | null;
  referenceTjm: number | null;
  salaryGross: number | null;
}

const emptyPerson = (name: string): Person => ({
  name,
  deptName: null,
  initials: null,
  firstName: null,
  seniority: null,
  managerName: null,
  defaultTjm: null,
  referenceTjm: null,
  salaryGross: null,
});

async function main(): Promise<void> {
  const connectionString =
    process.env['DATABASE_URL'] ?? 'postgres://postgres@127.0.0.1:5432/akieni_dev';
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  log(`Seeding ${connectionString.replace(/:[^:@/]*@/, ':***@')}`);

  // 1. Reset seeded tables (FK-safe order).
  await db.delete(users);
  await db.delete(activities);
  await db.delete(assignments);
  await db.delete(amendments);
  await db.delete(projectEnvelopes);
  await db.delete(projectNodes);
  await db.delete(costCenters);
  await db.delete(projects);
  await db.delete(clients);
  await db.delete(rateGrid);
  await db.delete(holidays);
  await db.delete(costCenterCatalog);
  await db.delete(planLoad);
  await db.delete(submissions);
  await db.delete(leaves);
  await db.delete(expenses);
  await db.delete(auditLog);
  await db.delete(invoices);
  await db.delete(employees);
  await db.delete(departments);

  // 2. Build the merged people set (role users + staff + project PMs).
  const people = new Map<string, Person>();
  const ensure = (name: string): Person => {
    const existing = people.get(name);
    if (existing) return existing;
    const created = emptyPerson(name);
    people.set(name, created);
    return created;
  };

  for (const roleUser of ROLE_USERS) {
    const person = ensure(roleUser.name);
    person.deptName = roleUser.deptRaw.split('·')[0]?.trim() ?? null;
    person.initials = roleUser.initials;
    person.firstName = roleUser.first;
  }
  for (const staff of STAFF) {
    const person = ensure(staff.name);
    person.deptName = staff.dept;
    person.initials = staff.initials;
    person.seniority = SENIORITY_MAP[staff.seniority] ?? null;
    person.managerName = staff.manager;
    person.defaultTjm = money(staff.tjm);
    person.referenceTjm = money(staff.ref);
    person.salaryGross = money(staff.salary);
  }
  for (const project of PROJECTS) {
    ensure(project.pm);
  }

  // 3. Departments.
  const deptNames = new Set<string>();
  for (const person of people.values()) {
    if (person.deptName) deptNames.add(person.deptName);
  }
  const deptIdByName = new Map<string, string>();
  for (const name of deptNames) {
    const [row] = await db.insert(departments).values({ name }).returning({ id: departments.id });
    if (!row) throw new Error(`Failed to insert department ${name}`);
    deptIdByName.set(name, row.id);
  }
  log(`Departments: ${deptIdByName.size}`);

  // 4. Employees (without manager), then resolve managers.
  const employeeIdByName = new Map<string, string>();
  for (const person of people.values()) {
    const [row] = await db
      .insert(employees)
      .values({
        fullName: person.name,
        firstName: person.firstName,
        initials: person.initials,
        departmentId: person.deptName ? (deptIdByName.get(person.deptName) ?? null) : null,
        seniority: person.seniority,
        defaultTjm: person.defaultTjm,
        referenceTjm: person.referenceTjm,
        salaryGross: person.salaryGross,
      })
      .returning({ id: employees.id });
    if (!row) throw new Error(`Failed to insert employee ${person.name}`);
    employeeIdByName.set(person.name, row.id);
  }
  for (const person of people.values()) {
    if (!person.managerName) continue;
    const employeeId = employeeIdByName.get(person.name);
    const managerId = employeeIdByName.get(person.managerName);
    if (employeeId && managerId) {
      await db.update(employees).set({ managerId }).where(eq(employees.id, employeeId));
    }
  }
  log(`Employees: ${employeeIdByName.size}`);

  // Weekly planned load per employee.
  for (const person of PLAN) {
    const employeeId = employeeIdByName.get(person.name);
    if (!employeeId) continue;
    for (let index = 0; index < person.load.length; index += 1) {
      const weekCode = PLAN_WEEKS[index];
      const pct = person.load[index];
      if (weekCode === undefined || pct === undefined) continue;
      await db.insert(planLoad).values({ employeeId, weekCode, weekIndex: index, pct });
    }
  }
  log(`Plan load: ${PLAN.length} people x ${PLAN_WEEKS.length} weeks`);

  // Submissions, leaves, expenses.
  for (const sub of SUBMISSIONS) {
    await db.insert(submissions).values({
      employeeId: employeeIdByName.get(sub.person) ?? null,
      personName: sub.person,
      department: sub.department,
      managerName: sub.manager,
      weekLabel: sub.week,
      hours: sub.hours,
      billable: sub.billable,
      status: sub.status,
      motif: sub.motif,
      flags: [...sub.flags],
      lines: sub.lines.map((line) => ({ ...line })),
    });
  }
  for (const leave of LEAVES) {
    await db.insert(leaves).values({
      employeeId: employeeIdByName.get(leave.person) ?? null,
      personName: leave.person,
      type: leave.type,
      fromLabel: leave.from,
      toLabel: leave.to,
      days: leave.days,
      status: leave.status,
      note: leave.note,
    });
  }
  for (const exp of EXPENSES) {
    await db.insert(expenses).values({
      nature: exp.nature,
      projectName: exp.project,
      sub: exp.sub,
      poste: exp.poste,
      label: exp.label,
      supplier: exp.supplier,
      amount: exp.amount,
      state: exp.state,
      billable: exp.billable,
      dateLabel: exp.date,
    });
  }
  log(
    `Transactions: ${SUBMISSIONS.length} submissions, ${LEAVES.length} leaves, ${EXPENSES.length} expenses`,
  );

  for (const entry of AUDIT) {
    await db.insert(auditLog).values(entry);
  }
  for (const invoice of INVOICES) {
    await db.insert(invoices).values({
      ref: invoice.ref,
      projectName: invoice.project,
      clientName: invoice.client,
      model: invoice.model,
      quantityLabel: invoice.quantity,
      amountLabel: invoice.amount,
      status: invoice.status,
    });
  }
  log(`Audit: ${AUDIT.length} entries, Invoices: ${INVOICES.length}`);

  // 5. Users (one per demo role).
  for (const roleUser of ROLE_USERS) {
    await db.insert(users).values({
      email: `${slug(roleUser.name)}@akieni.com`,
      role: roleUser.role,
      employeeId: employeeIdByName.get(roleUser.name) ?? null,
    });
  }
  log(`Users: ${ROLE_USERS.length}`);

  // 6. Clients.
  const clientNames = new Set(PROJECTS.map((project) => project.client));
  const clientIdByName = new Map<string, string>();
  for (const name of clientNames) {
    const [row] = await db.insert(clients).values({ name }).returning({ id: clients.id });
    if (!row) throw new Error(`Failed to insert client ${name}`);
    clientIdByName.set(name, row.id);
  }
  log(`Clients: ${clientIdByName.size}`);

  // 7. Projects and their cost centers.
  const projectIdByCode = new Map<string, string>();
  for (const project of PROJECTS) {
    const segmentValue = SEGMENT_MAP[project.segment];
    const modelValue = MODEL_MAP[project.model];
    const natureValue = NATURE_MAP[project.nature];
    if (!segmentValue || !modelValue || !natureValue) {
      throw new Error(`Unmapped enum for project ${project.code}`);
    }
    const [row] = await db
      .insert(projects)
      .values({
        code: project.code,
        name: project.name,
        clientId: clientIdByName.get(project.client) ?? null,
        segment: segmentValue,
        model: modelValue,
        nature: natureValue,
        budgetDays: project.budget,
        spentDays: project.spent,
        description: project.description,
        pmEmployeeId: employeeIdByName.get(project.pm) ?? null,
        costLoad: String(project.costLoad),
      })
      .returning({ id: projects.id });
    if (!row) throw new Error(`Failed to insert project ${project.code}`);
    projectIdByCode.set(project.code, row.id);
    for (const label of project.postes) {
      await db.insert(costCenters).values({
        projectId: row.id,
        label,
        billable: !NON_BILLABLE_POSTES.includes(label),
      });
    }
  }
  log(`Projects: ${PROJECTS.length}`);

  // 7b. Project hub: envelopes, sub-projects, activities, resources, amendments.
  const staffByName = new Map(STAFF.map((staff) => [staff.name, staff]));
  const planAvgByName = new Map(
    PLAN.map((plan) => [
      plan.name,
      Math.round(plan.load.reduce((sum, value) => sum + value, 0) / plan.load.length),
    ]),
  );

  for (const env of PROJECT_ENVELOPES) {
    const projectId = projectIdByCode.get(env.code);
    if (!projectId) continue;
    const projectBudget = PROJECTS.find((p) => p.code === env.code)?.budget ?? 0;
    const projectPm = PROJECTS.find((p) => p.code === env.code)?.pm ?? null;

    await db
      .insert(projectEnvelopes)
      .values({ projectId, sub: null, mo: env.mo, achats: env.achats, mission: env.mission });

    let position = 0;
    for (const sub of env.subs) {
      const budgetDays = env.mo > 0 ? Math.round((projectBudget * sub.mo) / env.mo) : 0;
      await db
        .insert(projectNodes)
        .values({ projectId, name: sub.name, pmName: projectPm, budgetDays, position });
      await db
        .insert(projectEnvelopes)
        .values({ projectId, sub: sub.name, mo: sub.mo, achats: sub.achats, mission: sub.mission });
      position += 1;
    }
  }

  for (const project of PROJECTS) {
    const projectId = projectIdByCode.get(project.code);
    if (!projectId) continue;
    const responsibles = new Set<string>();
    for (const poste of project.postes) {
      for (const act of ACT_PLAN[poste] ?? []) {
        await db.insert(activities).values({
          projectId,
          sub: null,
          poste,
          name: act.name,
          responsible: act.responsible,
          fromWeek: act.from,
          toWeek: act.to,
          days: act.days,
          progress: act.progress,
        });
        responsibles.add(act.responsible);
      }
    }
    for (const name of responsibles) {
      const staff = staffByName.get(name);
      await db.insert(assignments).values({
        projectId,
        sub: null,
        employeeName: name,
        allocationPct: planAvgByName.get(name) ?? 50,
        projectTjm: staff ? money(staff.tjm) : null,
        seniority: staff ? (SENIORITY_MAP[staff.seniority] ?? null) : null,
      });
    }
  }

  for (const am of AMENDMENTS) {
    const projectId = projectIdByCode.get(am.code);
    if (!projectId) continue;
    await db.insert(amendments).values({
      projectId,
      ref: am.ref,
      target: am.target,
      poste: am.poste,
      reason: am.reason,
      days: am.days,
      amount: am.amount,
      status: am.status,
      asker: am.asker,
      dateLabel: am.date,
    });
  }
  log('Project hub: envelopes, sub-projects, activities, resources, amendments seeded');

  // 8. Referentials: cost-center catalog, rate grid, holidays.
  for (const label of POSTE_CATALOG) {
    await db.insert(costCenterCatalog).values({
      label,
      billable: !NON_BILLABLE_POSTES.includes(label),
    });
  }
  for (const rate of RATE_GRID) {
    const seniorityValue = SENIORITY_MAP[rate.seniority];
    if (!seniorityValue) throw new Error(`Unmapped seniority ${rate.seniority}`);
    await db.insert(rateGrid).values({
      seniority: seniorityValue,
      costPerDay: rate.cost,
      sellPerDay: rate.sell,
      effectiveFrom: rate.from,
      isCurrent: !rate.old,
    });
  }
  for (const holiday of HOLIDAYS) {
    await db.insert(holidays).values({ label: holiday.label, observedOn: holiday.observedOn });
  }
  log(
    `Referentials: ${POSTE_CATALOG.length} postes, ${RATE_GRID.length} rates, ${HOLIDAYS.length} holidays`,
  );

  await pool.end();
  log('Seed complete.');
}

main().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
