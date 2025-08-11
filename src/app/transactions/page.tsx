"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TransactionList from '@/components/transactions/TransactionList'
import { Receipt, Plus, Filter, Download } from 'lucide-react'

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl">
                  <Receipt className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Transactions</h1>
                  <p className="text-xl text-gray-600 mt-2">
                    Track and categorize your spending history
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </button>
                <button className="inline-flex items-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors">
                  <Download className="w-5 h-5 mr-2" />
                  Export
                </button>
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Transaction
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              {[
                {
                  title: 'This Month',
                  value: '$2,847',
                  subtitle: '142 transactions',
                  color: 'text-emerald-600',
                  bgColor: 'bg-emerald-50'
                },
                {
                  title: 'Average Transaction',
                  value: '$43.50',
                  subtitle: '+12% from last month',
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50'
                },
                {
                  title: 'Top Category',
                  value: 'Dining',
                  subtitle: '$834 (29%)',
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50'
                },
                {
                  title: 'Points Earned',
                  value: '5,247',
                  subtitle: 'This month',
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-50'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                      <Receipt className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction List Component */}
          <TransactionList />
        </main>
      </div>
    </ProtectedRoute>
  )
}
