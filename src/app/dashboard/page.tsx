// src/app/dashboard/page.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Header from '@/components/layout/Header'
import { CreditCard, TrendingUp, DollarSign, Plus } from 'lucide-react'

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
      value: '3',
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Recommendations</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Use Chase Sapphire for dining</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Earn 3x points on restaurant purchases today. Perfect for your lunch meeting!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900">Maximize Q4 bonus categories</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your Discover card offers 5% back on online shopping through December.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Credit Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Credit Cards</h2>
                <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Card</span>
                </button>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
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