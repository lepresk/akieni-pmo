import { z } from 'zod';

export const markNotificationReadSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export const setNotificationRuleSchema = z
  .object({
    id: z.string().uuid(),
    enabled: z.boolean(),
  })
  .strict();

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
export type SetNotificationRuleInput = z.infer<typeof setNotificationRuleSchema>;

export type NotificationActionResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code:
        'notification.invalid' | 'notification.unauthorized' | 'notification.not_found';
      readonly message: string;
    };
