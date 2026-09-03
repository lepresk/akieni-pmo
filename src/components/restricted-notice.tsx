import type { ReactElement } from 'react';

import { Icon } from '@/components/icons';

/** Centered "access restricted" card shown when a role may not view a screen. */
export function RestrictedNotice({
  title,
  body,
}: {
  readonly title: string;
  readonly body: string;
}): ReactElement {
  return (
    <div
      style={{
        border: '1px solid var(--line-light)',
        background: 'var(--white)',
        padding: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        textAlign: 'center',
        maxWidth: 640,
        margin: '40px auto',
      }}
    >
      <span style={{ color: 'var(--cyan-teal)', display: 'flex' }}>
        <Icon name="lock" size={40} />
      </span>
      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</span>
      <span style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 440 }}>
        {body}
      </span>
    </div>
  );
}
