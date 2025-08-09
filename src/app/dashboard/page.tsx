"use client"
import { useState, useEffect, useCallback, type ElementType } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
// Removed Header (provided by DashboardLayout)
import { createClient } from '@/lib/supabase'
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Plus,
  BarChart3,
  ArrowUpRight,
  PieChart,
  Target,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import InsightsPreview from '@/components/dashboard/InsightsPreview'
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences'
import SmartNotifications from '@/components/ai/SmartNotifications'

const NaturalLanguageChat = dynamic(() => import('@/components/ai/NaturalLanguageChat'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl p-6 border border-gray-100 bg-white text-gray-500">Loading assistant…</div>
  ),
})

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const [cardCount, setCardCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalPoints, setTotalPoints] = useState(0)
  const [monthlyPoints, setMonthlyPoints] = useState(0)
  const { preferences } = useDashboardPreferences()

  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return

    try {
      const { count: cardCountResult, error: cardError } = await supabase
        .from('credit_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (cardError) throw cardError
      setCardCount(cardCountResult || 0)

      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount, date, card_id')
        .eq('user_id', user.id)

      if (txError) throw txError

      if (transactions) {
        const total = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
        setTotalPoints(Math.round(total))

        const now = new Date()
        const monthlyTotal = transactions
          .filter((tx) => {
            const txDate = new Date(tx.date)
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
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
      title: 'Total Points',
      value: loading ? '…' : totalPoints.toLocaleString(),
      helper: 'All-time earned',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'This Month',
      value: loading ? '…' : monthlyPoints.toLocaleString(),
      helper: monthlyPoints > 0 ? 'Active' : 'No activity yet',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Cards',
      value: loading ? '…' : cardCount.toString(),
      helper: cardCount === 0 ? 'Add your first card' : `${cardCount} in wallet`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ] as const

  const suggestions: Array<{ icon: ElementType; title: string; cta?: { href: string; label: string } }> = []
  if (cardCount === 0) {
    suggestions.push({ icon: Plus, title: 'Add your first card to unlock personalized rewards', cta: { href: '/dashboard/cards', label: 'Add card' } })
  }
  if (monthlyPoints === 0) {
    suggestions.push({ icon: DollarSign, title: 'Kickstart this month: make a purchase on a category bonus card' })
  }
  suggestions.push({ icon: BarChart3, title: 'Review Insights to optimize categories', cta: { href: '/dashboard/insights', label: 'Open insights' } })

  return (
    <ProtectedRoute>
      <>
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''} 👋
          </h1>
          <p className="mt-2 text-gray-600">Your at-a-glance rewards overview and next best actions.</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
          <Link
            href="/dashboard/cards"
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium transition-all shadow-sm hover:shadow md:h-12"
          >
            <Plus className="w-5 h-5 mr-2" /> Add card
          </Link>
          <Link
            href="/transactions/import"
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium border border-gray-200 transition-all shadow-sm md:h-12"
          >
            <ArrowUpRight className="w-5 h-5 mr-2" /> Import transactions
          </Link>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-sm hover:shadow md:h-12"
          >
            <PieChart className="w-5 h-5 mr-2" /> View analytics
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.helper}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Smart tips */}
        {preferences.showNotifications ? (
          <div className="mb-8">
            <SmartNotifications max={3} />
          </div>
        ) : null}

        {/* AI Assistant */}
        {preferences.showAIInsights ? (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Beta</span>
            </div>
            <NaturalLanguageChat />
          </section>
        ) : null}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Next best actions */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Next best actions</h2>
              <Link href="/dashboard/insights" className="text-sm font-medium text-rose-600 hover:text-rose-700">
                View insights →
              </Link>
            </div>
            <ul className="space-y-3">
              {suggestions.map((s, i) => {
                const Icon = s.icon
                return (
                  <li key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 rounded-lg bg-white border border-gray-200">
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <span className="text-gray-800">{s.title}</span>
                    </div>
                    {s.cta ? (
                      <Link href={s.cta.href} className="text-sm font-medium text-gray-700 hover:text-gray-900">
                        {s.cta.label} →
                      </Link>
                    ) : null}
                  </li>
                )
              })}
            </ul>
            <div className="mt-4">
              <Link
                href="/dashboard/ai-assistant"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black/90"
              >
                <Target className="w-4 h-4 mr-2" /> Get personalized recommendation
              </Link>
            </div>
          </div>

          {/* Recent activity */}
          {preferences.showTransactions ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent activity</h2>
              <div className="flex flex-col items-center py-10 text-gray-500">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="h-7 w-7 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 mb-1">No recent activity</p>
                <p className="text-sm text-center text-gray-500">Connect your accounts or import transactions to see history.</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Insights preview */}
        {preferences.showAnalytics ? (
          <InsightsPreview loading={loading} totalPoints={totalPoints} monthlyPoints={monthlyPoints} cardCount={cardCount} />
        ) : null}
      </>
    </ProtectedRoute>
  )
}