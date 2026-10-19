import type { ReactNode } from 'react';

import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { Callout } from '@/components/ui';
import { isGoogleAuthConfigured } from '@/lib/auth/is-google-auth-configured';
import { getNavBadges } from '@/lib/nav-badges-server';
import { getSession } from '@/lib/session';

export default async function AppLayout({ children }: { readonly children: ReactNode }) {
  const { role, user } = await getSession();
  const badges = await getNavBadges();
  const demoMode = !isGoogleAuthConfigured();

  return (
    <div className="bg-paper text-ink flex min-h-screen">
      <Sidebar badges={badges} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} user={user} demoMode={demoMode} />
        {demoMode ? (
          <div className="px-7 pt-4">
            <Callout variant="warning">
              Mode démonstration: le rôle est sélectionnable. SSO Google Workspace non configuré.
            </Callout>
          </div>
        ) : null}
        <main className="w-full flex-1 px-7 pt-6 pb-16">{children}</main>
      </div>
    </div>
  );
}
