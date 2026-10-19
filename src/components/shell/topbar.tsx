'use client';

import { usePathname } from 'next/navigation';
import { useRef, type ReactElement } from 'react';

import { Avatar, MonoLabel } from '@/components/ui';
import { getScreenMeta, SCREEN_TITLES } from '@/lib/navigation';
import { ROLE_LABELS, ROLES, type Role } from '@/lib/rbac';
import { setRole } from '@/lib/session-actions';

interface TopbarProps {
  readonly role: Role;
  readonly user: { readonly name: string; readonly department: string; readonly initials: string };
  /** When true, show the demo role switcher; when false (SSO on), hide it. */
  readonly demoMode: boolean;
}

export function Topbar({ role, user, demoMode }: TopbarProps): ReactElement {
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const title = SCREEN_TITLES[pathname] ?? '';
  const meta = getScreenMeta(pathname);

  return (
    <header className="h-nav border-line-light sticky top-0 z-20 flex shrink-0 items-center gap-4 border-b bg-white/86 px-6 backdrop-blur-[10px]">
      <div className="flex min-w-0 flex-1 items-center gap-3.5 overflow-hidden">
        <span className="shrink-0 text-[19px] font-semibold tracking-tight whitespace-nowrap">
          {title}
        </span>
        {meta ? (
          <MonoLabel className="border-line-light overflow-hidden border-l pl-3.5 text-ellipsis whitespace-nowrap">
            {meta}
          </MonoLabel>
        ) : null}
      </div>

      {demoMode ? (
        <form
          ref={formRef}
          action={setRole}
          className="border-line-light flex shrink-0 items-center gap-2 border bg-white py-1.5 pr-2 pl-3"
        >
          <MonoLabel>Rôle actif (démo)</MonoLabel>
          <select
            key={role}
            name="role"
            defaultValue={role}
            aria-label="Sélecteur de rôle"
            onChange={() => formRef.current?.requestSubmit()}
            className="text-ink cursor-pointer border-none bg-transparent py-1 text-[14px] font-medium outline-none"
          >
            {ROLES.map((value) => (
              <option key={value} value={value}>
                {ROLE_LABELS[value]}
              </option>
            ))}
          </select>
        </form>
      ) : null}

      <div className="border-line-light flex shrink-0 items-center gap-2.5 border-l pl-4">
        <Avatar initials={user.initials} />
        <div className="flex flex-col leading-snug">
          <span className="text-[13px] font-medium">{user.name}</span>
          <span className="text-muted text-[11px]">{user.department}</span>
        </div>
      </div>
    </header>
  );
}
