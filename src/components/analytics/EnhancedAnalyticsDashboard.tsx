'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  Award,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { AnalyticsExporter } from '@/lib/analyticsExporter';
import { LoadingSkeleton, ChartSkeleton } from '@/components/common/LoadingSkeleton';
import { useErrorHandler } from '@/hooks/useErrorHandler';

type TimeRange = '3m' | '6m' | '12m' | '24m';
type ChartView = 'trends' | 'categories' | 'cards' | 'optimization';

const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  warning: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  indigo: '#6366F1'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning, COLORS.purple, COLORS.pink, COLORS.teal, COLORS.indigo];

export default function EnhancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('12m');
  const [chartView, setChartView] = useState<ChartView>('trends');
  const [showYearComparison, setShowYearComparison] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const { analytics, loading, error, refetch } = useEnhancedAnalytics(timeRange);
  const { executeAsyncSafe, showError, showSuccess } = useErrorHandler();

  const handleExportPDF = async () => {
    if (!analytics) return;
    
    await executeAsyncSafe(async () => {
      setExportLoading(true);
      const exporter = new AnalyticsExporter(analytics, 'Credit Card User');
      exporter.exportToPDF();
      showSuccess('PDF report exported successfully!');
    }, {
      successMessage: 'PDF report exported successfully!'
    });
    setExportLoading(false);
  };

  const handleExportCSV = async () => {
    if (!analytics) return;
    
    await executeAsyncSafe(async () => {
      setExportLoading(true);
      const exporter = new AnalyticsExporter(analytics, 'Credit Card User');
      exporter.exportToCSV();
      showSuccess('CSV data exported successfully!');
    }, {
      successMessage: 'CSV data exported successfully!'
    });
    setExportLoading(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color, 
    trend = 'neutral' 
  }: {
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      color: string;
      dataKey: string;
      value: number;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {
                entry.dataKey.includes('percentage') || entry.dataKey.includes('efficiency') 
                  ? `${entry.value}%` 
                  : `$${entry.value.toLocaleString()}`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <LoadingSkeleton width={300} height={40} />
          <LoadingSkeleton width={200} height={40} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} height={140} className="rounded-xl" />
          ))}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Start adding transactions to see your analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and optimization opportunities</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="24m">Last 24 months</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              disabled={exportLoading}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exportLoading}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Spending"
          value={`$${analytics.totalSpending.toLocaleString()}`}
          change={analytics.yearOverYear.spendingGrowth}
          trend={analytics.yearOverYear.spendingGrowth > 0 ? 'up' : analytics.yearOverYear.spendingGrowth < 0 ? 'down' : 'neutral'}
          icon={DollarSign}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Rewards Earned"
          value={`$${analytics.totalRewards.toLocaleString()}`}
          change={analytics.yearOverYear.rewardsGrowth}
          trend={analytics.yearOverYear.rewardsGrowth > 0 ? 'up' : analytics.yearOverYear.rewardsGrowth < 0 ? 'down' : 'neutral'}
          icon={Award}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Efficiency Rate"
          value={`${analytics.efficiency.toFixed(1)}%`}
          change={analytics.yearOverYear.efficiencyChange}
          trend={analytics.yearOverYear.efficiencyChange > 0 ? 'up' : analytics.yearOverYear.efficiencyChange < 0 ? 'down' : 'neutral'}
          icon={Target}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Active Cards"
          value={analytics.cardPerformance.length.toString()}
          icon={CreditCard}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      {/* Chart Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
            {[
              { key: 'trends', label: 'Spending Trends', icon: LineChart },
              { key: 'categories', label: 'Categories', icon: PieChart },
              { key: 'cards', label: 'Card Performance', icon: BarChart },
              { key: 'optimization', label: 'Opportunities', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setChartView(tab.key as ChartView)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    chartView === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {chartView === 'trends' && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showYearComparison}
                onChange={(e) => setShowYearComparison(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Compare with previous year</span>
            </label>
          )}
        </div>

        {/* Chart Content */}
        <div className="h-96">
          {chartView === 'trends' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="spending"
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  name="Spending"
                />
                <Line
                  type="monotone"
                  dataKey="rewards"
                  stroke={COLORS.secondary}
                  strokeWidth={3}
                  name="Rewards Earned"
                />
                <Line
                  type="monotone"
                  dataKey="potential"
                  stroke={COLORS.warning}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Potential Rewards"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {chartView === 'categories' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, amount }) => `${category}: $${amount.toLocaleString()}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}

          {chartView === 'cards' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.cardPerformance} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="card" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="spending" fill={COLORS.primary} name="Spending" />
                <Bar dataKey="rewards" fill={COLORS.secondary} name="Rewards" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartView === 'optimization' && (
            <div className="space-y-4 overflow-y-auto max-h-96">
              {analytics.optimizationOpportunities.length > 0 ? (
                analytics.optimizationOpportunities.map((opportunity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {opportunity.category} Optimization
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          {opportunity.recommendation}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            Current: <span className="font-medium">${opportunity.currentRewards}</span>
                          </span>
                          <span className="text-gray-600">
                            Potential: <span className="font-medium text-green-600">${opportunity.potentialRewards}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +${opportunity.impact}
                        </div>
                        <div className="text-xs text-gray-500">
                          annual impact
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Optimized!</h3>
                  <p className="text-gray-600">Your current card strategy is performing well.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
          <div className="space-y-4">
            {analytics.categoryBreakdown
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <div>
                      <span className="font-medium text-gray-900">{category.category}</span>
                      <div className="text-sm text-gray-500">
                        {category.count} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${category.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.efficiency.toFixed(1)}% rewards rate
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Forecasts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Forecasts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Projected Spending</h4>
                <p className="text-sm text-blue-700">Based on current trends</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  ${analytics.forecasts.annualSpending.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">
                  {analytics.forecasts.quarterlyTrend === 'up' && '↗ Trending up'}
                  {analytics.forecasts.quarterlyTrend === 'down' && '↘ Trending down'}
                  {analytics.forecasts.quarterlyTrend === 'stable' && '→ Stable'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">Projected Rewards</h4>
                <p className="text-sm text-green-700">Expected annual rewards</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-900">
                  ${analytics.forecasts.annualRewards.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">
                  {((analytics.forecasts.annualRewards / analytics.forecasts.annualSpending) * 100).toFixed(1)}% rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
