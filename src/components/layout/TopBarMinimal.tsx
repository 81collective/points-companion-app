"use client";
import React from 'react';
import Link from 'next/link';
import { Menu, PanelLeftOpen, PanelLeftClose, Search, Bell, User } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/contexts/AuthContext';
import SearchModal from '@/components/layout/SearchModal';
import NotificationCenter from '@/components/realtime/NotificationCenter';
import RealTimeSystemClean from '@/components/realtime/RealTimeSystemClean';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';

interface Props {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export default function TopBarMinimal({ onMobileMenuToggle, mobileMenuOpen }: Props) {
  const { sidebarCollapsed, toggleSidebar } = useNavigationStore();
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { preferences } = useDashboardPreferences();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
        <div className="flex-1" />
        {user && (
          <>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline text-xs text-gray-500">/ or ⌘K</span>
            </button>
            {preferences.showNotifications && <NotificationCenter />}
            {preferences.showNotifications && <RealTimeSystemClean />}
          </>
        )}
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
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-md py-2 text-sm z-50">
                <div className="px-4 py-2 border-b border-gray-100 text-gray-700 truncate">{user.email}</div>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/profile" className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/cards" className="block px-4 py-2 hover:bg-gray-50">My Cards</Link>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/insights" className="block px-4 py-2 hover:bg-gray-50">Insights</Link>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/analytics" className="block px-4 py-2 hover:bg-gray-50">Analytics</Link>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >Sign out</button>
              </div>
            )}
          </div>
        )}
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
