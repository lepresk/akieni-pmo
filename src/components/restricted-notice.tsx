import type { ReactElement } from 'react';

import { RestrictedPanel } from '@/components/ui';

/** @deprecated Prefer RestrictedPanel from @/components/ui. Thin re-export for existing imports. */
export function RestrictedNotice({
  title,
  body,
}: {
  readonly title: string;
  readonly body: string;
}): ReactElement {
  return <RestrictedPanel title={title} body={body} />;
}
