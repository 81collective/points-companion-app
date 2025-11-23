'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AIInsights from './AIInsights';
import SpendingAnalysis from './SpendingAnalysis';
interface ApiTransaction {
  id: string;
  amount: number;
  date: string;
  category?: string;
  pointsEarned?: number | null;
}

interface SpendingData {
  category: string;
  amount: number;
  transactions: number;
  avgAmount: number;
}

export default function InsightsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [error, setError] = useState<string | null>(null);

  const fetchInsightsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setSpendingData([]);
        setTotalSpending(0);
        setTotalRewards(0);
        setLoading(false);
        return;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const response = await fetch('/api/transactions', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load transactions');
      }
      const payload = (await response.json()) as { transactions?: ApiTransaction[] };
      const transactions = (payload.transactions || []).filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });

      // Process spending by category
      const categorySpending: Record<string, { amount: number; count: number; rewards: number }> = {};
      let total = 0;
      let totalRewardsEarned = 0;

      transactions.forEach(tx => {
        const amount = typeof tx.amount === 'number' ? tx.amount : Number(tx.amount);
        const category = tx.category || 'Other';
        if (!categorySpending[category]) {
          categorySpending[category] = { amount: 0, count: 0, rewards: 0 };
        }
        categorySpending[category].amount += amount;
        categorySpending[category].count += 1;
        categorySpending[category].rewards += tx.pointsEarned || 0;
        total += amount;
        totalRewardsEarned += tx.pointsEarned || 0;
      });

      const spendingArray: SpendingData[] = Object.entries(categorySpending).map(([category, data]) => ({
        category,
        amount: data.amount,
        transactions: data.count,
        avgAmount: data.amount / data.count
      })).sort((a, b) => b.amount - a.amount);

      // Process monthly data for trends
      const monthlySpending: Record<string, { amount: number; rewards: number }> = {};
      transactions.forEach(tx => {
        const month = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlySpending[month]) {
          monthlySpending[month] = { amount: 0, rewards: 0 };
        }
        monthlySpending[month].amount += typeof tx.amount === 'number' ? tx.amount : Number(tx.amount);
        monthlySpending[month].rewards += tx.pointsEarned || 0;
      });

      // Monthly data processed for future chart features
      Object.entries(monthlySpending).map(([month, data]) => ({
        month,
        amount: data.amount,
        rewards: data.rewards
      }));

      setSpendingData(spendingArray);
      setTotalSpending(total);
      setTotalRewards(totalRewardsEarned);

    } catch (err) {
      console.error('Error fetching insights data:', err);
      setError('Failed to load insights data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedPeriod]);

  useEffect(() => {
    if (user) {
      fetchInsightsData();
    }
  }, [user, fetchInsightsData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatRewards = (points: number) => {
    return new Intl.NumberFormat('en-US').format(points);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Spending Insights</h1>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spending Insights</h1>
          <p className="text-gray-600">Analyze your spending patterns and rewards optimization</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' },
            { key: '1y', label: '1 Year' }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as '7d' | '30d' | '90d' | '1y')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpending)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rewards Earned</p>
              <p className="text-2xl font-bold text-gray-900">{formatRewards(totalRewards)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {spendingData.reduce((sum, cat) => sum + cat.transactions, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg per Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSpending / Math.max(spendingData.reduce((sum, cat) => sum + cat.transactions, 0), 1))}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <BarChart className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Spending by Category */}
      {spendingData.length > 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="space-y-4">
            {spendingData.slice(0, 6).map((category) => {
              const percentage = (category.amount / totalSpending) * 100;
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {category.category}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.transactions} transactions
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No spending data</h3>
          <p className="text-gray-600">
            Add some transactions to see your spending insights
          </p>
        </div>
      )}

      {/* AI Insights */}
      <AIInsights />

      {/* Spending Analysis */}
      <SpendingAnalysis />
    </div>
  );
}
