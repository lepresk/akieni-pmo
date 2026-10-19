/**
 * Demo dataset used by the seed script to populate a development database with
 * the reference projects, staff, and rates used across the app.
 */

export const NON_BILLABLE_POSTES: readonly string[] = [
  'Formation interne',
  'Avant-vente',
  'Congés / Absence',
];

export const POSTE_CATALOG: readonly string[] = [
  'Développement',
  'Analyse fonctionnelle',
  'Recette / QA',
  'Gestion de projet',
  'Déploiement',
  'Biométrie',
  'Intégration',
  'Support N2',
  'Avant-vente',
  'Formation interne',
];

export interface StaffSeed {
  readonly initials: string;
  readonly name: string;
  readonly dept: string;
  readonly seniority: string;
  readonly manager: string;
  readonly tjm: string;
  readonly ref: string;
  readonly salary: string;
}

export const STAFF: readonly StaffSeed[] = [
  {
    initials: 'JT',
    name: 'Josué Tchibinda',
    dept: 'Dev',
    seniority: 'Confirmé',
    manager: 'Yann Massamba',
    tjm: '145 000',
    ref: '168 000',
    salary: '1 450 000',
  },
  {
    initials: 'YM',
    name: 'Yann Massamba',
    dept: 'Dev',
    seniority: 'Senior',
    manager: 'Sandrine Okemba',
    tjm: '195 000',
    ref: '212 000',
    salary: '2 100 000',
  },
  {
    initials: 'BM',
    name: 'Blaise Mabiala',
    dept: 'PMO',
    seniority: 'Manager',
    manager: 'Sandrine Okemba',
    tjm: '240 000',
    ref: '258 000',
    salary: '2 480 000',
  },
  {
    initials: 'GL',
    name: 'Grâce Loemba',
    dept: 'Consulting',
    seniority: 'Confirmé',
    manager: 'Yann Massamba',
    tjm: '160 000',
    ref: '175 000',
    salary: '1 620 000',
  },
  {
    initials: 'PK',
    name: 'Prisca Kouka',
    dept: 'Support',
    seniority: 'Junior',
    manager: 'Yann Massamba',
    tjm: '95 000',
    ref: '108 000',
    salary: '890 000',
  },
  {
    initials: 'NI',
    name: 'Nadia Ibara',
    dept: 'Consulting',
    seniority: 'Junior',
    manager: 'Yann Massamba',
    tjm: '105 000',
    ref: '118 000',
    salary: '820 000',
  },
];

export interface RoleUserSeed {
  readonly role: 'staff' | 'pm' | 'pmo' | 'manager' | 'finance' | 'rh' | 'direction' | 'admin';
  readonly name: string;
  readonly deptRaw: string;
  readonly initials: string;
  readonly first: string;
}

export const ROLE_USERS: readonly RoleUserSeed[] = [
  {
    role: 'staff',
    name: 'Josué Tchibinda',
    deptRaw: 'Dev · Ingénieur backend',
    initials: 'JT',
    first: 'Josué',
  },
  {
    role: 'pm',
    name: 'Blaise Mabiala',
    deptRaw: 'PMO · Chef de projet',
    initials: 'BM',
    first: 'Blaise',
  },
  {
    role: 'pmo',
    name: 'Sandrine Okemba',
    deptRaw: 'PMO · Responsable portefeuille',
    initials: 'SO',
    first: 'Sandrine',
  },
  {
    role: 'manager',
    name: 'Yann Massamba',
    deptRaw: 'Dev · Lead technique',
    initials: 'YM',
    first: 'Yann',
  },
  {
    role: 'finance',
    name: 'Aline Ngoma',
    deptRaw: 'Finance · Contrôle de gestion',
    initials: 'AN',
    first: 'Aline',
  },
  {
    role: 'rh',
    name: 'Divine Bantsimba',
    deptRaw: 'RH · Talent & paie',
    initials: 'DB',
    first: 'Divine',
  },
  {
    role: 'direction',
    name: 'Frédéric Nzé',
    deptRaw: 'Direction générale',
    initials: 'FN',
    first: 'Frédéric',
  },
  {
    role: 'admin',
    name: 'Rachel Kombo',
    deptRaw: 'IT · Administration',
    initials: 'RK',
    first: 'Rachel',
  },
];

export interface ProjectSeed {
  readonly code: string;
  readonly name: string;
  readonly client: string;
  readonly segment: string;
  readonly model: string;
  readonly pm: string;
  readonly nature: string;
  readonly budget: number;
  readonly spent: number;
  readonly costLoad: number;
  readonly description: string;
  readonly postes: readonly string[];
}

export const PROJECTS: readonly ProjectSeed[] = [
  {
    code: 'SFEC-24',
    name: 'SFEC · Facturation électronique',
    client: 'DGID · Min. Finances',
    segment: 'Public',
    model: 'Régie',
    pm: 'Orphée Bilongo',
    nature: 'programme',
    budget: 420,
    spent: 291,
    costLoad: 0.686,
    description:
      'Plateforme nationale de facturation électronique certifiée. Déploiement par vagues sur 3 200 entreprises assujetties, interconnexion DGID et archivage probant.',
    postes: [
      'Développement',
      'Analyse fonctionnelle',
      'Recette / QA',
      'Gestion de projet',
      'Déploiement',
    ],
  },
  {
    code: 'CAMU-25',
    name: 'CAMU · Couverture santé',
    client: 'CAMU',
    segment: 'Public',
    model: 'Forfait',
    pm: 'Sandrine Okemba',
    nature: 'programme',
    budget: 310,
    spent: 268,
    costLoad: 0.918,
    description:
      "Socle d'assurance maladie universelle : enrôlement des bénéficiaires, gestion des droits et liquidation des prestations.",
    postes: ['Développement', 'Analyse fonctionnelle', 'Support N2', 'Gestion de projet'],
  },
  {
    code: 'CNSS-25',
    name: 'CNSS · GED & ePayment',
    client: 'CNSS',
    segment: 'Public',
    model: 'Régie',
    pm: 'Blaise Mabiala',
    nature: 'programme',
    budget: 260,
    spent: 118,
    costLoad: 0.753,
    description:
      'Dématérialisation des dossiers cotisants, identification biométrique et encaissement en ligne des cotisations.',
    postes: ['Développement', 'Biométrie', 'Recette / QA', 'Déploiement'],
  },
  {
    code: 'PAY-26',
    name: 'AkieniPay · Intégration Mobile Money',
    client: 'Groupe Sotrada',
    segment: 'Privé',
    model: 'Forfait',
    pm: 'Loyic Ndinga',
    nature: 'simple',
    budget: 95,
    spent: 88,
    costLoad: 1.034,
    description:
      'Connecteur unique Mobile Money, cartes et virements pour la collecte marchande du groupe.',
    postes: ['Développement', 'Intégration', 'Support N2'],
  },
  {
    code: 'FLT-26',
    name: 'CarTracking · Flotte SNPC',
    client: 'SNPC',
    segment: 'Privé',
    model: 'Régie',
    pm: 'Grâce Loemba',
    nature: 'simple',
    budget: 140,
    spent: 41,
    costLoad: 0.79,
    description:
      'Supervision GPS temps réel de 480 véhicules, alerting conduite et reporting consommation.',
    postes: ['Développement', 'Déploiement', 'Support N2'],
  },
  {
    code: 'INT-00',
    name: 'Interne · Académie & avant-vente',
    client: 'Akieni',
    segment: 'Interne',
    model: 'Non facturable',
    pm: 'Sandrine Okemba',
    nature: 'simple',
    budget: 60,
    spent: 37,
    costLoad: 1,
    description: 'Temps non facturable : formation interne, avant-vente, congés et absences.',
    postes: ['Formation interne', 'Avant-vente', 'Congés / Absence'],
  },
  {
    code: 'NSIA-26',
    name: 'App Parcours client NSIA',
    client: 'NSIA Assurances',
    segment: 'Privé',
    model: 'Forfait',
    pm: 'Loyic Ndinga',
    nature: 'simple',
    budget: 110,
    spent: 34,
    costLoad: 0.82,
    description:
      'Application mobile de souscription et de suivi de sinistre : parcours client de bout en bout, sans découpage en sous-projets.',
    postes: ['Développement', 'Analyse fonctionnelle', 'Recette / QA'],
  },
];

export interface RateSeed {
  readonly seniority: string;
  readonly cost: number;
  readonly sell: number;
  readonly from: string;
  readonly old: boolean;
}

export const RATE_GRID: readonly RateSeed[] = [
  { seniority: 'Junior', cost: 78000, sell: 105000, from: '2026-01-01', old: false },
  { seniority: 'Confirmé', cost: 118000, sell: 160000, from: '2026-01-01', old: false },
  { seniority: 'Senior', cost: 156000, sell: 210000, from: '2026-01-01', old: false },
  { seniority: 'Manager', cost: 192000, sell: 255000, from: '2026-01-01', old: false },
  { seniority: 'Confirmé', cost: 108000, sell: 148000, from: '2025-01-01', old: true },
  { seniority: 'Senior', cost: 142000, sell: 195000, from: '2025-01-01', old: true },
];

export interface HolidaySeed {
  readonly label: string;
  readonly observedOn: string;
}

export const HOLIDAYS: readonly HolidaySeed[] = [
  { label: "Fête de l'Indépendance", observedOn: '2026-08-15' },
  { label: 'Toussaint', observedOn: '2026-11-01' },
  { label: 'Fête de la République', observedOn: '2026-11-28' },
  { label: 'Noël', observedOn: '2026-12-25' },
];

/** French seniority label -> enum value. */
export const SENIORITY_MAP: Readonly<
  Record<string, 'junior' | 'confirmed' | 'senior' | 'lead' | 'manager'>
> = {
  Junior: 'junior',
  Confirmé: 'confirmed',
  Senior: 'senior',
  Lead: 'lead',
  Manager: 'manager',
};

/** French segment label -> enum value. */
export const SEGMENT_MAP: Readonly<Record<string, 'public' | 'private' | 'internal'>> = {
  Public: 'public',
  Privé: 'private',
  Interne: 'internal',
};

/** French billing-model label -> enum value. */
export const MODEL_MAP: Readonly<Record<string, 'regie' | 'forfait' | 'non_billable'>> = {
  Régie: 'regie',
  Forfait: 'forfait',
  'Non facturable': 'non_billable',
};

/** French nature label -> enum value. */
export const NATURE_MAP: Readonly<Record<string, 'program' | 'simple'>> = {
  programme: 'program',
  simple: 'simple',
};

import { getWeekSnapshot, shiftWeekSnapshot } from '@/lib/calendar/week-display';

/** Eight ISO week codes starting at the current week (computed at seed/import time). */
export function buildPlanWeeks(now: Date = new Date()): readonly string[] {
  const start = getWeekSnapshot(now);
  return Array.from({ length: 8 }, (_, index) => {
    const snap = index === 0 ? start : shiftWeekSnapshot(start.mondayIso, index);
    return snap.shortLabel;
  });
}

/** @deprecated Prefer buildPlanWeeks(); kept as a call-site alias for seed.ts */
export const PLAN_WEEKS: readonly string[] = buildPlanWeeks();

export interface PlanSeed {
  readonly name: string;
  readonly load: readonly number[];
}

export const PLAN: readonly PlanSeed[] = [
  { name: 'Yann Massamba', load: [112, 108, 96, 90, 88, 84, 80, 76] },
  { name: 'Josué Tchibinda', load: [96, 92, 0, 0, 88, 92, 96, 96] },
  { name: 'Grâce Loemba', load: [100, 100, 100, 96, 0, 92, 88, 88] },
  { name: 'Blaise Mabiala', load: [78, 82, 80, 76, 72, 70, 68, 64] },
  { name: 'Prisca Kouka', load: [54, 48, 52, 56, 60, 58, 54, 50] },
  { name: 'Nadia Ibara', load: [12, 8, 0, 0, 24, 32, 40, 48] },
];

export interface SubmissionLineSeed {
  readonly project: string;
  readonly poste: string;
  readonly activity: string;
  readonly hours: readonly [number, number, number, number, number, number, number];
}

export interface SubmissionSeed {
  readonly person: string;
  readonly department: string;
  readonly manager: string;
  readonly week: string;
  /** Offset in ISO weeks from current Monday (negative = past). */
  readonly weekOffset: number;
  readonly hours: number;
  readonly billable: number;
  readonly status: 'pending' | 'validated' | 'rejected';
  readonly motif: string | null;
  readonly flags: readonly string[];
  readonly lines: readonly SubmissionLineSeed[];
}

export const SUBMISSIONS: readonly SubmissionSeed[] = [
  {
    person: 'Josué Tchibinda',
    department: 'Dev',
    manager: 'Yann Massamba',
    week: 'semaine précédente',
    weekOffset: -1,
    hours: 38.5,
    billable: 36,
    status: 'pending',
    motif: null,
    flags: ['Jeudi à 4 h · sous la capacité'],
    lines: [
      {
        project: 'SFEC · Facturation électronique',
        poste: 'Développement',
        activity: 'Développement des API métier',
        hours: [8, 8, 8, 4, 0, 0, 0],
      },
      {
        project: 'SFEC · Facturation électronique',
        poste: 'Recette / QA',
        activity: 'Recette fonctionnelle',
        hours: [0, 0, 0, 4, 4.5, 0, 0],
      },
      {
        project: 'Interne · Académie',
        poste: 'Formation interne',
        activity: 'Académie interne',
        hours: [0, 0, 0, 0, 2, 0, 0],
      },
    ],
  },
  {
    person: 'Grâce Loemba',
    department: 'Consulting',
    manager: 'Yann Massamba',
    week: 'semaine précédente',
    weekOffset: -1,
    hours: 45,
    billable: 45,
    status: 'pending',
    motif: null,
    flags: ['45 h saisies pour 40 h de capacité'],
    lines: [
      {
        project: 'CAMU · Couverture santé',
        poste: 'Analyse fonctionnelle',
        activity: 'Ateliers de cadrage',
        hours: [8, 8, 6, 0, 0, 0, 0],
      },
      {
        project: 'AkieniPay · Mobile Money',
        poste: 'Intégration',
        activity: 'Connecteurs opérateurs',
        hours: [0, 0, 2, 8, 8, 5, 0],
      },
    ],
  },
  {
    person: 'Prisca Kouka',
    department: 'Support',
    manager: 'Yann Massamba',
    week: 'semaine précédente',
    weekOffset: -1,
    hours: 21,
    billable: 14,
    status: 'pending',
    motif: null,
    flags: ['Semaine incomplète · 2 jours non saisis'],
    lines: [
      {
        project: 'CNSS · GED & ePayment',
        poste: 'Support N2',
        activity: 'Traitement des tickets N2',
        hours: [7, 7, 0, 0, 0, 0, 0],
      },
      {
        project: 'Interne · Académie',
        poste: 'Formation interne',
        activity: 'Académie interne',
        hours: [0, 0, 7, 0, 0, 0, 0],
      },
    ],
  },
  {
    person: 'Yann Massamba',
    department: 'Dev',
    manager: 'Sandrine Okemba',
    week: 'semaine précédente',
    weekOffset: -1,
    hours: 41,
    billable: 39,
    status: 'validated',
    motif: null,
    flags: [],
    lines: [
      {
        project: 'SFEC · Facturation électronique',
        poste: 'Développement',
        activity: 'Intégration front',
        hours: [8, 8, 8, 0, 0, 0, 0],
      },
      {
        project: 'CNSS · GED & ePayment',
        poste: 'Développement',
        activity: 'Développement des API métier',
        hours: [0, 0, 0, 8, 9, 0, 0],
      },
    ],
  },
  {
    person: 'Nadia Ibara',
    department: 'Consulting',
    manager: 'Yann Massamba',
    week: 'semaine précédente',
    weekOffset: -1,
    hours: 12,
    billable: 0,
    status: 'rejected',
    motif: 'Aucune imputation projet : 12 h sur « Avant-vente » sans dossier rattaché.',
    flags: [],
    lines: [
      {
        project: 'Interne · Académie & avant-vente',
        poste: 'Avant-vente',
        activity: "Réponses aux appels d'offres",
        hours: [8, 4, 0, 0, 0, 0, 0],
      },
    ],
  },
];

export interface LeaveSeed {
  readonly person: string;
  readonly type: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly days: number;
  readonly status: 'pending' | 'validated' | 'rejected';
  readonly note: string;
}

export const LEAVES: readonly LeaveSeed[] = [
  {
    person: 'Josué Tchibinda',
    type: 'Congé payé',
    fromDate: '2026-08-12',
    toDate: '2026-08-23',
    days: 10,
    status: 'pending',
    note: 'Solde après demande : 8,5 j',
  },
  {
    person: 'Prisca Kouka',
    type: 'Maladie',
    fromDate: '2026-07-28',
    toDate: '2026-07-29',
    days: 2,
    status: 'pending',
    note: 'Certificat médical joint',
  },
  {
    person: 'Grâce Loemba',
    type: 'Congé payé',
    fromDate: '2026-09-01',
    toDate: '2026-09-05',
    days: 5,
    status: 'validated',
    note: 'Validé par Blaise Mabiala · capacité ajustée',
  },
  {
    person: 'Yann Massamba',
    type: 'Congé sans solde',
    fromDate: '2026-07-15',
    toDate: '2026-07-16',
    days: 2,
    status: 'rejected',
    note: 'Refusé : jalon Charge 1 500 req/s la même semaine',
  },
];

export interface ExpenseSeed {
  readonly nature: 'achat' | 'mission';
  readonly project: string;
  readonly sub: string;
  readonly poste: string;
  readonly label: string;
  readonly supplier: string;
  readonly amount: number;
  readonly state: 'engage' | 'facture' | 'paye';
  readonly billable: boolean;
  readonly date: string;
}

export const EXPENSES: readonly ExpenseSeed[] = [
  {
    nature: 'achat',
    project: 'SFEC · Facturation électronique',
    sub: 'Solution SI & Infrastructure',
    poste: 'Développement',
    label: 'Sous-traitance intégration Oracle',
    supplier: 'Novatek SARL',
    amount: 42000000,
    state: 'facture',
    billable: false,
    date: '18 juil.',
  },
  {
    nature: 'mission',
    project: 'SFEC · Facturation électronique',
    sub: 'Conduite du changement',
    poste: 'Déploiement',
    label: 'Mission Pointe-Noire · 3 consultants',
    supplier: 'Frais internes',
    amount: 2850000,
    state: 'paye',
    billable: true,
    date: '22 juil.',
  },
  {
    nature: 'achat',
    project: 'CAMU · Couverture santé',
    sub: 'Lot 1 · Socle & API',
    poste: 'Développement',
    label: 'Licences serveur applicatif · 12 mois',
    supplier: 'Red Hat EMEA',
    amount: 18600000,
    state: 'engage',
    billable: false,
    date: '25 juil.',
  },
  {
    nature: 'achat',
    project: 'CNSS · GED & ePayment',
    sub: '-',
    poste: 'Biométrie',
    label: 'Capteurs biométriques · 40 unités',
    supplier: 'IDEMIA',
    amount: 31200000,
    state: 'engage',
    billable: true,
    date: '27 juil.',
  },
  {
    nature: 'achat',
    project: 'AkieniPay · Mobile Money',
    sub: '-',
    poste: 'Intégration',
    label: 'Certification PCI-DSS',
    supplier: 'Deloitte',
    amount: 9400000,
    state: 'facture',
    billable: false,
    date: '11 juil.',
  },
  {
    nature: 'achat',
    project: 'SFEC · Facturation électronique',
    sub: 'Solution SI & Infrastructure',
    poste: 'Développement',
    label: 'Licences Oracle Database · 24 mois',
    supplier: 'Oracle EMEA',
    amount: 3800000,
    state: 'paye',
    billable: false,
    date: '04 juil.',
  },
  {
    nature: 'mission',
    project: 'SFEC · Facturation électronique',
    sub: 'Cadre légal & conformité',
    poste: 'Analyse fonctionnelle',
    label: 'Mission Brazzaville · ateliers DGID',
    supplier: 'Frais internes',
    amount: 1240000,
    state: 'paye',
    billable: true,
    date: '09 juil.',
  },
  {
    nature: 'mission',
    project: 'SFEC · Facturation électronique',
    sub: 'Conduite du changement',
    poste: 'Déploiement',
    label: 'Per diem formateurs · 8 sessions',
    supplier: 'Frais internes',
    amount: 3600000,
    state: 'facture',
    billable: true,
    date: '24 juil.',
  },
  {
    nature: 'mission',
    project: 'SFEC · Facturation électronique',
    sub: 'Solution SI & Infrastructure',
    poste: 'Recette / QA',
    label: 'Mission Oyo · recette terrain',
    supplier: 'Frais internes',
    amount: 1850000,
    state: 'engage',
    billable: true,
    date: '28 juil.',
  },
  {
    nature: 'achat',
    project: 'CNSS · GED & ePayment',
    sub: '-',
    poste: 'Déploiement',
    label: 'Transport capteurs · 6 agences',
    supplier: 'Bolloré Logistics',
    amount: 2400000,
    state: 'facture',
    billable: false,
    date: '26 juil.',
  },
  {
    nature: 'mission',
    project: 'CAMU · Couverture santé',
    sub: 'Lot 2 · Liquidation',
    poste: 'Gestion de projet',
    label: 'Mission Pointe-Noire · comité de pilotage',
    supplier: 'Frais internes',
    amount: 960000,
    state: 'paye',
    billable: false,
    date: '16 juil.',
  },
  {
    nature: 'achat',
    project: 'CarTracking · Flotte SNPC',
    sub: '-',
    poste: 'Déploiement',
    label: 'Boîtiers GPS · 120 unités',
    supplier: 'Teltonika',
    amount: 5600000,
    state: 'engage',
    billable: true,
    date: '29 juil.',
  },
];

export interface AuditSeed {
  readonly at: string;
  readonly who: string;
  readonly role: string;
  readonly action: string;
  readonly target: string;
  readonly sensitive: boolean;
}

export const AUDIT: readonly AuditSeed[] = [
  {
    at: '29 juil. · 16:42',
    who: 'Aline Ngoma',
    role: 'Finance',
    action: 'Consultation du salaire brut',
    target: 'Josué Tchibinda · AK-0184',
    sensitive: true,
  },
  {
    at: '29 juil. · 14:08',
    who: 'Yann Massamba',
    role: 'Manager (N+1)',
    action: 'Validation de semaine',
    target: 'Grâce Loemba · S30',
    sensitive: false,
  },
  {
    at: '29 juil. · 11:20',
    who: 'Blaise Mabiala',
    role: 'Chef de projet (PM)',
    action: "Modification du budget d'un poste",
    target: 'SFEC · Recette / QA · 48 → 56 j',
    sensitive: false,
  },
  {
    at: '28 juil. · 17:55',
    who: 'Divine Bantsimba',
    role: 'RH',
    action: "Export de l'annuaire avec rémunération",
    target: '45 lignes · CSV',
    sensitive: true,
  },
  {
    at: '28 juil. · 09:12',
    who: 'Frédéric Nzé',
    role: 'Direction',
    action: 'Consultation de la marge portefeuille',
    target: '12 projets',
    sensitive: true,
  },
  {
    at: '27 juil. · 15:30',
    who: 'Rachel Kombo',
    role: 'Admin',
    action: "Création d'un poste de coût",
    target: 'Biométrie · imputable',
    sensitive: false,
  },
];

export interface InvoiceSeed {
  readonly ref: string;
  readonly project: string;
  readonly client: string;
  readonly model: string;
  readonly quantity: string;
  readonly amount: string;
  readonly status: 'draft' | 'validated' | 'issued' | 'cancelled';
}

export const INVOICES: readonly InvoiceSeed[] = [
  {
    ref: 'PF-2607',
    project: 'SFEC · Facturation électronique',
    client: 'DGID · Min. Finances',
    model: 'Régie',
    quantity: '312 j',
    amount: 'XAF 214 M',
    status: 'validated',
  },
  {
    ref: 'PF-2608',
    project: 'CNSS · GED & ePayment',
    client: 'CNSS',
    model: 'Régie',
    quantity: '118 j',
    amount: 'XAF 78 M',
    status: 'draft',
  },
  {
    ref: 'PF-2609',
    project: 'CAMU · Couverture santé',
    client: 'CAMU',
    model: 'Forfait',
    quantity: 'Jalon 2',
    amount: 'XAF 120 M',
    status: 'validated',
  },
  {
    ref: 'PF-2610',
    project: 'AkieniPay · Intégration Mobile Money',
    client: 'Groupe Sotrada',
    model: 'Forfait',
    quantity: 'Jalon 1',
    amount: 'XAF 45 M',
    status: 'issued',
  },
  {
    ref: 'PF-2611',
    project: 'CarTracking · Flotte SNPC',
    client: 'SNPC',
    model: 'Régie',
    quantity: '41 j',
    amount: 'XAF 28 M',
    status: 'draft',
  },
];

export interface EnvelopeSubSeed {
  readonly name: string;
  readonly mo: number;
  readonly achats: number;
  readonly mission: number;
}

export interface EnvelopeSeed {
  readonly code: string;
  readonly mo: number;
  readonly achats: number;
  readonly mission: number;
  readonly subs: readonly EnvelopeSubSeed[];
}

export const PROJECT_ENVELOPES: readonly EnvelopeSeed[] = [
  {
    code: 'SFEC-24',
    mo: 73000000,
    achats: 46000000,
    mission: 12000000,
    subs: [
      { name: 'Cadre légal & conformité', mo: 15000000, achats: 2000000, mission: 2000000 },
      { name: 'Solution SI & Infrastructure', mo: 40000000, achats: 42000000, mission: 4000000 },
      { name: 'Conduite du changement', mo: 18000000, achats: 2000000, mission: 6000000 },
    ],
  },
  {
    code: 'CAMU-25',
    mo: 52000000,
    achats: 20000000,
    mission: 4000000,
    subs: [
      { name: 'Lot 1 · Socle & API', mo: 34000000, achats: 19000000, mission: 1000000 },
      { name: 'Lot 2 · Liquidation', mo: 18000000, achats: 1000000, mission: 3000000 },
    ],
  },
  { code: 'CNSS-25', mo: 44000000, achats: 40000000, mission: 6000000, subs: [] },
  { code: 'PAY-26', mo: 16000000, achats: 10000000, mission: 2000000, subs: [] },
  { code: 'FLT-26', mo: 23000000, achats: 6000000, mission: 2000000, subs: [] },
  { code: 'NSIA-26', mo: 19000000, achats: 5000000, mission: 1500000, subs: [] },
  { code: 'INT-00', mo: 0, achats: 0, mission: 0, subs: [] },
];

export interface ActivitySeed {
  readonly name: string;
  readonly responsible: string;
  readonly from: number;
  readonly to: number;
  readonly days: number;
  readonly progress: number;
}

export const ACT_PLAN: Readonly<Record<string, readonly ActivitySeed[]>> = {
  Développement: [
    {
      name: 'Développement des API métier',
      responsible: 'Josué Tchibinda',
      from: 0,
      to: 4,
      days: 42,
      progress: 65,
    },
    {
      name: 'Intégration front',
      responsible: 'Yann Massamba',
      from: 2,
      to: 6,
      days: 26,
      progress: 40,
    },
    {
      name: 'Corrections post-recette',
      responsible: 'Josué Tchibinda',
      from: 5,
      to: 8,
      days: 12,
      progress: 0,
    },
  ],
  'Analyse fonctionnelle': [
    {
      name: 'Ateliers de cadrage',
      responsible: 'Grâce Loemba',
      from: 0,
      to: 2,
      days: 14,
      progress: 100,
    },
    {
      name: 'Rédaction des spécifications',
      responsible: 'Grâce Loemba',
      from: 1,
      to: 4,
      days: 18,
      progress: 70,
    },
  ],
  'Recette / QA': [
    {
      name: 'Recette fonctionnelle',
      responsible: 'Prisca Kouka',
      from: 3,
      to: 6,
      days: 16,
      progress: 25,
    },
    { name: 'Tests de charge', responsible: 'Yann Massamba', from: 4, to: 5, days: 8, progress: 0 },
  ],
  'Gestion de projet': [
    {
      name: 'Pilotage & comitologie',
      responsible: 'Blaise Mabiala',
      from: 0,
      to: 8,
      days: 22,
      progress: 55,
    },
  ],
  Déploiement: [
    {
      name: 'Déploiement par vagues',
      responsible: 'Grâce Loemba',
      from: 5,
      to: 8,
      days: 18,
      progress: 0,
    },
    {
      name: 'Reprise de données',
      responsible: 'Josué Tchibinda',
      from: 4,
      to: 6,
      days: 10,
      progress: 15,
    },
  ],
  Biométrie: [
    {
      name: 'Enrôlement biométrique',
      responsible: 'Prisca Kouka',
      from: 1,
      to: 5,
      days: 20,
      progress: 30,
    },
  ],
  Intégration: [
    {
      name: 'Connecteurs opérateurs',
      responsible: 'Grâce Loemba',
      from: 0,
      to: 4,
      days: 16,
      progress: 80,
    },
  ],
  'Support N2': [
    {
      name: 'Traitement des tickets N2',
      responsible: 'Prisca Kouka',
      from: 0,
      to: 8,
      days: 14,
      progress: 50,
    },
  ],
  'Avant-vente': [
    {
      name: "Réponses aux appels d'offres",
      responsible: 'Nadia Ibara',
      from: 0,
      to: 3,
      days: 8,
      progress: 45,
    },
  ],
  'Formation interne': [
    {
      name: 'Académie interne',
      responsible: 'Blaise Mabiala',
      from: 0,
      to: 8,
      days: 6,
      progress: 60,
    },
  ],
};

export interface AmendmentSeed {
  readonly code: string;
  readonly ref: string;
  readonly target: string;
  readonly poste: string;
  readonly reason: string;
  readonly days: number;
  readonly amount: number;
  readonly status: string;
  readonly asker: string;
  readonly date: string;
}

export const AMENDMENTS: readonly AmendmentSeed[] = [
  {
    code: 'SFEC-24',
    ref: 'AV-01',
    target: 'mo',
    poste: 'Développement',
    reason: 'Extension périmètre · 3 200 → 4 100 assujettis',
    days: 45,
    amount: 186000000,
    status: 'pending',
    asker: 'Orphée Bilongo',
    date: '24 juil.',
  },
  {
    code: 'CAMU-25',
    ref: 'AV-02',
    target: 'mo',
    poste: 'Analyse fonctionnelle',
    reason: 'Reprise de données historiques non prévue',
    days: 22,
    amount: 78000000,
    status: 'approved',
    asker: 'Sandrine Okemba',
    date: '12 juin',
  },
];
