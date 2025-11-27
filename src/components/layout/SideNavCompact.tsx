"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationItems } from '@/config/navigation';
import { useNavigationStore } from '@/stores/navigationStore';

export default function SideNavCompact({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useNavigationStore();

  return (
    <nav
      className={`flex flex-col py-4 ${mobile ? '' : 'border-r border-neutral-100 bg-white/80 backdrop-blur-xl'} h-full`}
      aria-label="Primary"
    >
      <ul className="flex-1 space-y-1 px-2">
        {navigationItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative focus:outline-none focus:ring-2 focus:ring-brand-500/50
                    ${active ? 'bg-brand-50 text-brand-700' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
                    ${sidebarCollapsed && !mobile ? 'justify-center px-2' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  title={sidebarCollapsed && !mobile ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : ''}`} />
                  {(!sidebarCollapsed || mobile) && <span>{item.label}</span>}
                  {active && <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-md" aria-hidden />}
                  {sidebarCollapsed && !mobile && (
                    <span role="tooltip" className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-neutral-900 text-white text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
        })}
      </ul>
      <div className="px-4 pt-4 text-[10px] uppercase tracking-wide text-neutral-400 font-medium select-none">
        v1.0
      </div>
    </nav>
  );
}
