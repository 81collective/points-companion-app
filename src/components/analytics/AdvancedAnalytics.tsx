// AdvancedAnalytics.tsx - World-class analytics dashboard
'use client';

import React, { useState } from 'react';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Target,
  DollarSign,
  Award,
  Download,
  Share
} from 'lucide-react';


import type { AdvancedMetrics } from '@/lib/analyticsTransform';



interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ title, value, change, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-sm font-medium text-emerald-600">+{change}%</span>
            <span className="text-xs text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-2xl ${color}`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>
);

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('6m');
  const [selectedView, setSelectedView] = useState<'overview' | 'categories' | 'projections'>('overview');
  // TODO: Pass timeRange to the hook if needed for filtering
  const { data: metrics, isLoading: loading, error } = useAdvancedAnalytics();

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Deep insights into your rewards optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '3m' | '6m' | '12m')}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
          </select>
          
          {/* Action Buttons */}
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors">
            <Share className="w-4 h-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Points Earned"
          value={metrics!.totalPointsEarned.toLocaleString()}
          change={metrics!.monthlyGrowth}
          icon={Award}
          color="bg-gradient-to-r from-purple-500 to-pink-500"
        />
        <StatCard
          title="Total Spending"
          value={`$${metrics!.totalSpent.toLocaleString()}`}
          change={8.3}
          icon={DollarSign}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Avg Multiplier"
          value={`${metrics!.averageMultiplier}x`}
          change={5.2}
          icon={Target}
          color="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Top Category"
          value={metrics!.topCategory}
          icon={TrendingUp}
          color="bg-gradient-to-r from-amber-500 to-orange-500"
        />
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'categories', label: 'Category Analysis' },
            { key: 'projections', label: 'Projections' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as 'overview' | 'categories' | 'projections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedView === tab.key
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics!.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="points"
                    stroke="#e11d48"
                    fill="#e11d48"
                    fillOpacity={0.1}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card Utilization */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Utilization</h3>
            <div className="space-y-4">
              {metrics!.cardUtilization.map((card, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{card.cardName}</span>
                    <span className="text-sm text-gray-600">{card.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${card.usage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Efficiency: {card.efficiency}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Analysis Tab */}
      {selectedView === 'categories' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Spent</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Points Earned</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Efficiency</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Trend</th>
                </tr>
              </thead>
              <tbody>
                {metrics!.categoryPerformance.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{category.category}</td>
                    <td className="py-4 px-4 text-right text-gray-700">${category.spent.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-gray-700">{category.pointsEarned.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        category.efficiency >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        category.efficiency >= 80 ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {category.efficiency}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <TrendingUp className={`w-4 h-4 mx-auto ${
                        category.trend === 'up' ? 'text-emerald-500' :
                        category.trend === 'down' ? 'text-rose-500' :
                        'text-gray-400'
                      }`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projections Tab */}
      {selectedView === 'projections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Annual Projection</h3>
            <div className="text-3xl font-bold mb-1">{metrics!.projections.annualPoints.toLocaleString()}</div>
            <div className="text-purple-100">Total Points Expected</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Annual Spending</h3>
            <div className="text-3xl font-bold mb-1">${metrics!.projections.annualSpending.toLocaleString()}</div>
            <div className="text-blue-100">Projected Total Spend</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Optimization Potential</h3>
            <div className="text-3xl font-bold mb-1">${metrics!.projections.potentialSavings.toLocaleString()}</div>
            <div className="text-emerald-100">Additional Value Possible</div>
          </div>
        </div>
      )}
    </div>
  );
}
