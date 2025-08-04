'use client';

import React, { useState, useMemo } from 'react';
import { 
  WelcomeBonusTracker, 
  SpendingRecommendation, 
  SpendingPlan 
} from '@/types/welcomeBonus';
import { BonusCalculator } from '@/lib/bonusCalculator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  CreditCard,
  Lightbulb,
  Users,
  Zap,
  ShoppingCart,
  MapPin,
  Gift
} from 'lucide-react';

interface SpendingPlannerProps {
  bonuses: WelcomeBonusTracker[];
  userSpendingPatterns: Array<{ category: string; monthlyAverage: number }>;
  monthlyBudget: number;
  onAcceptRecommendation?: (recommendation: SpendingRecommendation) => void;
  onCreatePlan?: (plan: SpendingPlan) => void;
  className?: string;
}

export const SpendingPlanner: React.FC<SpendingPlannerProps> = ({
  bonuses,
  userSpendingPatterns,
  monthlyBudget,
  onAcceptRecommendation,
  onCreatePlan,
  className = ''
}) => {
  const [selectedBonusId, setSelectedBonusId] = useState<string>('');
  const [planningMode, setPlanningMode] = useState<'single' | 'multi'>('single');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Calculate active bonuses and their urgency
  const activeBonuses = useMemo(() => {
    return bonuses
      .filter(b => b.status === 'active')
      .map(bonus => {
        const daysRemaining = Math.max(0, Math.floor(
          (new Date(bonus.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ));
        const remainingSpend = bonus.requiredSpend - bonus.currentSpend;
        
        return {
          ...bonus,
          daysRemaining,
          remainingSpend,
          dailyTarget: daysRemaining > 0 ? remainingSpend / daysRemaining : remainingSpend,
          urgencyScore: daysRemaining <= 7 ? 'critical' : 
                       daysRemaining <= 14 ? 'high' : 
                       daysRemaining <= 30 ? 'medium' : 'low'
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [bonuses]);

  // Generate recommendations for selected bonus
  const recommendations = useMemo(() => {
    if (!selectedBonusId) return [];
    
    const selectedBonus = activeBonuses.find(b => b.id === selectedBonusId);
    if (!selectedBonus) return [];

    return BonusCalculator.generateSpendingRecommendations(
      selectedBonus,
      userSpendingPatterns,
      selectedBonus.daysRemaining
    );
  }, [selectedBonusId, activeBonuses, userSpendingPatterns]);

  // Multi-bonus coordination
  const multiCardStrategy = useMemo(() => {
    if (planningMode !== 'multi') return [];
    
    return BonusCalculator.coordinateMultipleBonuses(activeBonuses, monthlyBudget);
  }, [planningMode, activeBonuses, monthlyBudget]);

  // Generate spending plan
  const generatePlan = (bonusId: string) => {
    const bonus = activeBonuses.find(b => b.id === bonusId);
    if (!bonus || recommendations.length === 0) return;

    const plan = BonusCalculator.createSpendingPlan(bonus, recommendations);
    onCreatePlan?.(plan);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRecommendationIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'bills & utilities': return <Clock className="w-5 h-5" />;
      case 'gift cards': return <Gift className="w-5 h-5" />;
      case 'groceries': return <ShoppingCart className="w-5 h-5" />;
      case 'large purchases': return <CreditCard className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Spending Planner</h2>
          <p className="text-gray-600">AI-powered recommendations to optimize your bonus completion</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setPlanningMode('single')}
              className={`px-3 py-1 rounded-md transition-colors ${
                planningMode === 'single' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single Bonus
            </button>
            <button
              onClick={() => setPlanningMode('multi')}
              className={`px-3 py-1 rounded-md transition-colors ${
                planningMode === 'multi' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Multi-Card
            </button>
          </div>
        </div>
      </div>

      {/* Active Bonuses Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeBonuses.slice(0, 6).map((bonus) => (
          <motion.div
            key={bonus.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedBonusId === bonus.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => setSelectedBonusId(bonus.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">{bonus.cardName}</h3>
                <p className="text-sm text-gray-500">{bonus.cardIssuer}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(bonus.urgencyScore)}`}>
                {bonus.daysRemaining}d
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{bonus.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, bonus.progress)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining</span>
                <span className="font-medium">${bonus.remainingSpend.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily Target</span>
                <span className="font-medium">${bonus.dailyTarget.toFixed(0)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Planning Mode Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Bonus Planning */}
        {planningMode === 'single' && selectedBonusId && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        rec.urgency === 'critical' ? 'bg-red-100 text-red-600' :
                        rec.urgency === 'high' ? 'bg-orange-100 text-orange-600' :
                        rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {getRecommendationIcon(rec.category)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{rec.category}</h4>
                        <p className="text-sm text-gray-500">${rec.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                      rec.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                      rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.urgency}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                  <p className="text-xs text-gray-500 mb-3">{rec.reasoning}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {rec.suggestedMerchants.slice(0, 3).map((merchant) => (
                      <span 
                        key={merchant}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {merchant}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Complete by {rec.estimatedCompletionDate}</span>
                    </div>
                    <button
                      onClick={() => onAcceptRecommendation?.(rec)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Use This
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {recommendations.length > 0 && (
              <button
                onClick={() => generatePlan(selectedBonusId)}
                className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Generate Complete Spending Plan
              </button>
            )}
          </motion.div>
        )}

        {/* Multi-Card Strategy */}
        {planningMode === 'multi' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Multi-Card Coordination</h3>
            </div>

            <div className="space-y-4">
              {multiCardStrategy.map((strategy, index) => {
                const bonus = activeBonuses.find(b => b.id === strategy.bonusId);
                if (!bonus) return null;

                return (
                  <motion.div
                    key={strategy.bonusId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{bonus.cardName}</h4>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Priority: {strategy.priority.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Allocate: ${strategy.suggestedAllocation.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (strategy.suggestedAllocation / bonus.remainingSpend) * 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{bonus.daysRemaining} days remaining</span>
                      <span>${bonus.remainingSpend.toLocaleString()} needed</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Optimization Tips</h4>
              </div>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• Focus on highest priority bonuses first</li>
                <li>• Use category multipliers when possible</li>
                <li>• Consider bill payment timing</li>
                <li>• Coordinate large purchases across cards</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Analytics & Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
          </div>

          <div className="space-y-4">
            {/* Spending Velocity */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Spending Velocity</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Current Average</p>
                  <p className="font-semibold">${(monthlyBudget / 30).toFixed(0)}/day</p>
                </div>
                <div>
                  <p className="text-gray-500">Required Average</p>
                  <p className="font-semibold">
                    ${activeBonuses.reduce((sum, b) => sum + b.dailyTarget, 0).toFixed(0)}/day
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
              <div className="space-y-2">
                {activeBonuses.filter(b => b.urgencyScore === 'critical').length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{activeBonuses.filter(b => b.urgencyScore === 'critical').length} urgent bonus(es)</span>
                  </div>
                )}
                {activeBonuses.filter(b => b.progress < 50).length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span>{activeBonuses.filter(b => b.progress < 50).length} behind schedule</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Total potential value: ${activeBonuses.reduce((sum, b) => sum + b.estimatedValue, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                  Schedule Bill Payments
                </button>
                <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                  Find Gift Card Deals
                </button>
                <button className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                  Plan Large Purchases
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Empty State */}
      {activeBonuses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Bonuses</h3>
          <p className="text-gray-500">
            Add some welcome bonuses to get AI-powered spending recommendations
          </p>
        </motion.div>
      )}
    </div>
  );
};
