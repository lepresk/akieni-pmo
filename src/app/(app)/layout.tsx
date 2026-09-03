import type { ReactNode } from 'react';

import '@/components/shell/shell.css';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { getNavBadges } from '@/lib/nav-badges-server';
import { getSession } from '@/lib/session';

export default async function AppLayout({ children }: { readonly children: ReactNode }) {
  const { role, user } = await getSession();
  const badges = await getNavBadges();

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--paper)',
        color: 'var(--ink)',
      }}
    >
      <Sidebar badges={badges} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar role={role} user={user} />
        <main style={{ flex: 1, width: '100%', padding: '24px 28px 64px' }}>{children}</main>
      </div>
    </div>
  );
}
