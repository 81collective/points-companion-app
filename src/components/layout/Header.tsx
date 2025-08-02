// Header.tsx - Airbnb-inspired navigation
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { CreditCard, User, Menu } from 'lucide-react';
import SmartNotifications from '@/components/ai/SmartNotifications';

export default function Header() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-75 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 hidden sm:block">
              Points Companion
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/cards" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              My Cards
            </Link>
            <Link 
              href="/dashboard/insights" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Insights
            </Link>
            <Link 
              href="/dashboard/analytics" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Analytics
            </Link>
            <Link 
              href="/dashboard/transactions" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Transactions
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && <SmartNotifications />}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full border border-gray-300 hover:shadow-md transition-shadow bg-white"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/cards"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Cards
                    </Link>
                    <Link
                      href="/dashboard/insights"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Insights
                    </Link>
                    <Link
                      href="/dashboard/analytics"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Analytics
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth"
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
