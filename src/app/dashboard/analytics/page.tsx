"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics'
import { BarChart3, TrendingUp, PieChart, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="page-container py-8">
        <main className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">Advanced Analytics</h1>
            <p className="text-dim max-w-prose text-sm">Deep insights into spending patterns and rewards optimization.</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {[
                {
                  title: 'Total Rewards Earned',
                  value: '$2,847',
                  change: '+23% this month',
                  icon: TrendingUp,
                  color: 'text-emerald-600',
                  bgColor: 'bg-emerald-50'
                },
                {
                  title: 'Optimization Score',
                  value: '92%',
                  change: '+5% from last month',
                  icon: BarChart3,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50'
                },
                {
                  title: 'Top Category',
                  value: 'Dining',
                  change: '$1,234 this month',
                  icon: PieChart,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50'
                },
                {
                  title: 'Days Active',
                  value: '28',
                  change: 'This month',
                  icon: Calendar,
                  color: 'text-rose-600',
                  bgColor: 'bg-rose-50'
                }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="stat-card surface-hover">
                    <div className="flex items-center justify-between">
                      <small>{stat.title}</small>
                      <div className="stat-icon"><IconComponent className="h-4 w-4" /></div>
                    </div>
                    <h3 className="text-xl font-semibold mt-1">{stat.value}</h3>
                    <p className="helper">{stat.change}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface p-6 mt-10 surface-hover">
            <AdvancedAnalytics />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
