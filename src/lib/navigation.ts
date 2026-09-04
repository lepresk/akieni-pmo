/** Navigation model for the app shell, mirroring the prototype's sidebar and titles. */

import type { IconName } from '@/components/icons';
import { getWeekSnapshot, shiftWeekSnapshot } from '@/lib/calendar/week-display';

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

const STATIC_SCREEN_META: Readonly<Record<string, string>> = {
  '/conges': '2 demandes en attente',
  '/projets': '7 projets · 4 actifs',
  '/depenses': 'Registre comptable',
  '/reporting': 'Portefeuille · 8 semaines',
  '/audit': 'Gouvernance · conservation 5 ans',
  '/notifications': '3 non lues',
};

/** Mono metadata next to the screen title (date-aware where the label depends on the calendar). */
export function getScreenMeta(pathname: string, now: Date = new Date()): string | undefined {
  const week = getWeekSnapshot(now);
  if (pathname === '/saisie') return `${week.shortLabel} · semaine en cours`;
  if (pathname === '/validations') {
    const prev = shiftWeekSnapshot(week.mondayIso, -1);
    return `${prev.shortLabel} · à valider`;
  }
  if (pathname === '/capacite') {
    const end = shiftWeekSnapshot(week.mondayIso, 7);
    return `${week.shortLabel} → ${end.shortLabel}`;
  }
  if (pathname === '/facturation') {
    const months = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ] as const;
    const month = months[now.getMonth()] ?? '';
    return `Période ${month} ${now.getFullYear()}`;
  }
  return STATIC_SCREEN_META[pathname];
}
