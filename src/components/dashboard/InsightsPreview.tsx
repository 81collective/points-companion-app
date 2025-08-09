"use client"
import Link from 'next/link'
import { ArrowUpRight, PieChart, TrendingUp, Target } from 'lucide-react'

export default function InsightsPreview({
  loading,
  totalPoints,
  monthlyPoints,
  cardCount,
}: {
  loading: boolean
  totalPoints: number
  monthlyPoints: number
  cardCount: number
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-16">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-3">
            <PieChart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Insights preview</h2>
            <p className="text-gray-600">A snapshot of your rewards performance</p>
          </div>
        </div>
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700"
        >
          <ArrowUpRight className="w-4 h-4 mr-2" /> Open analytics
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Total points',
            value: loading ? '…' : totalPoints.toLocaleString(),
            icon: Target,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
          },
          {
            title: 'Monthly activity',
            value: loading ? '…' : monthlyPoints > 0 ? monthlyPoints.toLocaleString() : '0',
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          },
          {
            title: 'Active cards',
            value: loading ? '…' : cardCount.toString(),
            icon: PieChart,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
          },
        ].map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="rounded-xl p-5 border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
