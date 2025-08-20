'use client';

import React, { useState } from 'react';
import { WelcomeBonusTracker } from '@/types/welcomeBonus';
import { BonusCalculator } from '@/lib/bonusCalculator';
import { format, parseISO, differenceInDays } from '@/lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';

interface WelcomeBonusCardProps {
  bonus: WelcomeBonusTracker;
  onUpdateSpending?: (bonusId: string, amount: number) => void;
  onViewDetails?: (bonusId: string) => void;
  className?: string;
}

export const WelcomeBonusCard: React.FC<WelcomeBonusCardProps> = ({
  bonus,
  onUpdateSpending,
  onViewDetails,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickSpendAmount, setQuickSpendAmount] = useState('');

  // Calculations
  const remainingSpend = bonus.requiredSpend - bonus.currentSpend;
  const progressPercentage = (bonus.currentSpend / bonus.requiredSpend) * 100;
  const daysRemaining = Math.max(0, differenceInDays(parseISO(bonus.deadline), new Date()));
  const dailyTarget = daysRemaining > 0 ? remainingSpend / daysRemaining : remainingSpend;
  
  // Mock recent transactions for velocity calculation
  const recentTransactions = [
    { amount: 150, date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') },
    { amount: 75, date: format(new Date(Date.now() - 2 * 86400000), 'yyyy-MM-dd') },
    { amount: 200, date: format(new Date(Date.now() - 3 * 86400000), 'yyyy-MM-dd') }
  ];
  
  const velocity = BonusCalculator.calculateSpendingVelocity(
    bonus.currentSpend,
    bonus.requiredSpend,
    bonus.startDate,
    bonus.deadline,
    recentTransactions
  );

  // Status indicators
  const getStatusColor = () => {
    if (bonus.status === 'completed') return 'text-green-600 bg-green-50';
    if (bonus.status === 'expired') return 'text-red-600 bg-red-50';
    if (daysRemaining <= 7) return 'text-red-600 bg-red-50';
    if (daysRemaining <= 14) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-green-500';
    if (progressPercentage >= 75) return 'bg-blue-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    if (daysRemaining <= 7) return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getUrgencyIcon = () => {
    if (bonus.status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (daysRemaining <= 7) return <AlertTriangle className="w-4 h-4" />;
    if (daysRemaining <= 14) return <Clock className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const handleQuickSpend = () => {
    const amount = parseFloat(quickSpendAmount);
    if (amount > 0 && onUpdateSpending) {
      onUpdateSpending(bonus.id, amount);
      setQuickSpendAmount('');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {bonus.cardName}
              </h3>
              <p className="text-sm text-gray-500">{bonus.cardIssuer}</p>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getUrgencyIcon()}
                <span>
                  {bonus.status === 'completed' ? 'Completed' : 
                   bonus.status === 'expired' ? 'Expired' :
                   daysRemaining <= 7 ? 'Urgent' :
                   daysRemaining <= 14 ? 'Due Soon' : 
                   'Active'}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Bonus Info */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Bonus Reward</p>
            <p className="text-lg font-semibold text-gray-900">
              {bonus.bonusAmount.toLocaleString()} {bonus.bonusType}
            </p>
            <p className="text-xs text-gray-400">
              ~${bonus.estimatedValue.toLocaleString()} value
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Days Remaining</p>
            <p className={`text-lg font-semibold ${daysRemaining <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {daysRemaining}
            </p>
            <p className="text-xs text-gray-400">
              Until {format(parseISO(bonus.deadline), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6 pt-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              ${bonus.currentSpend.toLocaleString()} / ${bonus.requiredSpend.toLocaleString()}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progressPercentage)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${getProgressColor()} relative`}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse" />
            </motion.div>
            
            {/* Milestones */}
            {bonus.milestones.map((milestone) => {
              const position = (milestone.threshold / bonus.requiredSpend) * 100;
              return (
                <div
                  key={milestone.id}
                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                  style={{ left: `${position}%` }}
                  title={milestone.reward}
                />
              );
            })}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{progressPercentage.toFixed(1)}% complete</span>
            <span>${remainingSpend.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Velocity Indicator */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <TrendingUp className={`w-4 h-4 ${
              velocity.trend === 'increasing' ? 'text-green-500' : 
              velocity.trend === 'decreasing' ? 'text-red-500' : 'text-gray-400'
            }`} />
            <span className="text-gray-600">
              ${velocity.dailyAverage.toFixed(0)}/day avg
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600">
              ${dailyTarget.toFixed(0)}/day needed
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="p-6 space-y-4">
              {/* Quick Spending Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Spending Update
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={quickSpendAmount}
                      onChange={(e) => setQuickSpendAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleQuickSpend}
                    disabled={!quickSpendAmount || parseFloat(quickSpendAmount) <= 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Milestones */}
              {bonus.milestones.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {bonus.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          milestone.achieved 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle 
                            className={`w-5 h-5 ${
                              milestone.achieved ? 'text-green-500' : 'text-gray-300'
                            }`}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              ${milestone.threshold.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">{milestone.reward}</p>
                          </div>
                        </div>
                        {milestone.achieved && milestone.achievedDate && (
                          <span className="text-xs text-green-600">
                            {format(parseISO(milestone.achievedDate), 'MMM dd')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Velocity Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Spending Velocity</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Weekly Average</p>
                    <p className="font-semibold">${velocity.weeklyAverage.toFixed(0)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Confidence</p>
                    <p className="font-semibold">{velocity.confidenceLevel.toFixed(0)}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Projected completion: {format(parseISO(velocity.projectedCompletion), 'MMM dd, yyyy')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => onViewDetails?.(bonus.id)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Get Recommendations
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
