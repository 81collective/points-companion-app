// src/app/dashboard/page.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Header from '@/components/layout/Header'
import { CreditCard, TrendingUp, DollarSign, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { profile } = useAuth()

  const stats = [
    {
      title: 'Total Points Earned',
      value: '12,847',
      change: '+2.5%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'This Month',
      value: '1,234',
      change: '+12%',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: 'Active Cards',
      value: '3', // TODO: Replace with dynamic count
      change: 'No change',
      icon: CreditCard,
      color: 'text-purple-600'
    }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here&apos;s your rewards overview and recommendations for today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center text-sm text-gray-500 gap-2" aria-label="Breadcrumb">
            <Link href="/dashboard" className="hover:text-blue-700">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Overview</span>
          </nav>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Recommendations</h2>
              {/* ...existing recommendations... */}
            </div>

            {/* Your Credit Cards Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Credit Cards</h2>
                <Link href="/dashboard/cards" className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Manage Cards</span>
                </Link>
              </div>
              {/* TODO: Replace with actual card summary */}
              <div className="flex flex-col items-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mb-3 text-gray-300" />
                <p className="text-lg font-medium">No cards added yet</p>
                <p className="text-sm mt-1">Add your credit cards to start getting personalized recommendations</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No recent activity</p>
              <p className="text-sm mt-1">Connect your bank accounts to see transaction history and recommendations</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}