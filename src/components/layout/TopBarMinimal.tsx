"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PanelLeftOpen, PanelLeftClose, User } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/contexts/AuthContext';
// Removed RealTimeSystemClean per simplification
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';

interface Props {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export default function TopBarMinimal({ onMobileMenuToggle, mobileMenuOpen }: Props) {
  const { sidebarCollapsed, toggleSidebar } = useNavigationStore();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { preferences } = useDashboardPreferences();
  const pathname = usePathname();

  const navLinks = React.useMemo(() => ([
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/cards', label: 'Cards' },
    { href: '/insights', label: 'Insights' },
    { href: '/analytics', label: 'Analytics' }
  ]), []);

  // Search functionality removed

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="h-14 flex items-center px-3 gap-3">
        {/* Sidebar toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
        {/* Mobile menu */}
        <button
          onClick={onMobileMenuToggle}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          <Menu className="w-4 h-4" />
        </button>
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">PC</div>
          <span className="hidden sm:inline">Points Companion</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? 'page' : undefined}
              className={`text-xs font-medium px-3 py-2 rounded-md transition-colors ${pathname === l.href ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
            >{l.label}</Link>
          ))}
        </nav>
        <div className="flex-1" />
  {/* Search & notifications removed */}
        {/* User avatar / menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="w-9 h-9 rounded-full border border-gray-300 bg-gray-200 flex items-center justify-center hover:shadow-sm"
            >
              <User className="w-4 h-4 text-gray-700" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-md py-2 text-sm z-50">
                <div className="px-4 py-2 border-b border-gray-100 text-gray-700 truncate font-medium">{user.email}</div>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/profile" className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/cards" className="block px-4 py-2 hover:bg-gray-50">My Cards</Link>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/insights" className="block px-4 py-2 hover:bg-gray-50">Insights</Link>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/analytics" className="block px-4 py-2 hover:bg-gray-50">Analytics</Link>
                {/* Theme toggle removed from nav */}
                <hr className="my-2" />
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >Sign out</button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Mobile horizontal nav (mirrors primary links) */}
      {user && (
        <nav aria-label="Primary" className="md:hidden px-3 pb-2 flex gap-2 overflow-x-auto">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? 'page' : undefined}
              className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${pathname === l.href ? 'bg-gray-100 border-gray-300 text-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{l.label}</Link>
          ))}
        </nav>
      )}
  {/* SearchModal removed */}
    </header>
  );
}
