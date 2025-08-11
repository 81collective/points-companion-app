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
      className={`flex flex-col py-4 ${mobile ? '' : 'border-r border-gray-200 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800 backdrop-blur'} h-full`}
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
                  className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary-500/50
                    ${active ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'}
                    ${sidebarCollapsed && !mobile ? 'justify-center px-2' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  title={sidebarCollapsed && !mobile ? item.label : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {(!sidebarCollapsed || mobile) && <span>{item.label}</span>}
                  {active && <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 dark:bg-primary-400 rounded-r-md" aria-hidden />}
                  {sidebarCollapsed && !mobile && (
                    <span role="tooltip" className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-900 text-white text-xs py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
        })}
      </ul>
      <div className="px-4 pt-4 text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-600 font-medium select-none">
        v1.0
      </div>
    </nav>
  );
}
