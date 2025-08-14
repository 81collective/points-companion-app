"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics'
import { BarChart3, TrendingUp, PieChart, Calendar, Clock } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts'
import { useEffect, useState } from 'react'

export default function AnalyticsPage() {
  // Derive basic usage metrics from local signals (placeholder until server events are wired)
  const [engagement, setEngagement] = useState({ dau: 0, wau: 0, mau: 0, avgSessionMin: 0 })
  const [assistant, setAssistant] = useState({ qpd: [] as { day: string; count: number }[], avgLatencyMs: 0, satisfaction: 0 })

  useEffect(() => {
    // Use localStorage chat history as proxy for assistant queries
  const chatsA = typeof window !== 'undefined' ? localStorage.getItem('chat_assistant_history') : null
  const chatsB = typeof window !== 'undefined' ? localStorage.getItem('ai_chat_messages') : null
  type LocalMsg = { timestamp?: string; sender?: string; type?: string }
  const messages: LocalMsg[] = []
  try { if (chatsA) messages.push(...(JSON.parse(chatsA) as LocalMsg[])) } catch {}
  try { if (chatsB) messages.push(...(JSON.parse(chatsB) as LocalMsg[])) } catch {}

    const now = new Date()
    const byDay: Record<string, number> = {}
    const uniqueDays = new Set<string>()
    const last30: string[] = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - (13 - i))
      return d.toISOString().slice(0,10)
    })
    messages.forEach(m => {
      const t = m.timestamp ? new Date(m.timestamp) : null
      if (t && !isNaN(t.getTime())) {
        const key = t.toISOString().slice(0,10)
        if (m.sender === 'user' || m.type === 'user') {
          byDay[key] = (byDay[key] || 0) + 1
          uniqueDays.add(key)
        }
      }
    })
    const qpd = last30.map(day => ({ day: day.slice(5), count: byDay[day] || 0 }))
    setAssistant({ qpd, avgLatencyMs: 1200, satisfaction: 92 })
    setEngagement({ dau: Math.min(uniqueDays.size, 7), wau: Math.min(uniqueDays.size, 14), mau: Math.min(uniqueDays.size, 30), avgSessionMin: 4 })
  }, [])

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

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
            <div className="surface p-6">
              <h3 className="text-lg font-semibold mb-3">AI Queries (last 2 weeks)</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assistant.qpd}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="surface p-6">
              <h3 className="text-lg font-semibold mb-3">Assistant performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-md border bg-[var(--color-bg-alt)]/60">
                  <div className="text-xs text-dim mb-1">Avg response time</div>
                  <div className="text-xl font-semibold flex items-center gap-2"><Clock className="h-4 w-4" /> {Math.round(assistant.avgLatencyMs)} ms</div>
                </div>
                <div className="p-4 rounded-md border bg-[var(--color-bg-alt)]/60">
                  <div className="text-xs text-dim mb-1">Satisfaction</div>
                  <div className="text-xl font-semibold">{assistant.satisfaction}%</div>
                </div>
                <div className="p-4 rounded-md border bg-[var(--color-bg-alt)]/60">
                  <div className="text-xs text-dim mb-1">DAU</div>
                  <div className="text-xl font-semibold">{engagement.dau}</div>
                </div>
                <div className="p-4 rounded-md border bg-[var(--color-bg-alt)]/60">
                  <div className="text-xs text-dim mb-1">Avg session</div>
                  <div className="text-xl font-semibold">{engagement.avgSessionMin} min</div>
                </div>
              </div>
            </div>
            <div className="surface p-6">
              <h3 className="text-lg font-semibold mb-3">Engagement trend</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assistant.qpd}>
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
