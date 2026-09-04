'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

import { Icon } from '@/components/icons';
import { MonoLabel, StatusDot } from '@/components/ui';
import { getWeekSnapshot } from '@/lib/calendar/week-display';
import { NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/cn';

export function Sidebar({ badges }: { readonly badges: Record<string, string> }): ReactElement {
  const pathname = usePathname();
  const week = getWeekSnapshot();

  return (
    <aside className="border-line bg-off-black sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r">
      <div className="h-nav border-line flex shrink-0 items-center gap-2.5 border-b px-5">
        <span className="text-cyan text-[18px] leading-none">◆</span>
        <span className="text-[17px] font-semibold tracking-tight text-white">Akieni</span>
        <span className="border-line tracking-label text-muted-2 border px-1.5 py-0.5 font-mono text-[10px]">
          PMO
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href as Route}
              title={item.label}
              data-active={active}
              className={cn(
                'text-muted-2 flex w-full items-center gap-2.5 border-l-2 border-transparent px-3 py-[11px] text-left text-[14px] transition-all duration-[var(--dur-1)] ease-[var(--ease)] hover:text-white',
                active && 'border-l-cyan bg-ink-2 text-white',
              )}
            >
              <span className="flex w-[18px] shrink-0 opacity-90">
                <Icon name={item.icon} />
              </span>
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {badges[item.key] ? (
                <span className="bg-cyan ml-auto px-1.5 py-0.5 font-mono text-[10px] text-black">
                  {badges[item.key]}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-line flex flex-col gap-1.5 border-t px-5 py-4">
        <MonoLabel tone="onDark">{week.shortLabel} · statut</MonoLabel>
        <div className="flex items-center gap-2 text-[13px] text-white">
          <StatusDot tone="accent" />
          <span>Saisie en cours</span>
        </div>
        <MonoLabel tone="onDark" className="mt-1.5">
          {week.rangeLabel}
        </MonoLabel>
      </div>
    </aside>
  );
}
