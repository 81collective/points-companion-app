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
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(92,63,189,0.06)]">
      <div className="h-16 flex items-center px-4 gap-3">
        {/* Sidebar toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
        
        {/* Mobile menu */}
        <button
          onClick={onMobileMenuToggle}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
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
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-neutral-100 bg-white shadow-[0_20px_50px_rgba(82,47,174,0.15)] py-2 z-50">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-sm font-medium text-neutral-900 truncate">{user.email}</p>
                    <p className="text-xs text-neutral-500">Free Plan</p>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      onClick={() => setMenuOpen(false)} 
                      href="/dashboard/profile" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-400" />
                      Settings
                    </Link>
                    <Link 
                      onClick={() => setMenuOpen(false)} 
                      href="/dashboard/cards" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-neutral-400" />
                      My Cards
                    </Link>
                    <Link 
                      onClick={() => setMenuOpen(false)} 
                      href="/dashboard/analytics" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <BarChart2 className="w-4 h-4 text-neutral-400" />
                      Analytics
                    </Link>
                  </div>
                  
                  <div className="border-t border-neutral-100 pt-1">
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
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
