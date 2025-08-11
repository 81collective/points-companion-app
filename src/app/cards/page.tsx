"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CardManager from '@/components/cards/CardManager'
import { CreditCard, Plus, Star, Calendar } from 'lucide-react'
import UnifiedDashboardShell from '@/components/layout/UnifiedDashboardShell'

export default function CardsPage() {
  return (
    <ProtectedRoute>
      <UnifiedDashboardShell>
        <div className="space-y-8">
        
        <div className="px-2 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">My Credit Cards</h1>
                  <p className="text-xl text-gray-600 mt-2">
                    Manage your credit cards and optimize your rewards
                  </p>
                </div>
              </div>
              
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Plus className="w-5 h-5 mr-2" />
                Add New Card
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              {[
                {
                  title: 'Total Cards',
                  value: '3',
                  subtitle: 'Active cards',
                  icon: CreditCard,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50'
                },
                {
                  title: 'Monthly Points',
                  value: '2,847',
                  subtitle: 'Points earned',
                  icon: Star,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50'
                },
                {
                  title: 'Best Category',
                  value: 'Dining',
                  subtitle: '3x points',
                  icon: Calendar,
                  color: 'text-emerald-600',
                  bgColor: 'bg-emerald-50'
                },
                {
                  title: 'Optimization',
                  value: '92%',
                  subtitle: 'Efficiency score',
                  icon: Star,
                  color: 'text-rose-600',
                  bgColor: 'bg-rose-50'
                }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Manager Component */}
          <CardManager />
        </div>
        </div>
      </UnifiedDashboardShell>
    </ProtectedRoute>
  )
}
