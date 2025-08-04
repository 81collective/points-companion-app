'use client';

import React, { useState, useMemo } from 'react';
import { WelcomeBonusTracker, BonusFilter, BonusAnalytics } from '@/types/welcomeBonus';
import { WelcomeBonusCard } from './WelcomeBonusCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Search, 
  TrendingUp, 
  Award, 
  Calendar, 
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Settings
} from 'lucide-react';

interface BonusDashboardProps {
  bonuses: WelcomeBonusTracker[];
  analytics: BonusAnalytics;
  onAddBonus?: () => void;
  onUpdateSpending?: (bonusId: string, amount: number) => void;
  onViewDetails?: (bonusId: string) => void;
  onFilterChange?: (filters: BonusFilter) => void;
  className?: string;
}

export const BonusDashboard: React.FC<BonusDashboardProps> = ({
  bonuses,
  analytics,
  onAddBonus,
  onUpdateSpending,
  onViewDetails,
  onFilterChange,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<BonusFilter>({
    status: ['active'],
    sortBy: 'deadline',
    sortOrder: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort bonuses
  const filteredBonuses = useMemo(() => {
    let filtered = bonuses.filter(bonus => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !bonus.cardName.toLowerCase().includes(query) &&
          !bonus.cardIssuer.toLowerCase().includes(query) &&
          !bonus.bonusDescription.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Status filter
      if (activeFilter.status && !activeFilter.status.includes(bonus.status)) {
        return false;
      }

      // Priority filter
      if (activeFilter.priority && !activeFilter.priority.includes(bonus.priority)) {
        return false;
      }

      // Bonus type filter
      if (activeFilter.bonusType && !activeFilter.bonusType.includes(bonus.bonusType)) {
        return false;
      }

      // Value range filter
      if (activeFilter.minValue && bonus.estimatedValue < activeFilter.minValue) {
        return false;
      }
      if (activeFilter.maxValue && bonus.estimatedValue > activeFilter.maxValue) {
        return false;
      }

      return true;
    });

    // Sort bonuses
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (activeFilter.sortBy) {
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'value':
          comparison = a.estimatedValue - b.estimatedValue;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'name':
          comparison = a.cardName.localeCompare(b.cardName);
          break;
        default:
          comparison = 0;
      }

      return activeFilter.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [bonuses, searchQuery, activeFilter]);

  // Quick stats calculation
  const quickStats = useMemo(() => {
    const active = bonuses.filter(b => b.status === 'active');
    const totalValue = active.reduce((sum, b) => sum + b.estimatedValue, 0);
    const totalRemaining = active.reduce((sum, b) => sum + (b.requiredSpend - b.currentSpend), 0);
    const urgent = active.filter(b => {
      const daysRemaining = Math.max(0, Math.floor((new Date(b.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      return daysRemaining <= 7;
    }).length;

    return { totalValue, totalRemaining, urgent, active: active.length };
  }, [bonuses]);

  const handleFilterChange = (newFilter: Partial<BonusFilter>) => {
    const updatedFilter = { ...activeFilter, ...newFilter };
    setActiveFilter(updatedFilter);
    onFilterChange?.(updatedFilter);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Bonuses</h1>
          <p className="text-gray-600">Track and optimize your credit card welcome bonus progress</p>
        </div>
        <button
          onClick={onAddBonus}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Bonus</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Bonuses</p>
              <p className="text-3xl font-bold">{quickStats.active}</p>
            </div>
            <Target className="w-10 h-10 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Value</p>
              <p className="text-3xl font-bold">${quickStats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Remaining Spend</p>
              <p className="text-3xl font-bold">${quickStats.totalRemaining.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-6 text-white ${
            quickStats.urgent > 0 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${quickStats.urgent > 0 ? 'text-red-100' : 'text-gray-100'}`}>
                Urgent (≤7 days)
              </p>
              <p className="text-3xl font-bold">{quickStats.urgent}</p>
            </div>
            {quickStats.urgent > 0 ? (
              <AlertTriangle className="w-10 h-10 text-red-200" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-gray-200" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bonuses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>

        {/* View Mode */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 rounded-lg p-4 border"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={activeFilter.status?.[0] || 'active'}
                  onChange={(e) => handleFilterChange({ status: [e.target.value as any] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={activeFilter.sortBy || 'deadline'}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="deadline">Deadline</option>
                  <option value="progress">Progress</option>
                  <option value="value">Value</option>
                  <option value="priority">Priority</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={activeFilter.priority?.[0] || ''}
                  onChange={(e) => handleFilterChange({ 
                    priority: e.target.value ? [e.target.value as any] : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setActiveFilter({
                      status: ['active'],
                      sortBy: 'deadline',
                      sortOrder: 'asc'
                    });
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bonus Cards */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
          : 'space-y-4'
      }`}>
        <AnimatePresence mode="popLayout">
          {filteredBonuses.map((bonus) => (
            <WelcomeBonusCard
              key={bonus.id}
              bonus={bonus}
              onUpdateSpending={onUpdateSpending}
              onViewDetails={onViewDetails}
              className={viewMode === 'list' ? 'w-full' : ''}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredBonuses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bonuses.length === 0 ? 'No welcome bonuses yet' : 'No bonuses match your filters'}
          </h3>
          <p className="text-gray-500 mb-6">
            {bonuses.length === 0 
              ? 'Start tracking your credit card welcome bonuses to optimize your rewards'
              : 'Try adjusting your search criteria or filters'
            }
          </p>
          {bonuses.length === 0 && (
            <button
              onClick={onAddBonus}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Bonus</span>
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};
