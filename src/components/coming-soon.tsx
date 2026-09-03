import type { ReactElement } from 'react';

/** Placeholder for screens not yet ported from the prototype. */
export function ComingSoon({ title }: { readonly title: string }): ReactElement {
  return (
    <div
      style={{
        border: '1px solid var(--line-light)',
        background: 'var(--white)',
        padding: 64,
        textAlign: 'center',
        maxWidth: 640,
        margin: '40px auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</span>
      <span style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
        Écran à venir. Le socle (design system, RBAC serveur, base de données) est en place ; le
        portage depuis le prototype se fait écran par écran.
      </span>
    </div>
  );
}
