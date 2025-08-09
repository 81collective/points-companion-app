'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Gift,
  Plus,
  Filter,
  RefreshCw,
  Star,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { LoyaltyAccount, LoyaltyFilter } from '@/types/loyalty';
import { getProgramById } from '@/lib/loyaltyPrograms';
import { useLoyaltyAccounts, useLoyaltyAnalytics, useLoyaltyInsights } from '@/hooks/useLoyalty';
import AddLoyaltyAccount from './AddLoyaltyAccountSimple';

interface LoyaltyDashboardProps {
  className?: string;
}

export default function LoyaltyDashboard({ className = "" }: LoyaltyDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [balanceVisibility, setBalanceVisibility] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'name' | 'expiration' | 'value'>('balance');

  // Build filters for React Query
  const filters: LoyaltyFilter = {
    category: filterCategory !== 'all' ? [filterCategory as 'airline' | 'hotel' | 'credit_card' | 'dining' | 'shopping' | 'other'] : undefined,
    sortBy,
    sortOrder: 'desc'
  };

  // Use React Query hooks
  const { data: accountsResponse, isLoading: accountsLoading } = useLoyaltyAccounts(filters);
  const { data: analyticsResponse, isLoading: analyticsLoading } = useLoyaltyAnalytics();
  const { data: insightsResponse, isLoading: insightsLoading } = useLoyaltyInsights();

  const accounts = useMemo(() => accountsResponse?.data || [], [accountsResponse]);
  const analytics = analyticsResponse?.data;
  const insights = insightsResponse?.data || [];
  const loading = accountsLoading || analyticsLoading || insightsLoading;

  // Initialize balance visibility when accounts change
  React.useEffect(() => {
    const visibility: Record<string, boolean> = {};
    accounts.forEach(account => {
      if (!balanceVisibility.hasOwnProperty(account.id)) {
        visibility[account.id] = true;
      }
    });
    if (Object.keys(visibility).length > 0) {
      setBalanceVisibility(prev => ({ ...prev, ...visibility }));
    }
  }, [accounts, balanceVisibility]);

  const toggleBalanceVisibility = (accountId: string) => {
    setBalanceVisibility(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const formatBalance = (balance: number): string => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(1)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(0)}K`;
    }
    return balance.toLocaleString();
  };

  const formatValue = (value: number): string => {
    return `$${value.toLocaleString()}`;
  };

  const getDaysUntilExpiration = (expirationDate: string): number => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Accounts are already filtered by the API based on our filters
  const sortedAccounts = [...accounts]; // API handles sorting, but we can add client-side sorting if needed

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading loyalty accounts...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your points, miles, and elite status across all programs</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">Total Value</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">{formatValue(analytics.totalValue)}</div>
              <div className="text-sm text-gray-600">{analytics.totalAccounts} accounts</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">Elite Status</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(analytics.eliteStatusSummary.currentTiers).length}
              </div>
              <div className="text-sm text-gray-600">Active tiers</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm text-purple-600 font-medium">Certificates</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">{analytics.certificateSummary.total}</div>
              <div className="text-sm text-gray-600">{formatValue(analytics.certificateSummary.estimatedValue)} value</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm text-orange-600 font-medium">Expiring</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {formatBalance(analytics.expirationSummary.expiring90Days)}
              </div>
              <div className="text-sm text-gray-600">Next 90 days</div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Action Items
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm opacity-90">{insight.message}</p>
                  </div>
                  {insight.actionUrl && (
                    <button className="ml-4 p-1 hover:bg-black hover:bg-opacity-10 rounded">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="airline">Airlines</option>
              <option value="hotel">Hotels</option>
              <option value="credit_card">Credit Cards</option>
              <option value="dining">Dining</option>
              <option value="shopping">Shopping</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'balance' | 'name' | 'expiration' | 'value')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="balance">Sort by Balance</option>
            <option value="name">Sort by Name</option>
            <option value="expiration">Sort by Expiration</option>
            <option value="value">Sort by Value</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          {sortedAccounts.length} account{sortedAccounts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Loyalty Accounts Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {sortedAccounts.map((account, index) => {
            const program = getProgramById(account.programId);
            const isVisible = balanceVisibility[account.id];
            
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
              >
                {/* Account Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {program?.category === 'airline' && <span className="text-xl">✈️</span>}
                      {program?.category === 'hotel' && <span className="text-xl">🏨</span>}
                      {program?.category === 'credit_card' && <CreditCard className="h-6 w-6 text-blue-600" />}
                      {program?.category === 'dining' && <span className="text-xl">🍽️</span>}
                      {program?.category === 'shopping' && <span className="text-xl">🛍️</span>}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{program?.name}</h3>
                      <p className="text-sm text-gray-600">{account.accountNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBalanceVisibility(account.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>

                {/* Balance */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {program?.pointsName || 'Points'}
                    </span>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      account.credentials?.syncStatus === 'connected' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.credentials?.syncStatus === 'connected' ? 'Synced' : 'Manual'}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {isVisible ? formatBalance(account.balance.current) : '•••••'}
                  </div>
                  {account.balance.pending && account.balance.pending > 0 && (
                    <div className="text-sm text-gray-600">
                      +{formatBalance(account.balance.pending)} pending
                    </div>
                  )}
                </div>

                {/* Elite Status */}
                {account.eliteStatus && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          {account.eliteStatus.currentTier}
                        </span>
                      </div>
                      {account.eliteStatus.nextTierRequirement && (
                        <span className="text-xs text-yellow-700">
                          {account.eliteStatus.qualifyingActivity}/{account.eliteStatus.nextTierRequirement}
                        </span>
                      )}
                    </div>
                    {account.eliteStatus.nextTierRequirement && (
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, (account.eliteStatus.qualifyingActivity / account.eliteStatus.nextTierRequirement) * 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Certificates */}
                {account.certificates.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Certificates ({account.certificates.length})
                    </h4>
                    <div className="space-y-2">
                      {account.certificates.slice(0, 2).map(cert => {
                        const daysUntil = getDaysUntilExpiration(cert.expirationDate);
                        return (
                          <div key={cert.id} className="p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{cert.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                daysUntil < 30 ? 'bg-red-100 text-red-800' : 
                                daysUntil < 90 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {daysUntil}d
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatValue(cert.estimatedValue)} value
                            </div>
                          </div>
                        );
                      })}
                      {account.certificates.length > 2 && (
                        <div className="text-xs text-gray-600 text-center">
                          +{account.certificates.length - 2} more certificates
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expiration Warning */}
                {account.expiringPoints && account.expiringPoints.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Expiring Soon</span>
                    </div>
                    {account.expiringPoints.map((exp, idx) => (
                      <div key={idx} className="text-sm text-red-700">
                        {formatBalance(exp.amount)} expire on {new Date(exp.expirationDate).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                )}

                {/* Last Updated */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Updated {new Date(account.lastUpdated).toLocaleDateString()}</span>
                    <button className="hover:text-gray-700">
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {sortedAccounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No loyalty accounts yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start tracking your points, miles, and elite status by adding your first loyalty account.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Account
          </button>
        </motion.div>
      )}

      {/* Add Account Modal */}
      <AddLoyaltyAccount
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAccountAdded={(account: LoyaltyAccount) => {
          // The React Query cache will be updated automatically by the mutation
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
