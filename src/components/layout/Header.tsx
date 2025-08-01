// src/components/layout/Header.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Settings } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowDropdown(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-gray-900">Points Companion</h1>
          <nav className="hidden md:flex gap-4">
            <a href="/dashboard" className="text-gray-700 hover:text-blue-700 font-medium transition">Dashboard</a>
            <a href="/dashboard/cards" className="text-gray-700 hover:text-blue-700 font-medium transition">My Cards</a>
          </nav>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {profile?.first_name ? profile.first_name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => setShowDropdown(false)}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <hr className="my-1" />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}