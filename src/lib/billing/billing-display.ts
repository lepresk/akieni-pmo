import type { InvoiceStatus } from '@/lib/db/schema/billing';

/** French display labels for invoice status codes. */
export function invoiceStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'draft':
      return 'Brouillon';
    case 'validated':
      return 'Validée';
    case 'issued':
      return 'Émise';
    case 'cancelled':
      return 'Annulée';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/** Map legacy French seed strings to enum codes. */
export function invoiceStatusFromSeedLabel(label: string): InvoiceStatus {
  switch (label) {
    case 'Brouillon':
      return 'draft';
    case 'À valider':
    case 'Validée':
      return 'validated';
    case 'Envoyée':
    case 'Émise':
      return 'issued';
    case 'Annulée':
      return 'cancelled';
    default:
      return 'draft';
  }
}
