'use client';

import React, { useState } from 'react';
import { BonusDashboard } from '@/components/bonuses/BonusDashboard';
import { SpendingPlanner } from '@/components/bonuses/SpendingPlanner';
import { 
  useWelcomeBonuses, 
  useBonusAnalytics, 
  useCreateWelcomeBonus,
  useUpdateBonusSpending 
} from '@/hooks/useWelcomeBonuses';
import { BonusFilter, AddBonusForm } from '@/types/welcomeBonus';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WelcomeBonusesPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bonusFilters, setBonusFilters] = useState<BonusFilter>({
    status: ['active'],
    sortBy: 'deadline',
    sortOrder: 'asc'
  });

  // Data hooks
  const { data: bonuses = [], isLoading: bonusesLoading } = useWelcomeBonuses(bonusFilters);
  const { data: analytics, isLoading: analyticsLoading } = useBonusAnalytics('30d');
  const createBonusMutation = useCreateWelcomeBonus();
  const updateSpendingMutation = useUpdateBonusSpending();

  // Mock user spending patterns for demo
  const userSpendingPatterns = [
    { category: 'Dining', monthlyAverage: 800 },
    { category: 'Groceries', monthlyAverage: 600 },
    { category: 'Gas', monthlyAverage: 300 },
    { category: 'Shopping', monthlyAverage: 400 },
    { category: 'Bills & Utilities', monthlyAverage: 500 }
  ];

  const monthlyBudget = 3500;

  const handleAddBonus = () => {
    // Mock bonus creation - in real app this would open a modal/form
    const mockBonus: AddBonusForm = {
      cardId: 'new-card',
      cardName: 'New Credit Card',
      cardIssuer: 'Test Bank',
      requiredSpend: 3000,
      deadline: '2025-05-01',
      bonusAmount: 50000,
      bonusType: 'points',
      bonusDescription: '50,000 points after $3,000 spend',
      priority: 'medium'
    };

    createBonusMutation.mutate(mockBonus);
  };

  const handleUpdateSpending = (bonusId: string, amount: number) => {
    updateSpendingMutation.mutate({
      bonusId,
      amount,
      description: 'Manual spending update'
    });
  };

  const handleViewDetails = (bonusId: string) => {
    console.log('View details for bonus:', bonusId);
    // In a real app, this would navigate to a detailed view or open a modal
  };

  const handleFilterChange = (filters: BonusFilter) => {
    setBonusFilters(filters);
  };

  if (bonusesLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading welcome bonuses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome Bonus Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track your credit card welcome bonuses, get AI-powered spending recommendations, 
              and optimize your rewards strategy to maximize value.
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 m-1 rounded-lg">
                <TabsTrigger 
                  value="dashboard" 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="planner"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Spending Planner
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="dashboard" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BonusDashboard
                      bonuses={bonuses}
                      analytics={analytics || {
                        totalBonusesEarned: 0,
                        totalValueEarned: 0,
                        averageCompletionTime: 0,
                        successRate: 0,
                        mostEffectiveCategories: [],
                        spendingPatterns: [],
                        monthlyBreakdown: []
                      }}
                      onAddBonus={handleAddBonus}
                      onUpdateSpending={handleUpdateSpending}
                      onViewDetails={handleViewDetails}
                      onFilterChange={handleFilterChange}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="planner" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SpendingPlanner
                      bonuses={bonuses}
                      userSpendingPatterns={userSpendingPatterns}
                      monthlyBudget={monthlyBudget}
                      onAcceptRecommendation={(rec) => {
                        console.log('Accepted recommendation:', rec);
                      }}
                      onCreatePlan={(plan) => {
                        console.log('Created spending plan:', plan);
                      }}
                    />
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Pay bills early to meet spending requirements safely</li>
                <li>• Buy gift cards for stores you regularly shop at</li>
                <li>• Time large purchases around bonus deadlines</li>
                <li>• Focus on urgent bonuses first</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {analytics?.successRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value Earned</span>
                  <span className="font-medium">
                    ${analytics?.totalValueEarned?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Completion</span>
                  <span className="font-medium">
                    {analytics?.averageCompletionTime || 0} days
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Categories</h3>
              <div className="space-y-2">
                {analytics?.mostEffectiveCategories?.slice(0, 4).map((category) => (
                  <div key={category} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">{category}</span>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
