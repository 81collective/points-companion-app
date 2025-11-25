"use client";
import React from 'react';
import Link from 'next/link';
import TextLogo from '@/components/branding/TextLogo';
import { Menu, PanelLeftOpen, PanelLeftClose, User, LogOut, Settings, CreditCard, BarChart2 } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export default function TopBarMinimal({ onMobileMenuToggle, mobileMenuOpen }: Props) {
  const { sidebarCollapsed, toggleSidebar } = useNavigationStore();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="header">
      <div className="h-16 flex items-center px-4 gap-3">
        {/* Sidebar toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:inline-flex btn btn-ghost btn-icon-sm"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
        
        {/* Mobile menu */}
        <button
          onClick={onMobileMenuToggle}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden btn btn-ghost btn-icon-sm"
        >
          <Menu className="w-4 h-4" />
        </button>
        
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <TextLogo className="text-lg" withLink={false} compact dark={false} />
        </Link>
        
        <div className="flex-1" />
        
        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center hover:bg-brand-200 transition-colors"
            >
              <User className="w-4 h-4 text-brand-600" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 surface-elevated py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-body-sm font-medium text-neutral-900 truncate">{user.email}</p>
                    <p className="text-caption text-neutral-500">Free Plan</p>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      onClick={() => setMenuOpen(false)} 
                      href="/dashboard/profile" 
                      className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-400" />
                      Settings
                    </Link>
                    <Link 
                      onClick={() => setMenuOpen(false)} 
                      href="/dashboard/cards" 
                      className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-neutral-400" />
                      My Cards
                    </Link>
                    <Link 
                      onClick={() => setMenuOpen(false)} 
                      href="/dashboard/analytics" 
                      className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <BarChart2 className="w-4 h-4 text-neutral-400" />
                      Analytics
                    </Link>
                  </div>
                  
                  <div className="border-t border-neutral-100 pt-1">
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-neutral-400" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
