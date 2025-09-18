"use client";
import React from 'react';
import Link from 'next/link';
import TextLogo from '@/components/branding/TextLogo';
import { Menu, PanelLeftOpen, PanelLeftClose, User } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/contexts/AuthContext';
// Removed RealTimeSystemClean per simplification
// import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';

interface Props {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export default function TopBarMinimal({ onMobileMenuToggle, mobileMenuOpen }: Props) {
  const { sidebarCollapsed, toggleSidebar } = useNavigationStore();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  // const { preferences } = useDashboardPreferences();
  

  // Search functionality removed

  return (
    <header className="sticky top-0 z-40 bg-black/60 backdrop-blur border-b border-white/10 text-white">
      <div className="h-14 flex items-center px-3 gap-3">
        {/* Sidebar toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/20 hover:bg-white/10 text-white"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
        {/* Mobile menu */}
        <button
          onClick={onMobileMenuToggle}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/20 hover:bg-white/10 text-white"
        >
          <Menu className="w-4 h-4" />
        </button>
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white text-sm">
          <TextLogo className="text-lg sm:text-xl text-white" withLink={false} compact />
        </Link>
        {/* Inline nav removed for minimal header */}
        <div className="flex-1" />
        {/* Search & notifications removed */}
        {/* User avatar / menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="w-9 h-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center hover:bg-white/30"
            >
              <User className="w-4 h-4 text-white" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-md py-2 text-sm z-50">
                <div className="px-4 py-2 border-b border-gray-100 text-gray-700 truncate font-medium">{user.email}</div>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/profile" className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
                <Link onClick={() => setMenuOpen(false)} href="/dashboard/cards" className="block px-4 py-2 hover:bg-gray-50">My Cards</Link>
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
      {/* Mobile horizontal nav removed for minimal header */}
      {/* SearchModal removed */}
    </header>
  );
}
