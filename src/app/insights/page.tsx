"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Header from '@/components/layout/Header'
import InsightsDashboard from '@/components/insights/InsightsDashboard'
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react'

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Spending Insights</h1>
                <p className="text-xl text-gray-600 mt-2">
                  AI-powered analysis of your spending patterns and optimization opportunities
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              {[
                {
                  title: 'Optimization Score',
                  value: '92%',
                  subtitle: 'Above average',
                  icon: Target,
                  color: 'text-emerald-600',
                  bgColor: 'bg-emerald-50'
                },
                {
                  title: 'Monthly Savings',
                  value: '$127',
                  subtitle: 'Potential extra value',
                  icon: TrendingUp,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50'
                },
                {
                  title: 'Active Insights',
                  value: '8',
                  subtitle: 'Actionable recommendations',
                  icon: Lightbulb,
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50'
                },
                {
                  title: 'Top Category',
                  value: 'Dining',
                  subtitle: '$1,234 this month',
                  icon: Brain,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50'
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

          {/* Insights Dashboard Component */}
          <InsightsDashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}
