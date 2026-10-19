import { z } from 'zod';

export const updateCatalogActiveInputSchema = z
  .object({
    id: z.string().uuid(),
    active: z.boolean(),
  })
  .strict();

export type UpdateCatalogActiveInput = z.infer<typeof updateCatalogActiveInputSchema>;

export type ReferentialsActionResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: 'referential.invalid' | 'referential.unauthorized' | 'referential.not_found';
      readonly message: string;
    };
