// Header.tsx - Airbnb-inspired navigation
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { CreditCard, User, Menu, Search } from 'lucide-react';
import RealTimeSystemClean from '@/components/realtime/RealTimeSystemClean';
// NotificationCenter temporarily disabled
import { navigationItems } from '@/config/navigation'
import SearchModal from '@/components/layout/SearchModal'
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences'

export default function Header() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false)
  const pathname = usePathname()
  const { preferences } = useDashboardPreferences()

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-75 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 hidden sm:block">
              Points Companion
            </span>
          </Link>

          {/* Navigation - Only show when user is logged in */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              {navigationItems.map((item) => {
                const active = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'text-rose-600 bg-rose-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
                <span className="ml-2 hidden lg:inline text-xs text-gray-500">/ or ⌘K</span>
              </button>
            )}

            {/* Single notifications modal */}
            {/* NotificationCenter disabled */}
            {user && <RealTimeSystemClean />}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full border border-gray-300 hover:shadow-md transition-shadow bg-white"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10" role="menu">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.email}
                      </p>
                    </div>
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                      Profile Settings
                    </Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/dashboard/cards" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                      My Cards
                    </Link>
                    <Link href="/dashboard/insights" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                      Insights
                    </Link>
                    <Link href="/dashboard/analytics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                      Analytics
                    </Link>
                    <hr className="my-2" />
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Log in
                </Link>
                <Link href="/auth" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
