'use client';

import { usePathname } from 'next/navigation';
import { useRef, type ReactElement } from 'react';

import { SCREEN_META, SCREEN_TITLES } from '@/lib/navigation';
import { ROLE_LABELS, ROLES, type Role } from '@/lib/rbac';
import { setRole } from '@/lib/session-actions';

interface TopbarProps {
  readonly role: Role;
  readonly user: { readonly name: string; readonly department: string; readonly initials: string };
}

export function Topbar({ role, user }: TopbarProps): ReactElement {
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const title = SCREEN_TITLES[pathname] ?? '';
  const meta = SCREEN_META[pathname];

  return (
    <header
      style={{
        height: 72,
        flex: '0 0 72px',
        background: 'rgba(255,255,255,.86)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--line-light)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span
          style={{
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            flex: '0 0 auto',
          }}
        >
          {title}
        </span>
        {meta && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              borderLeft: '1px solid var(--line-light)',
              paddingLeft: 14,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta}
          </span>
        )}
      </div>

      <form
        ref={formRef}
        action={setRole}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid var(--line-light)',
          background: 'var(--white)',
          padding: '6px 8px 6px 12px',
          flex: '0 0 auto',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Rôle actif
        </span>
        <select
          key={role}
          name="role"
          defaultValue={role}
          aria-label="Sélecteur de rôle"
          onChange={() => formRef.current?.requestSubmit()}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--ink)',
            padding: '4px 2px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {ROLES.map((value) => (
            <option key={value} value={value}>
              {ROLE_LABELS[value]}
            </option>
          ))}
        </select>
      </form>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 16,
          borderLeft: '1px solid var(--line-light)',
          flex: '0 0 auto',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            background: 'var(--black)',
            color: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
          }}
        >
          {user.initials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{user.department}</span>
        </div>
      </div>
    </header>
  );
}
