'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

import { Icon } from '@/components/icons';
import { NAV_ITEMS } from '@/lib/navigation';

export function Sidebar({ badges }: { readonly badges: Record<string, string> }): ReactElement {
  const pathname = usePathname();

  return (
    <aside
      style={{
        flex: '0 0 240px',
        width: 240,
        background: 'var(--off-black)',
        borderRight: '1px solid var(--line)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 72,
          flex: '0 0 72px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1, color: 'var(--cyan-teal)' }}>◆</span>
        <span
          style={{ fontWeight: 600, letterSpacing: '-0.02em', fontSize: 17, color: 'var(--white)' }}
        >
          Akieni
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--muted-2)',
            border: '1px solid var(--line)',
            padding: '3px 6px',
          }}
        >
          PMO
        </span>
      </div>

      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href as Route}
              className="ak-nav-item"
              data-active={active}
              title={item.label}
            >
              <span style={{ display: 'flex', width: 18, flex: '0 0 18px', opacity: 0.9 }}>
                <Icon name={item.icon} />
              </span>
              <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
              {badges[item.key] ? <span className="ak-nav-badge">{badges[item.key]}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--muted-2)',
            textTransform: 'uppercase',
          }}
        >
          Semaine 31 · statut
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--white)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: 'var(--cyan-teal)',
              boxShadow: '0 0 0 3px rgba(18,235,214,.18)',
            }}
          />
          <span>Saisie en cours</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--muted-2)',
            textTransform: 'uppercase',
            marginTop: 6,
          }}
        >
          Est. 2023 · v. 26.05
        </div>
      </div>
    </aside>
  );
}
