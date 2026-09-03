/** Navigation model for the app shell, mirroring the prototype's sidebar and titles. */

import type { IconName } from '@/components/icons';

export interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  readonly icon: IconName;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'dash', label: "Ma file d'attente", href: '/', icon: 'dash' },
  { key: 'saisie', label: 'Saisie des temps', href: '/saisie', icon: 'clock' },
  { key: 'validations', label: 'Validations', href: '/validations', icon: 'check' },
  { key: 'conges', label: 'Congés', href: '/conges', icon: 'calendar' },
  { key: 'projets', label: 'Projets', href: '/projets', icon: 'folder' },
  { key: 'capacite', label: 'Plan de charge', href: '/capacite', icon: 'layers' },
  { key: 'depenses', label: 'Dépenses', href: '/depenses', icon: 'file' },
  { key: 'equipe', label: 'Équipe', href: '/equipe', icon: 'users' },
  { key: 'employe', label: 'Fiche employé', href: '/employe', icon: 'user' },
  { key: 'reporting', label: 'Reporting', href: '/reporting', icon: 'chart' },
  { key: 'facturation', label: 'Facturation', href: '/facturation', icon: 'receipt' },
  { key: 'notifications', label: 'Notifications', href: '/notifications', icon: 'bell' },
  { key: 'referentiels', label: 'Référentiels', href: '/referentiels', icon: 'settings' },
  { key: 'audit', label: "Journal d'audit", href: '/audit', icon: 'lock' },
];

/** Full screen titles shown in the topbar, keyed by pathname. */
export const SCREEN_TITLES: Readonly<Record<string, string>> = {
  '/': "Ma file d'attente",
  '/saisie': 'Saisie des temps',
  '/validations': 'Validation des temps',
  '/conges': 'Congés & absences',
  '/projets': 'Portefeuille projets',
  '/capacite': 'Plan de charge',
  '/depenses': 'Dépenses projet',
  '/equipe': 'Équipe',
  '/employe': 'Fiche employé',
  '/reporting': 'Reporting & analytics',
  '/facturation': 'Facturation',
  '/notifications': 'Notifications',
  '/referentiels': 'Référentiels',
  '/audit': "Journal d'audit",
};

/** Mono metadata shown next to the screen title in the topbar. */
export const SCREEN_META: Readonly<Record<string, string>> = {
  '/saisie': 'Semaine 31 · 24,5 h saisies',
  '/validations': 'Semaine 30 · à valider',
  '/conges': '2 demandes en attente',
  '/projets': '7 projets · 4 actifs',
  '/depenses': 'Registre comptable',
  '/capacite': 'S31 → S38',
  '/reporting': 'Portefeuille · 8 semaines',
  '/facturation': 'Période juillet 2026',
  '/audit': 'Gouvernance · conservation 5 ans',
  '/notifications': '3 non lues',
};

