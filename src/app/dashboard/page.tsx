"use client"
import AIPerformanceMetrics from '@/components/analytics/AIPerformanceMetrics'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Header from '@/components/layout/Header'
import { CreditCard, TrendingUp, DollarSign, Plus, BarChart3, ArrowUpRight, Sparkles, PieChart, Target } from 'lucide-react'
import Link from 'next/link'
import RecommendationForm from '@/components/recommendations/RecommendationForm'
import NearbyBusinesses from '@/components/location/NearbyBusinesses'
import PortfolioOptimizer from '@/components/executive/PortfolioOptimizer'
import PaymentDecisionEngine from '@/components/executive/PaymentDecisionEngine'
import TravelStatusTracker from '@/components/executive/TravelStatusTracker'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const [cardCount, setCardCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalPoints, setTotalPoints] = useState(0)
  const [monthlyPoints, setMonthlyPoints] = useState(0)

  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // Fetch card count
      const { count: cardCountResult, error: cardError } = await supabase
        .from('credit_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (cardError) throw cardError
      setCardCount(cardCountResult || 0)

      // Fetch transaction data for points calculation
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount, date, card_id')
        .eq('user_id', user.id)

      if (txError) throw txError

      if (transactions) {
        // Calculate total points (assuming 1 point per dollar as base)
        const total = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
        setTotalPoints(Math.round(total))

        // Calculate this month's points
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthlyTotal = transactions
          .filter(tx => {
            const txDate = new Date(tx.date)
            return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
          })
          .reduce((sum, tx) => sum + (tx.amount || 0), 0)
        setMonthlyPoints(Math.round(monthlyTotal))
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setCardCount(0)
      setTotalPoints(0)
      setMonthlyPoints(0)
    } finally {
      setLoading(false)
    }
  }, [supabase, user?.id])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const stats = [
    {
      title: 'Total Points Earned',
      value: loading ? '...' : totalPoints.toLocaleString(),
      change: totalPoints > 0 ? '+' + Math.round((totalPoints / 12) * 100) / 100 + '%' : 'Start earning',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'This Month',
      value: loading ? '...' : monthlyPoints.toLocaleString(),
      change: monthlyPoints > 0 ? 'Active' : 'No activity',
      trend: 'up',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Cards',
      value: loading ? '...' : cardCount.toString(),
      change: cardCount === 0 ? 'Add your first card' : `${cardCount} card${cardCount !== 1 ? 's' : ''}`,
      trend: 'neutral',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: 'transparent' }}>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}! 
                  <span className="inline-block ml-2">👋</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Here&apos;s your rewards overview and smart recommendations for today.
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <Link 
                  href="/dashboard/cards" 
                  className="inline-flex items-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Card
                </Link>
                <Link 
                  href="/dashboard/insights" 
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Insights
                </Link>
                <Link 
                  href="/dashboard/analytics" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <PieChart className="w-5 h-5 mr-2" />
                  Analytics
                </Link>
              </div>
            </div>
            
            {/* Mobile buttons */}
            <div className="mt-6 flex md:hidden gap-3">
              <Link 
                href="/dashboard/cards" 
                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Card
              </Link>
              <Link 
                href="/dashboard/insights" 
                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Insights
              </Link>
              <Link 
                href="/dashboard/analytics" 
                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl transition-colors"
              >
                <PieChart className="w-5 h-5 mr-2" />
                Analytics
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      <div className="flex items-center mt-3">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                        <span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                      <IconComponent className={`h-7 w-7 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
            {/* Card Recommendations - Takes 2 columns */}
            <div className="xl:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Smart Recommendations</h2>
                  <p className="text-gray-600">Get AI-powered suggestions for maximum rewards</p>
                </div>
              </div>
              <RecommendationForm />
            </div>

            {/* Your Credit Cards Summary */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Cards</h2>
                <Link href="/dashboard/cards" className="text-rose-500 hover:text-rose-600 font-medium text-sm transition-colors">
                  Manage all →
                </Link>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Loading cards...</p>
                </div>
              ) : cardCount === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">No cards added yet</p>
                  <p className="text-sm text-center text-gray-500 mb-6">Add your credit cards to start getting personalized recommendations</p>
                  <Link 
                    href="/dashboard/cards"
                    className="inline-flex items-center px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Card
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cardCount} Active Card{cardCount !== 1 ? 's' : ''}</p>
                        <p className="text-sm text-gray-600">Manage and optimize your cards</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <Link 
                    href="/dashboard/cards"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors text-sm"
                  >
                    View All Cards
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* AI Performance & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* AI Performance Metrics */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mr-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Performance</h2>
                  <p className="text-gray-600">Track optimization success</p>
                </div>
              </div>
              <AIPerformanceMetrics />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="flex flex-col items-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">No recent activity</p>
                <p className="text-sm text-center text-gray-500">Connect your accounts to see transaction history and recommendations</p>
              </div>
            </div>
          </div>

          {/* Nearby Businesses */}
          <div className="mb-12">
            <NearbyBusinesses />
          </div>

          {/* Advanced Analytics Preview */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mr-4">
                  <PieChart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Advanced Analytics</h2>
                  <p className="text-gray-600">Deep insights into your spending and rewards optimization</p>
                </div>
              </div>
              <Link 
                href="/dashboard/analytics"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Target className="w-5 h-5 mr-2" />
                View Full Analytics
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Total Points',
                  value: loading ? '...' : totalPoints.toLocaleString(),
                  description: 'Points earned from all transactions',
                  icon: Target,
                  color: 'text-emerald-600',
                  bgColor: 'bg-emerald-50'
                },
                {
                  title: 'Monthly Activity',
                  value: loading ? '...' : monthlyPoints > 0 ? monthlyPoints.toLocaleString() : '0',
                  description: 'Points earned this month',
                  icon: TrendingUp,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50'
                },
                {
                  title: 'Active Cards',
                  value: loading ? '...' : cardCount.toString(),
                  description: cardCount === 0 ? 'Add cards to start tracking' : 'Cards in your wallet',
                  icon: PieChart,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50'
                }
              ].map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${metric.color}`} />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{metric.title}</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Executive Features */}
          <div className="space-y-8 mb-12">
            {/* Payment Decision Engine */}
            <PaymentDecisionEngine />
            
            {/* Portfolio Optimizer */}
            <PortfolioOptimizer />
            
            {/* Travel Status Tracker */}
            <TravelStatusTracker />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}